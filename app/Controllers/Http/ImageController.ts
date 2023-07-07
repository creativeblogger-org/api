import Application from '@ioc:Adonis/Core/Application'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ImageController {
  public async upload({ request }: HttpContextContract) {
    const coverImage = request.file('cover_image', {
      size: '10mb',
      extnames: ['jpg', 'png', 'gif'],
    })

    if (!coverImage) {
      return
    }

    if (!coverImage.isValid) {
      return coverImage.errors
    }

    await coverImage.moveToDisk('./')

    await coverImage.move(Application.tmpPath('uploads'))
  }

  public async get({ request }: HttpContextContract) {
    const images = request.files('images')

    for (let image of images) {
      await image.move(Application.tmpPath('uploads'))
    }
  }
}
