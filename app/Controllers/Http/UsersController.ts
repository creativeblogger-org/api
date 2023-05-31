import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import APIException from 'App/Exceptions/APIException'

export default class UsersController {
  // Get all users registered.
  public async list({ auth }: HttpContextContract) {
    if (auth.user?.permission !== 2) {
      throw new APIException(
        "Vous n'avez pas la permission de visualiser l'ensemble des utilisateurs",
        403
      )
    }
    return (await User.all()).map((user) => {
      return user.serialize({
        fields: {
          omit: ['email', 'created_at', 'updated_at'],
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
        omit: ['email', 'created_at', 'updated_at'],
      },
    })
  }

  public async delete({ request, response, auth }: HttpContextContract) {
    // Checks the user's permission.
    const { username } = request.param('username')
    if (auth.user?.permission !== 2)
      throw new APIException('Seul un administrateur peut effectuer cette opération.', 403)

    // Deletes the user.
    const user = await User.findByOrFail('username', username)
    if (user.permission === 2) {
      throw new APIException('Vous ne pouvez pas supprimer un administrateur !', 403)
    }
    await user.delete()
    return response.noContent()
  }
}
