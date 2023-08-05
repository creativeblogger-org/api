import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import APIException from 'App/Exceptions/APIException'
import Log from 'App/Models/Log'

export default class UsersController {
  // Returns the user currently logged in.
  public async me({ auth }: HttpContextContract) {
    return auth.user!
  }

  // Deletes the user.
  public async delete({ response, auth }: HttpContextContract) {
    if (auth.user?.permission === 3) {
      throw new APIException(
        'Vous êtes un administrateur, votre compte ne peut pas être supprimé !',
        403
      )
    }
    await auth.user!.delete()
    await auth.logout()
    return response.noContent()
  }

  public async update({ request, response, auth }: HttpContextContract) {
    // Retrieves the essential elements to update.
    const { email, username, password } = request.only(['email', 'username', 'password'])

    const user = auth.user!

    // Update email and username if provided.
    if (
      email &&
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,253}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,253}[a-zA-Z0-9])?)*$/.test(
        email
      )
    ) {
      user.email = email
    } else if (email) {
      throw new APIException("L'adresse email n'est pas valide.", 403)
    }

    if (
      username &&
      /^[a-zA-Z][\w]{2,}$/.test(username) &&
      username.length > 4 &&
      username.length < 12
    ) {
      user.username = username
    } else if (username && username.length <= 4) {
      throw new APIException("Le nom d'utilisateur doit faire plus de 4 caractères.", 403)
    } else if (username && username.length > 12) {
      throw new APIException("Le nom d'utilisateur doit faire moins de 12 caractères.", 403)
    } else if (username) {
      throw new APIException("Le nom d'utilisateur n'est pas valide.", 403)
    }

    if (password && password.length > 5) {
      user.password = password
    } else if (password && password.length <= 5) {
      throw new APIException('Le mot de passe doit faire plus de 5 caractères.')
    }
    // Updates the user.
    await auth.user!.merge(user).save()

    return response.noContent()
  }

  // Retrieves the logs of the user.
  public async logs({ auth }: HttpContextContract) {
    return await Log.findBy('user', auth.user!.id)
  }
}
