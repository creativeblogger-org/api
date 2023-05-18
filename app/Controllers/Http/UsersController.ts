import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
export default class UsersController {
  // Returns the user currently logged in.
  public async me({ auth }: HttpContextContract) {
    return auth.user!
  }

  // Deletes the user.
  public async delete({ response, auth }: HttpContextContract) {
    auth.user!.delete()
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
