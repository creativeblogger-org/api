import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import APIException from 'App/Exceptions/APIException'
import Post from 'App/Models/Post'
import Permissions from 'Contracts/Enums/Permissions'

export default class PostsController {
  public async list({ request }: HttpContextContract) {
    const data = await request.validate({
      schema: schema.create({
        limit: schema.number.optional([rules.above(0)]),
        page: schema.number.optional([rules.above(0)]),
      }),
      messages: {
        'limit.number': "La limite d'articles doit être un nombre.",
        'limit.above': "La limite d'articles doit être supérieure à 0.",

        'page.number': 'Le numéro de page doit être un nombre.',
        'page.above': 'Le numéro de page doit être supérieur à 0.',
      },
    })

    let posts = Post.query().orderBy('created_at', 'desc').preload('author')

    if (data.limit && !data.page) {
      await posts.limit(data.limit)
    }

    if (data.limit && data.page) {
      await posts.offset(data.limit * data.page).limit(data.limit)
    }

    ;(await posts).map((post) => post.serializeAttributes({ omit: ['comments'] }))
    return await posts
  }

  // Returns the post with the given slug.
  public async get({ request }: HttpContextContract) {
    const post = await Post.query()
      .preload('author')
      .preload('comments')
      .where('slug', '=', request.param('slug'))
      .first()

    // Check if the post exists.
    if (!post) throw new APIException('Le post demandé est introuvable.', 404)

    return post
  }

  public async new({ request, response, auth }: HttpContextContract) {
    if (auth.user!.permission < Permissions.Redactor)
      throw new APIException("Vous n'avez pas la permission de créer un article.", 403)

    // Defines the post schema for the validation.
    const postSchema = schema.create({
      title: schema.string({ trim: true }, [rules.minLength(3), rules.maxLength(30)]),

      content: schema.string({ trim: true }, [rules.minLength(200), rules.maxLength(10000)]),

      description: schema.string({ trim: true }, [rules.minLength(10), rules.maxLength(100)]),

      tags: schema.string({ trim: true }, [rules.minLength(1), rules.maxLength(15)]),

      slug: schema.string.optional({ trim: true }, [rules.minLength(3), rules.maxLength(30)]),

      image: schema.string.optional({ trim: true }, [rules.minLength(3), rules.maxLength(100)]),
    })

    // Validate the provided data.
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
        'content.maxLength': 'Le contenu doit faire au maximum 2500 caractères.',

        'slug.minLength': 'Le slug doit faire au moins 3 caractères.',
        'slug.maxLength': 'Le slug doit faire au maximum 30 caractères.',

        'image.minLength': 'Le lien doit faire au moins 3 caractères.',
        'image.maxLength': 'Le lien doit faire maximum 100 caractères.',
      },
    })

    // Save the post in the database.
    const post = new Post()
    post.title = data.title
    post.description = data.description
    post.tags = data.tags
    post.content = data.content
    await post.related('author').associate(auth.user!)
    await post.save()

    return response.noContent()
  }

  public async update({ request, response }: HttpContextContract) {
    // Check if the post exists.
    const post = await Post.findBy('slug', request.param('slug'))
    if (!post) throw new APIException('Le post demandé est introuvable.', 404)

    if (!post.hasPermission)
      throw new APIException("Vous n'avez pas la permission de modifier cet article.", 403)

    // Update the post.
    const { title, content } = request.only(['title', 'content'])

    await post.merge({ title, content }).save()

    return response.noContent()
  }

  public async delete({ request, response }: HttpContextContract) {
    // Check if the post exists.
    const post = await Post.findBy('slug', request.param('slug'))
    if (!post) throw new APIException('Le post demandé est introuvable.', 404)

    if (!post.hasPermission) throw new APIException("Vous n'êtes pas l'auteur de cet article.", 403)

    // Delete the post.
    await post.delete()
    return response.noContent()
  }

  public async getByTag({ request }) {
    const post = await Post.query()
      .orderBy('created_at', 'desc')
      .preload('author')
      .where('tags', '=', request.param('tags'))

    if (!post) throw new APIException('Le post demandé est introuvable.', 404)

    return post
  }
}
