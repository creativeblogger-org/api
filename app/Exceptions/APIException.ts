import { Exception } from '@adonisjs/core/build/standalone'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class APIException extends Exception {
  public async handle(error: this, { response }: HttpContextContract) {
    return response.status(error.status).json({
      errors: [
        {
          message: error.message,
        },
      ],
    })
  }
}