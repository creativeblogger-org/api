import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Application from '@ioc:Adonis/Core/Application'
import fs from 'fs/promises'

export default class ImageController {
  public async upload({ request, response }: HttpContextContract) {
    const image = request.file('image')
    const name = request.param('id')

    if (!image) {
      return response.badRequest('No image file uploaded')
    }

    const fileName = `${name}.${image.extname}`
    const path = `uploads/${fileName}`

    try {
      await image.move(Application.publicPath(path))

      if (!image.isValid) {
        return response.badRequest(image.errors)
      }

      return response.ok({ path })
    } catch (error) {
      return response.internalServerError('Failed to upload image')
    }
  }

  public async show({ params, response }: HttpContextContract) {
    const imageName = params.imageName

    try {
      // Vérifiez si le fichier existe avant de renvoyer une réponse
      const imagePath = Application.publicPath(`uploads/${imageName}/${imageName}`)
      await fs.access(imagePath)

      // Renvoyer le fichier image si tout est bon
      return response.download(imagePath)
    } catch (error) {
      // Si le fichier n'existe pas ou s'il y a une autre erreur, renvoyer une réponse 404
      return response.notFound()
    }
  }
}
