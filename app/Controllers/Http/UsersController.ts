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

  public async get({ request }: HttpContextContract) {
    const user = await User.findBy('username', request.param('username'))
    if (!user) throw new APIException("L'utilisateur demandé est introuvable.", 404)

    return user.serialize({
      fields: {
        omit: ['email', 'password', 'birthdate', 'updated_at'],
      },
    })
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
      'id': user.id.toString(),
      'type': 'Person',
      'preferredUsername': user.username,
      'inbox': `${request.url()}/inbox`,
      'publicKey': {
        id: `${request.url()}/inbox#main-key`,
        owner: `${request.url()}/inbox`,
        publicKeyPem: `-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvsATXfA5fNdL4gyh2UsN\nWRqVNJK7ubzxRy+53Ir/XVbUJg1vvCHmrYJlX/L+jbUqPcGvuXoB1P9wxnWvuycH\njqYCy1HKD9BA4Wa/veZJoN51RJuHl/3TMUWjRnmlhjlhJedYAnq+ANppB2/RglQC\nGyOD1SyW8WeF9UVtq5Upz5VeId9A1+IGLsaUX1Zfj340KQzB0eB8QEbQZX6oFayw\ncobG1ivJlzOL0j5bDNyRQQCD09h1m8kepEb9Dp4EhilcbqZBKkiavgotNhYNCNCU\nEwIvMMLRDeIXdNAYqWexdwRIKsF5WZIWs7vbo+68hdqIfvkadVUNXA4kkrDAsRvL\nwQIDAQAB\n-----END PUBLIC KEY-----`,
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
