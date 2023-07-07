import Application from '@ioc:Adonis/Core/Application'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ImageController {
  public async upload({ request }: HttpContextContract) {
    const coverImage = request.file('cover_image')

    if (coverImage) {
      await coverImage.move(Application.tmpPath('uploads'))
    }
  }
}
