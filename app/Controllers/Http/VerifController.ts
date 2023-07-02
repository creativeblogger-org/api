import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import APIException from 'App/Exceptions/APIException'

export default class VerifController {
  public async iswriter({ auth }: HttpContextContract) {
    if (auth.user?.permission !== 1 || 2 || 3) {
      throw new APIException('Seul un rédacteur peut créer un nouvel article !')
    }
  }
}
