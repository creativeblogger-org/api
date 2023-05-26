import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import APIException from 'App/Exceptions/APIException'
import Comment from 'App/Models/Comment'
import Post from 'App/Models/Post'

export default class CommentsController {
  public async new({ request, response, auth }: HttpContextContract) {
    // Check if the post exists.
    const post = await Post.findBy('slug', request.param('slug'))
    if (!post)
      throw new APIException('Le post demandé est introuvable.', 404)
    
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
    await comment.related('post').associate(post)
    await comment.save()

    return response.noContent()
  }

  public async update({ request, response }: HttpContextContract) {
    // Check if the user is the author of the comment.
    const comment = await Comment.findBy('slug', request.param('slug'))
    if (!comment)
      throw new APIException('Le commentaire demandé est introuvable.', 404)

    if (!comment.hasPermission)
      throw new APIException('Vous n\'êtes pas l\'auteur de ce commentaire.', 403)

    // Update the comment.
    const { content } = request.only(['content'])
    await comment
      .merge({ content })
      .save()

    return response.noContent()
  }

  public async delete({ request, response }: HttpContextContract) {
    // Check if the user is the author of the comment.
    const comment = await Comment.findBy('slug', request.param('slug'))
    if (!comment)
      throw new APIException('Le commentaire demandé est introuvable.', 404)

    if (!comment.hasPermission)  
      throw new APIException('Vous n\'êtes pas l\'auteur de ce commentaire.', 403)

    // Delete the comment.
    await comment.delete()
    return response.noContent()
  }
}
