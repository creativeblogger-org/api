import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import APIException from 'App/Exceptions/APIException'

export default class ImageController {
  public async upload({ request }: HttpContextContract) {
    const coverImage = request.file('image', {
      size: '10mb',
      extnames: ['jpg', 'png', 'gif'],
    })

    if (!coverImage) {
      return new APIException('Il faut une image !')
    }

    if (!coverImage.isValid) {
      return coverImage.errors
    }

    await coverImage.moveToDisk('/')

    await coverImage.move('/')

    return 'YEAH'
  }
}
