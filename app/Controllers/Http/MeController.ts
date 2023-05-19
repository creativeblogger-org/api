import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Permissions from 'Contracts/Enums/Permissions'
import User from 'App/Models/User'

export default class UsersController {
  // Returns the user currently logged in.
  public async me({ auth }: HttpContextContract) {
    return auth.user!
  }

  // Deletes the user.
  public async delete({ request, response, auth }: HttpContextContract) {
    const { id } = request.only(['id'])
    if (id && auth.user!.permission === Permissions.Administrator) {
      const user = await User.findOrFail(id)
      await user.delete()
    } else { 
      await auth.user!.delete()
      await auth.logout()
    }

    return response.noContent()
  }

  public async update({ request, response, auth }: HttpContextContract) {
    // Retrieves the essential elements to update.
    const { email, username, password } = request.only([
      'email',
      'username',
      'password'
    ])

    // Updates the user.
    await auth.user!
      .merge({ email, username, password })
      .save()

    return response.noContent()
  }
}
