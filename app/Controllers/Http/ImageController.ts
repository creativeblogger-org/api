import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Application from '@ioc:Adonis/Core/Application'
import fs from 'fs/promises'
import APIException from 'App/Exceptions/APIException'
import User from 'App/Models/User' // Importez le modèle User

export default class ImageController {
  public async upload({ request, response, auth }: HttpContextContract) {
    const image = request.file('image')

    if (!image) {
      throw new APIException("Il n'y a aucun fichier à télécharger", 404)
    }

    const user = await User.find(auth.user?.id)

    if (!user) {
      return response.unauthorized('User not authenticated')
    }

    const fileName = `${auth.user!.id}.${image.extname}`
    const path = `${fileName}`

    try {
      await image.move(Application.publicPath(), {
        name: fileName,
        overwrite: true, // Cette option permettra de remplacer le fichier s'il existe déjà
      })

      user.pp = 'https://api.creativeblogger.org/public/' + path
      await user.save()

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
