import Mail from '@ioc:Adonis/Addons/Mail'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import APIException from 'App/Exceptions/APIException'
import User from 'App/Models/User'
import Permissions from 'Contracts/Enums/Permissions'

export default class ModsController {
  public async suspend({ auth, request, response }: HttpContextContract) {
    if(auth.user && auth.user?.permission < Permissions.Moderator) {
        throw new APIException("Vous n'avez pas la permission de faire ceci !")
    }
    const target = await User.findBy("id", request.param('id'))
    if(!target) {
        throw new APIException("Impossible de trouver l'utilisateur visé.")
    }

    target.permission = Permissions.SuspendedAccount
    target.merge(target).save()

    await Mail.send((message) => {
      message
        .from('email.confirmation@creativeblogger.org')
        .to(target.email)
        .subject('Votre compte à été suspendu !')
        .htmlView('emails/welcome', { name: 'Virk' })
    })


    return response.noContent()
  }
}
