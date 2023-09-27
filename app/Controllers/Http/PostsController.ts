import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Database from '@ioc:Adonis/Lucid/Database'
import APIException from 'App/Exceptions/APIException'
import Post from 'App/Models/Post'
import Permissions from 'Contracts/Enums/Permissions'
import Mastodon from 'mastodon-api'
import Env from '@ioc:Adonis/Core/Env'
import Application from '@ioc:Adonis/Core/Application'
import sharp from 'sharp'
import fs from 'fs/promises'

const M = new Mastodon({
  client_key: Env.get('MASTODON_CLIENT_KEY'),
  client_secret: Env.get('MASTODON_CLIENT_SECRET'),
  access_token: Env.get('MASTODON_ACCESS_TOKEN'),
  timeout_ms: 60 * 1000,
  api_url: 'https://mastodon.social/api/v1/',
})

export default class PostsController {
  public async list({ request, response, auth }: HttpContextContract) {
    const data = await request.validate({
      schema: schema.create({
        limit: schema.number.optional([rules.above(0)]),
        page: schema.number.optional([rules.above(0)]),
        q: schema.string.optional([rules.above(0)]),
        tag: schema.string.optional([rules.above(0)]),
        user: schema.string.optional([rules.above(0)]),
      }),
      messages: {
        'limit.number': "La limite d'articles doit être un nombre.",
        'limit.above': "La limite d'articles doit être supérieure à 0.",

        'page.number': 'Le numéro de page doit être un nombre.',
        'page.above': 'Le numéro de page doit être supérieur à 0.',
      },
    })

    let query = Post.query().orderBy('created_at', 'desc').preload('author')
    let totalPosts = Database.from('posts')

    if (auth.user) {
      const today = new Date()
      const yearOfUser = today.getUTCFullYear() - auth.user.birthdate.year
      query = query.where('required_age', '<=', yearOfUser)
      if (auth.user.permission > 0) {
        query = Post.query().orderBy('created_at', 'desc').preload('author')
      }
    } else {
      query = query.where('required_age', '=', 0)
    }

    if (data.limit && !data.page) {
      query = query.limit(data.limit)
      totalPosts = totalPosts.limit(data.limit)
    }

    if (data.limit && data.page) {
      query = query.offset(data.limit * data.page).limit(data.limit)
      totalPosts = totalPosts.offset(data.limit * data.page).limit(data.limit)
    }

    if (data.q) {
      let searchText = data.q
      searchText = decodeURIComponent(searchText)
      const keywords = searchText.split(' ')
      query = query.where((query) => {
        for (const keyword of keywords) {
          query.where('title', 'like', `%${keyword}%`)
        }
        totalPosts = totalPosts.where('title', 'like', `%${keywords}%`)
      })
    }

    if (data.tag) {
      query = query.where('tags', '=', data.tag)
      totalPosts.where('tags', '=', data.tag)
    }

    if (data.user) {
      query = query.where('author', '=', data.user)
      totalPosts = totalPosts.where('author', data.user)
    }

    var slt = await query

    var slt2 = await totalPosts.count('* as total')

    response.header('nbposts', slt2[0]?.total || 0)

    return slt
  }

  public async get({ request, response }: HttpContextContract) {
    const post = await Post.query()
      .preload('author')
      .preload('comments', (query) => query.limit(20))
      .where('slug', '=', request.param('slug'))
      .first()

    if (!post) {
      throw new APIException('Le post demandé est introuvable.', 404)
    }

    const totalComments = await Database.from('comments').where('post', post.id).count('* as total')
    const commentCount = totalComments[0]?.total || 0

    response.header('nbComments', commentCount.toString())

    return post
  }

