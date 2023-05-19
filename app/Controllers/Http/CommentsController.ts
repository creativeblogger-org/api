import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Comment from 'App/Models/Comment'
import Post from 'App/Models/Post'
import Permissions from 'Contracts/Enums/Permissions'

export default class CommentsController {
  public async new({ request, response, auth }: HttpContextContract) {
    // Defines the comment schema for the validation.
    const commentSchema = schema.create({
      content: schema.string({ trim: true }, [
        rules.minLength(5),
        rules.maxLength(200),
      ]),
    })

    // Validate the provided data.
    const data = await request.validate({
      schema: commentSchema,
      messages: {
        'content.required': 'Le contenu est requis.',
        'content.minLength': 'Le contenu doit faire au moins 200 caractères.',
        'content.maxLength': 'Le contenu doit faire au maximum 2500 caractères.',
      },
    })

    // Save the comment in the database.
    const comment = new Comment()
    comment.content = data.content
    await comment.related('author').associate(auth.user!)
    await comment.related('post').associate(await Post.findOrFail(request.param('post')))
    await comment.save()

    return response.noContent()
  }

  public async delete({ request, response, auth }: HttpContextContract) {
    // Check if the user is the author of the comment.
    const comment = await Comment.findOrFail(request.param('id'))
    if (comment.author !== auth.user!
        && auth.user!.permission === Permissions.User) {
      return response.unauthorized('Vous n\'êtes pas l\'auteur de ce commentaire.')
    }

    // Delete the comment.
    await comment.delete()
    return response.noContent()
  }
  
  public async update({ request, response, auth }: HttpContextContract) {
    // Check if the user is the author of the comment.
    const comment = await Comment.findOrFail(request.param('id'))
    if (comment.author !== auth.user!
        && auth.user!.permission === Permissions.User) {
      return response.unauthorized('Vous n\'êtes pas l\'auteur de ce commentaire.')
    }

    // Update the comment.
    const { content } = request.only(['content'])
    await comment
      .merge({ content })
      .save()

    return response.noContent()
  }
}
