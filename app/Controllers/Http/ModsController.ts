import Mail from '@ioc:Adonis/Addons/Mail'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import APIException from 'App/Exceptions/APIException'
import User from 'App/Models/User'
import Permissions from 'Contracts/Enums/Permissions'

export default class ModsController {
  public async suspend({ auth, request, response }: HttpContextContract) {
    if (auth.user && auth.user?.permission < Permissions.Moderator) {
      throw new APIException("Vous n'avez pas la permission de faire ceci !", 401)
    }
    const target = await User.findBy('id', request.param('id'))
    if (!target) {
      throw new APIException("Impossible de trouver l'utilisateur visé.", 404)
    }
    if (target.permission === -1) {
      throw new APIException("L'utilisateur est déjà suspendu !", 405)
    }

    target.permission = Permissions.SuspendedAccount
    target.merge(target).save()

    await Mail.send((message) => {
      message
        .from('email.confirmation@creativeblogger.org')
        .to(target.email)
        .subject('Votre compte à été suspendu !')
        .htmlView('emails/suspend', { name: target.username })
    })

    return response.noContent()
  }
  public async unsuspend({ auth, request, response }: HttpContextContract) {
    if (auth.user && auth.user?.permission < Permissions.Moderator) {
      throw new APIException("Vous n'avez pas la permission de faire ceci !", 401)
    }
    const target = await User.findBy('id', request.param('id'))
    if (!target) {
      throw new APIException("Impossible de trouver l'utilisateur visé.", 404)
    }
    if (target.permission !== -1) {
      throw new APIException("L'utilisateur n'est pas suspendu !", 405)
    }

    target.permission = Permissions.User
    target.merge(target).save()

    await Mail.send((message) => {
      message
        .from('email.confirmation@creativeblogger.org')
        .to(target.email)
        .subject("Votre compte n'est plus suspendu !")
        .htmlView('emails/unsuspend', { name: target.username })
    })

    return response.noContent()
  }
}
