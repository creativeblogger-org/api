import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Database from '@ioc:Adonis/Lucid/Database'
import APIException from 'App/Exceptions/APIException'
import Comment from 'App/Models/Comment'
import Post from 'App/Models/Post'
import Permissions from 'Contracts/Enums/Permissions'

export default class CommentsController {
  public async list({ request, response }: HttpContextContract) {
    const postId = request.param('id')
    const page = request.input('page', 0)
    const perPage = 20

    const post = await Post.find(postId)
    if (!post) {
      throw new APIException('Le post demandé est introuvable.', 404)
    }

    const totalComments = await Database.from('comments').where('post', post.id).count('* as total')
    const commentCount = totalComments[0]?.total || 0

    response.header('nbComments', commentCount.toString())

    const comments = await Comment.query()
      .preload('author')
      .orderBy('created_at', 'desc')
      .where('post', '=', postId)
      .paginate(page, perPage)

    return comments
  }

  public async new({ request, response, auth }: HttpContextContract) {
    if(auth.user?.permission === Permissions.SuspendedAccount) {
      throw new APIException("Votre compte est suspendu ! Vous ne pouvez pas commentez.")
    }
    const post = await Post.findBy('slug', request.param('slug'))
    if (!post) throw new APIException('Le post demandé est introuvable.', 404)

    const commentSchema = schema.create({
      content: schema.string({ trim: true }, [rules.minLength(5), rules.maxLength(200)]),
    })

    const data = await request.validate({
      schema: commentSchema,
      messages: {
        'content.required': 'Le contenu est requis.',
        'content.minLength': 'Le contenu doit faire au moins 5 caractères.',
        'content.maxLength': 'Le contenu doit faire au maximum 200 caractères.',
      },
    })

    const comment = new Comment()
    comment.content = data.content
    await comment.related('author').associate(auth.user!)
    await comment.related('post').associate(post)
    await comment.save()

    return response.noContent()
  }

  public async update({ request, response }: HttpContextContract) {
    const comment = await Comment.findByOrFail('id', request.param('id'))
    if (!comment) throw new APIException('Le commentaire demandé est introuvable.', 404)

    if (!comment.hasPermission)
      throw new APIException("Vous n'êtes pas l'auteur de ce commentaire.", 403)

    const { content } = request.only(['content'])
    await comment.merge({ content }).save()

    return response.noContent()
  }

  public async delete({ request, response }: HttpContextContract) {
    const comment = await Comment.findByOrFail('id', request.param('id'))
    if (!comment) throw new APIException('Le commentaire demandé est introuvable.', 404)

    if (!comment.hasPermission)
      throw new APIException("Vous n'êtes pas l'auteur de ce commentaire.", 403)

    await comment.delete()
    return response.noContent()
  }
}
