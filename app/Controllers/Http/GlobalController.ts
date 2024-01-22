import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { rules, schema } from '@ioc:Adonis/Core/Validator'
import APIException from 'App/Exceptions/APIException'
import Post from 'App/Models/Post'
import Permissions from 'Contracts/Enums/Permissions'

export default class GlobalController {
  public async ask_certif({ request, response }: HttpContextContract) {
    const post = await Post.findBy('slug', request.param('slug'))

    if (!post) {
      throw new APIException('Le post demandé est introuvable', 404)
    }
    if (!post.hasPermission) {
      throw new APIException("Vous n'êtes pas l'auteur de cet article !", 401)
    }
    if (post.views < 50) {
      throw new APIException("Votre post n'est pas éligible à la certification")
    }
    if (post.ask_verif === true) {
      throw new APIException('Le post est déjà sous demande de certification')
    }
    post.ask_verif = true
    await post.save()

    return response.noContent()
  }

  public async list({ request, auth }: HttpContextContract) {
    if (!auth.user) {
      throw new APIException('Vous devez être connecté pour faire ça !')
    }
    if (auth.user?.permission < Permissions.Redactor) {
      throw new APIException("Vous n'avez pas la permission de faire ceci !", 401)
    }
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

    let posts = Post.query()
      .orderBy('created_at', 'desc')
      .preload('author')
      .where('author', '=', auth.user.id)
      .select([
        'id',
        'title',
        'slug',
        'created_at',
        'updated_at',
        'views',
        'likes',
        'image',
        'description',
        'author',
        'tags',
        'views',
      ])

    if (data.limit && !data.page) {
      await posts.limit(data.limit)
    }

    if (data.limit && data.page) {
      await posts.offset(data.limit * data.page).limit(data.limit)
    }

    ;(await posts).map((post) => post.serializeAttributes({ omit: ['comments'] }))
    return await posts
  }
}
