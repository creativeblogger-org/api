import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import APIException from 'App/Exceptions/APIException'

export default class BanController {
  public async ban({ response, auth }: HttpContextContract) {
    if (auth.user?.permission == 2) {
      return response.noContent()
    } else {
      throw new APIException("Vous n'avez pas la permission de bannir des utilisateurs", 403)
    }
  }
}