  public async new({ request, response, auth }: HttpContextContract) {
    if (auth.user!.permission < Permissions.Redactor)
      throw new APIException("Vous n'avez pas la permission de créer un article.", 403)

    const postSchema = schema.create({
      title: schema.string({ trim: true }, [rules.minLength(3), rules.maxLength(30)]),

      content: schema.string({ trim: true }, [rules.minLength(200), rules.maxLength(10000)]),

      description: schema.string({ trim: true }, [rules.minLength(10), rules.maxLength(100)]),

      tags: schema.string({ trim: true }, [rules.minLength(1), rules.maxLength(15)]),

      slug: schema.string.optional({ trim: true }, [rules.minLength(3), rules.maxLength(30)]),

      image: schema.string({ trim: true }, [rules.minLength(3), rules.maxLength(100)]),

      required_age: schema.number(),
    })

    const data = await request.validate({
      schema: postSchema,
      messages: {
        'title.required': 'Le titre est requis.',

        'description.required': 'La description de cet article est requise.',
        'description.minLength': 'La description de cet article doit faire au moins 10 caractères.',
        'description.naxLength':
          'La description de cet article doit faire au maximum 100 caractères.',

        'title.minLength': 'Le titre doit faire au moins 3 caractères.',
        'title.maxLength': 'Le titre doit faire au maximum 30 caractères.',

        'tags.required': 'Vous devez ajouter un tag à votre article.',
        'tags.minLength': 'Tag trop court',
        'tags.maxLength': 'Tag trop long',

        'content.required': 'Le contenu est requis.',
        'content.minLength': 'Le contenu doit faire au moins 200 caractères.',
        'content.maxLength': 'Le contenu doit faire au maximum 10000 caractères.',

        'slug.minLength': 'Le slug doit faire au moins 3 caractères.',
        'slug.maxLength': 'Le slug doit faire au maximum 30 caractères.',

        'image.required': 'Le lien vers votre image est requis !',
        'image.minLength': 'Le lien doit faire au moins 3 caractères.',
        'image.maxLength': 'Le lien doit faire maximum 100 caractères.',

        'required_age': 'La restriction infantile est obligatoire !',
      },
    })

    const post = new Post()
    post.title = data.title
    post.description = data.description
    post.tags = data.tags
    post.content = data.content
    post.image = data.image
    post.is_last = false
    post.required_age = data.required_age
    post.likes = 0
    await post.related('author').associate(auth.user!)
    await post.save()

    const status = `
    😍  Nouvel article sur Creative Blogger ! 😍 
     - ${post.title}
     ${post.description}
    Lien : https://creativeblogger.org/posts/${post.slug}
  `

    try {
      await M.post('statuses', { status })
      console.log('Article posté sur Mastodon !')
    } catch (error) {
      console.error('Erreur lors de la publication sur Mastodon :', error)
    }

    return response.noContent()
  }

  public async update({ request, response }: HttpContextContract) {
    const post = await Post.findBy('slug', request.param('slug'))
    if (!post) throw new APIException('Le post demandé est introuvable.', 404)

    if (!post.hasPermission)
      throw new APIException("Vous n'avez pas la permission de modifier cet article.", 403)

    const { title, content, description, image, tags } = request.only([
      'title',
      'content',
      'description',
      'image',
      'tags',
    ])

    await post.merge({ title, content, description, image, tags }).save()

    return response.noContent()
  }

  public async delete({ request, response }: HttpContextContract) {
    const post = await Post.findBy('slug', request.param('slug'))
    if (!post) throw new APIException('Le post demandé est introuvable.', 404)

    if (!post.hasPermission) throw new APIException("Vous n'êtes pas l'auteur de cet article.", 403)

    await post.delete()
    return response.noContent()
  }

  public async upload({ request, response }: HttpContextContract) {
    const image = request.file('image')

    if (!image) {
      throw new APIException("Il n'y a aucun fichier à télécharger", 404)
    }

    const fileName = image.clientName
    const resizedFileName = fileName
    const resizedImagePath = Application.publicPath() + '/posts/' + resizedFileName

    try {
      await image.move(Application.tmpPath(), {
        name: fileName,
        overwrite: true,
      })

      await sharp(Application.tmpPath() + '/' + fileName)
        .resize(104)
        .toFile(resizedImagePath)

      await fs.unlink(Application.tmpPath() + '/' + fileName)

      return response.ok({ path: resizedFileName })
    } catch (error) {
      throw new APIException("Erreur durant l'upload", 500)
    }
  }

  public async like({ request }: HttpContextContract) {
    const post = await Post.findBy('slug', request.param('slug'))
    if (post) {
      post.likes = post.likes + 1
      post.save()
    }
  }
}
