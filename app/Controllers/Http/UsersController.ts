import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import APIException from 'App/Exceptions/APIException'
import Post from 'App/Models/Post'
import { rules, schema } from '@ioc:Adonis/Core/Validator'

export default class UsersController {
  // Get all users registered.
  public async list({ auth }: HttpContextContract) {
    if (auth.user?.permission !== 3) {
      throw new APIException(
        "Vous n'avez pas la permission de visualiser l'ensemble des utilisateurs",
        403
      )
    }
    return (await User.all()).map((user) => {
      return user.serialize({
        fields: {
          omit: ['email', 'password'],
        },
      })
    })
  }

  // Get a user by its username.
  public async get({ request }: HttpContextContract) {
    const user = await User.findBy('username', request.param('username'))
    if (!user) throw new APIException("L'utilisateur demandé est introuvable.", 404)

    return user.serialize({
      fields: {
        omit: ['email', 'password'],
      },
    })
  }

  public async delete({ request, response, auth }: HttpContextContract) {
    // Checks the user's permission.
    // const { username } = request.param('username')
    if (auth.user?.permission !== 3)
      throw new APIException('Seul un administrateur peut effectuer cette opération.', 403)

    // Deletes the user.
    const user: any = await User.findBy('username', request.param('username'))
    if (user.permission === 3 || 2) {
      throw new APIException('Vous ne pouvez pas supprimer un administrateur / modérateur !', 403)
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
      if (auth.user?.permission < 2) {
        throw new APIException('Seul un modérateur peut effectuer cette opération.', 403)
      }
      if (auth.user?.permission < 3 && request.param('perms') > 1) {
        throw new APIException('Seul un administrateur peut effectuer cette opération.', 403)
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
}
