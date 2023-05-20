import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import APIException from 'App/Exceptions/APIException'
import Post from 'App/Models/Post'
import Permissions from 'Contracts/Enums/Permissions'

export default class PostsController {
  public async list({ request }: HttpContextContract) {
    const data = await request.validate({
      schema: schema.create({
        limit: schema.number.optional([
          rules.above(0),
        ]),
        page: schema.number.optional([
          rules.above(0)
        ]),
      }),
      messages: {
        'limit.number': 'La limite d\'articles doit être un nombre.',
        'limit.above': 'La limite d\'articles doit être supérieure à 0.',

        'page.number': 'Le numéro de page doit être un nombre.',
        'page.above': 'Le numéro de page doit être supérieur à 0.',
      },
    })

    let posts = Post
      .query()
      .preload('author')
      .preload('comments')
    
    if (data.limit && !data.page) {
      await posts.limit(data.limit)
    }

    if (data.limit && data.page) {
      await posts
        .offset(data.limit * data.page)
        .limit(data.limit)
    }
    
    return await posts
  }

  // Returns the post with the given slug.
  public async get({ request, auth }: HttpContextContract) {
    const post = await Post
      .query()
      .preload('author')
      .preload('comments')
      .where('slug', '=', request.param('slug'))
      .first()

    // Check if the post exists.
    if (!post)
      throw new APIException('Le post demandé est introuvable.', 404)

    return {
      ...post.serialize(),
      has_permission: (auth.user! || {permission: Permissions.User}).permission >= Permissions.Moderator || post.author === auth.user!,
    }
  }

  public async new({ request, response, auth }: HttpContextContract) {
    if (auth.user!.permission === Permissions.User)
      throw new APIException('Vous n\'avez pas la permission de créer un article.', 403)

    // Defines the post schema for the validation.
    const postSchema = schema.create({
      title: schema.string({ trim: true }, [
        rules.minLength(3),
        rules.maxLength(30),
      ]),

      content: schema.string({ trim: true }, [
        rules.minLength(200),
        rules.maxLength(2500),
      ]),

      slug: schema.string.optional({ trim: true }, [
        rules.minLength(3),
        rules.maxLength(30)
      ]),
    })

    // Validate the provided data.
    const data = await request.validate({
      schema: postSchema,
      messages: {
        'title.required': 'Le titre est requis.',
        'title.minLength': 'Le titre doit faire au moins 3 caractères.',
        'title.maxLength': 'Le titre doit faire au maximum 30 caractères.',

        'content.required': 'Le contenu est requis.',
        'content.minLength': 'Le contenu doit faire au moins 200 caractères.',
        'content.maxLength': 'Le contenu doit faire au maximum 2500 caractères.',

        'slug.minLength': 'Le slug doit faire au moins 3 caractères.',
        'slug.maxLength': 'Le slug doit faire au maximum 30 caractères.',
      },
    })

    // Save the post in the database.
    const post = new Post()
    post.title = data.title
    post.content = data.content
    await post.related('author').associate(auth.user!)
    await post.save()

    return response.noContent()
  }

  public async delete({ request, response, auth }: HttpContextContract) {
    // Check if the user is the author of the post.
    const post = await Post.findOrFail(request.param('id'))
    if (post.author !== auth.user!
        && auth.user!.permission === Permissions.User)
      throw new APIException('Vous n\'êtes pas l\'auteur de cet article.', 403)

    // Delete the post.
    await post.delete()
    return response.noContent()
  }

  public async update({ request, response, auth }: HttpContextContract) {
    // Check if the user is the author of the post.
    const post = await Post.findOrFail(request.param('id'))
    if (post.author !== auth.user!
        && auth.user!.permission === Permissions.User)
      throw new APIException('Vous n\'êtes pas l\'auteur de cet article.', 403)

    // Update the post.
    const { title, content } = request.only([
      'title',
      'content',
    ])

    await post
      .merge({ title, content })
      .save()

    return response.noContent()
  }
}
