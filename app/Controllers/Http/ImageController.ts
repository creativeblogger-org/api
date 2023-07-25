import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Application from '@ioc:Adonis/Core/Application'
import fs from 'fs/promises'
import APIException from 'App/Exceptions/APIException'

export default class ImageController {
  public async upload({ request, response }: HttpContextContract) {
    const image = request.file('image')
    const name = request.param('id')

    if (!image) {
      throw new APIException("Il n'y a aucun fichier à télécharger", 404)
    }

    const fileName = `${name}.${image.extname}`
    const path = `uploads/${fileName}`

    try {
      await image.move(Application.publicPath(), {
        name: fileName,
        overwrite: true, // Cette option permettra de remplacer le fichier s'il existe déjà
      })

      return response.ok({ path })
    } catch (error) {
      throw new APIException("Erreur durant l'upload", 501)
    }
  }

  public async show({ request, response }: HttpContextContract) {
    const imageName = request.param('imageName')

    try {
      // Vérifiez si le fichier existe avant de renvoyer une réponse
      const imagePath = Application.publicPath(`${imageName}` + '.png')
      await fs.access(imagePath)

      // Renvoyer le fichier image si tout est bon
      return response.download(imagePath)
    } catch (error) {
      // Si le fichier n'existe pas ou s'il y a une autre erreur, renvoyer une réponse 404
      throw new APIException("L'image n'a pas été trouvée...", 404)
    }
  }
}
