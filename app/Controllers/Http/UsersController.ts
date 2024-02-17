import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import APIException from 'App/Exceptions/APIException'
import Post from 'App/Models/Post'
import { rules, schema } from '@ioc:Adonis/Core/Validator'
import Permissions from 'Contracts/Enums/Permissions'

export default class UsersController {
  public async list({ auth }: HttpContextContract) {
    if (auth.user?.permission !== Permissions.Administrator) {
      throw new APIException(
        "Vous n'avez pas la permission de visualiser l'ensemble des utilisateurs",
        401
      )
    }
    return (await User.all()).map((user) => {
      return user.serialize({
        fields: {
          omit: ['email', 'password', 'birthdate', 'updated_at'],
        },
      })
    })
  }

  public async get({ request, response }: HttpContextContract) {
    const user = await User.findBy('username', request.param('username'))
    if (!user) throw new APIException("L'utilisateur demandé est introuvable.", 404)

    const actor = {
      '@context': ['https://www.w3.org/ns/activitystreams', 'https://w3id.org/security/v1'],
      'type': 'Person',
      'id': `https://api.creativeblogger.org/users/${user.username}`,
      'username': user.username,
      'acct': `${user.username}@api.creativeblogger.org`,
      'display_name': `${user.username}`,
      'url': `https://api.creativeblogger.org/users/${user.username}`,
      'avatar': `${user.pp}`,
      'avatar_static': `${user.pp}`,
      'note': `${user.biography}`,
      'note_text': `${user.biography}`,
      'created_at': `${user.createdAt}`,
      'inbox': `https://api.creativeblogger.org${request.url()}inbox`,
      'outbox': `https://api.creativeblogger.org/${request.url()}outbox/`,
      'publicKey': {
        id: `https://api.creativeblogger.org${request.url()}inbox#main-key`,
        owner: `https://api.creativeblogger.org${request.url()}inbox`,
        publicKeyPem: `-----BEGIN PUBLIC KEY-----
        MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxrhGiKRbPMyHNTbBuFc3
        TKlAXzYoFNr3JnS+PzqBfwtFi+wHBrEGktjaG0LDQWzQZoWk1ovPOvUwBcUolrK5
        CEcpMKgETzLiynQFz3QpVvtW0furg02T28L7CVnELNYSgHaw60gzpjAwkGTWsUAI
        FM6mRB6lK+EACbs6egJNaRjcHuUaJO78QUvsF/9cfIUmB3qF8XDMnrOLTfDVuRb1
        nJyVcj/0/MZEO2V5EYA323ekh5avgX1y0Ig7mxPoQhrRen1plhuUps8VI6pP224M
        5SHHQ+wWHr/JzVc60EPPHquI7K9dMf3jXfWOf0vTDetU6TvZkBEJSUMqr7j42+vq
        mQIDAQAB
        -----END PUBLIC KEY-----
        `,
      },
    }

    return response.status(200).json(actor)

    // return user.serialize({
    //   fields: {
    //     omit: ['email', 'password', 'birthdate', 'updated_at'],
    //   },
    // })
  }

  public async delete({ request, response, auth }: HttpContextContract) {
    if (auth.user?.permission !== Permissions.Administrator)
      throw new APIException('Seul un administrateur peut effectuer cette opération.', 401)

    const user: any = await User.findBy('username', request.param('username'))
    if (user.permission === Permissions.Administrator || Permissions.Redactor) {
      throw new APIException('Vous ne pouvez pas supprimer un administrateur / modérateur !', 401)
    }
    await user.delete()
    return response.noContent()
  }

  public async upgrade({ request, response, auth }: HttpContextContract) {
    const data = await request.validate({
      schema: schema.create({
        permission: schema.number(),
      }),
      messages: {
        'permission.required': 'La permission est obligatoire',
      },
    })
    const user = await User.findBy('username', request.param('username'))
    if (!user) throw new APIException("L'utilisateur demandé est introuvable.", 404)

    if (auth.user?.permission) {
      if (auth.user?.permission < Permissions.Redactor) {
        throw new APIException('Seul un modérateur peut effectuer cette opération.', 401)
      }
      if (
        auth.user?.permission < Permissions.Administrator &&
        request.param('perms') > Permissions.Redactor
      ) {
        throw new APIException('Seul un administrateur peut effectuer cette opération.', 401)
      }
    }

    user.permission = data.permission

    await user.merge(user).save()

    return response.noContent()
  }

  public async posts({ request }: HttpContextContract) {
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
      ])
      .where('author', '=', request.param('id'))

    if (data.limit && !data.page) {
      await posts.limit(data.limit)
    }

    if (data.limit && data.page) {
      await posts.offset(data.limit * data.page).limit(data.limit)
    }

    ;(await posts).map((post) => post.serializeAttributes({ omit: ['comments'] }))
    return await posts
  }
  public async getActivityPubProfile({ response, request }: HttpContextContract) {
    const user = await User.findBy('username', request.param('username'))
    if (!user) {
      throw new APIException('Utilisateur non trouvé !', 404)
    }

    const actor = {
      '@context': ['https://www.w3.org/ns/activitystreams', 'https://w3id.org/security/v1'],
      'id': `https://api.creativeblogger.org/users/${user.username}`,
      'acct': `${user.username}@api.creativeblogger.org`,
      'url': `https://api.creativeblogger.org/users/${user.username}`,
      'type': 'Person',
      'avatar': `${user.pp}`,
      'avatar_static': `${user.pp}`,
      'preferredUsername': user.username,
      'display_name': `${user.username}`,
      'note': `${user.biography}`,
      'note_text': `${user.biography}`,
      'inbox': `https://api.creativeblogger.org${request.url()}/inbox`,
      'publicKey': {
        id: `https://api.creativeblogger.org${request.url()}/inbox#main-key`,
        owner: `https://api.creativeblogger.org${request.url()}/inbox`,
        publicKeyPem: `-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxrhGiKRbPMyHNTbBuFc3\nTKlAXzYoFNr3JnS+PzqBfwtFi+wHBrEGktjaG0LDQWzQZoWk1ovPOvUwBcUolrK5\nCEcpMKgETzLiynQFz3QpVvtW0furg02T28L7CVnELNYSgHaw60gzpjAwkGTWsUAI\nFM6mRB6lK+EACbs6egJNaRjcHuUaJO78QUvsF/9cfIUmB3qF8XDMnrOLTfDVuRb1\nnJyVcj/0/MZEO2V5EYA323ekh5avgX1y0Ig7mxPoQhrRen1plhuUps8VI6pP224M\n5SHHQ+wWHr/JzVc60EPPHquI7K9dMf3jXfWOf0vTDetU6TvZkBEJSUMqr7j42+vq\nmQIDAQAB\n-----END PUBLIC KEY-----
        `,
      },
    }

    return response.status(200).json(actor)
  }
  public async handleActivityPubInbox({ request, params }: HttpContextContract) {
    const { username } = params
    const activity = request.body()

    // Traitez l'activité reçue dans l'inbox
    console.log(`Received activity for user ${username}:`, activity)

    // Ajoutez une logique pour gérer différentes activités (Follow, Create, etc.)

    return 'OK'
  }
}
