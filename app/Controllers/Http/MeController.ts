import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import APIException from 'App/Exceptions/APIException'
import Log from 'App/Models/Log'
import Application from '@ioc:Adonis/Core/Application'
import User from 'App/Models/User'
import fs from 'fs/promises'

export default class UsersController {
  // Returns the user currently logged in.
  public async me({ auth }: HttpContextContract) {
    return auth.user!
  }

  // Deletes the user.
  public async delete({ response, auth }: HttpContextContract) {
    if (auth.user?.permission === 3) {
      throw new APIException(
        'Vous êtes un administrateur, votre compte ne peut pas être supprimé !',
        403
      )
    }
    await auth.user!.delete()
    await auth.logout()
    return response.noContent()
  }

  public async update({ request, response, auth }: HttpContextContract) {
    // Retrieves the essential elements to update.
    const { email, username, password } = request.only(['email', 'username', 'password'])

    const user = auth.user!

    // Update email and username if provided.
    if (
      email &&
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,253}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,253}[a-zA-Z0-9])?)*$/.test(
        email
      )
    ) {
      user.email = email
    } else if (email) {
      throw new APIException("L'adresse email n'est pas valide.", 403)
    }

    if (
      username &&
      /^[a-zA-Z][\w]{2,}$/.test(username) &&
      username.length > 4 &&
      username.length < 12
    ) {
      user.username = username
    } else if (username && username.length <= 4) {
      throw new APIException("Le nom d'utilisateur doit faire plus de 4 caractères.", 403)
    } else if (username && username.length > 12) {
      throw new APIException("Le nom d'utilisateur doit faire moins de 12 caractères.", 403)
    } else if (username) {
      throw new APIException("Le nom d'utilisateur n'est pas valide.", 403)
    }

    if (password && password.length > 5) {
      user.password = password
    } else if (password && password.length <= 5) {
      throw new APIException('Le mot de passe doit faire plus de 5 caractères.')
    }
    // Updates the user.
    await auth.user!.merge(user).save()

    return response.noContent()
  }

  // Retrieves the logs of the user.
  public async logs({ auth }: HttpContextContract) {
    return await Log.findBy('user', auth.user!.id)
  }

  public async upload({ request, response, auth }: HttpContextContract) {
    const image = request.file('image')

    if (!image) {
      throw new APIException("Il n'y a aucun fichier à télécharger", 404)
    }

    const user = await User.find(auth.user?.id)

    if (!user) {
      throw new APIException("Vous n'êtes pas identifiés !", 501)
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
      throw new APIException("Erreur durant l'upload", 500)
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

  public async deleteImage({ response, auth }: HttpContextContract) {
    const user = auth.user

    if (!user) {
      throw new APIException("Vous n'êtes pas identifiés !", 501)
    }

    try {
      // Supprimer le fichier image associé à l'utilisateur
      const imagePath = `${user.id}.png` // Remplacez "ext" par l'extension du fichier (par exemple, jpg, png, etc.)
      await fs.unlink(Application.publicPath(imagePath))

      // Mettre à jour le champ 'pp' du modèle User pour indiquer qu'il n'y a plus d'image
      user.pp = null
      await user.save()

      return response.ok('Image deleted successfully')
    } catch (error) {
      throw new APIException('Erreur dans le serveur', 500)
    }
  }
}
