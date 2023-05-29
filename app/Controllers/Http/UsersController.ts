import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import APIException from 'App/Exceptions/APIException'

export default class UsersController {
  // Get all users registered.
  public async list({}: HttpContextContract) {
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

  public async delete({ request, response }: HttpContextContract) {
    // Checks the user's permission.
    // const { username } = request.param('username')
    // if (auth.user?.permission !== 2)
    //   throw new APIException('Seul un administrateur peut effectuer cette opération.', 403)

    // Deletes the user.
    // const user = await User.findByOrFail('username', username)
    const user2 = await User.findBy('username', request.param('username'))
    if (!user2) throw new APIException("L'utilisateur est introuvable", 404)
    await user2.delete()
    return response.noContent()
  }
}
