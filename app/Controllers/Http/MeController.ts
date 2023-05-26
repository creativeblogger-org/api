import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Log from 'App/Models/Log'

export default class UsersController {
  // Returns the user currently logged in.
  public async me({ auth }: HttpContextContract) {
    return auth.user!
  }

  // Deletes the user.
  public async delete({ response, auth }: HttpContextContract) {
    await auth.user!.delete()
    await auth.logout()
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

  // Retrieves the logs of the user.
  public async logs({ auth }: HttpContextContract) {
    return await Log.findBy('user', auth.user!.id)
  }
}
