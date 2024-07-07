import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import APIException from 'App/Exceptions/APIException'
import Log from 'App/Models/Log'
import Application from '@ioc:Adonis/Core/Application'
import User from 'App/Models/User'
import fs from 'fs/promises'
import sharp from 'sharp'
import Permissions from 'Contracts/Enums/Permissions'
import Env from '@ioc:Adonis/Core/Env'

export default class UsersController {
  public async me({ auth }: HttpContextContract) {
    return auth.user!
  }

  public async delete({ response, auth }: HttpContextContract) {
    if (auth.user?.permission === Permissions.Administrator) {
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
    const { email, username, password, biography } = request.only([
      'email',
      'username',
      'password',
      'biography',
    ])

    const user = auth.user!

    if (user.permission === -1) {
      throw new APIException('Votre compte est suspendu ! Vous ne pouvez pas faire ça.')
    }

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

    if (biography && biography.length <= 200) {
      user.biography = biography
    } else if (biography.length > 200) {
      throw new APIException('La biographie ne peut excéder 200 caractères.')
    }

    await auth.user!.merge(user).save()

    return response.noContent()
  }

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

    if (user.permission === -1) {
      throw new APIException('Votre compte est suspendu ! Vous ne pouvez pas faire ça.')
    }

    const fileName = `${auth.user!.id}.png`
    const resizedImagePath = Application.publicPath() + '/users/' + fileName

    try {
      await image.move(Application.tmpPath(), {
        name: fileName,
        overwrite: true,
      })

      await sharp(Application.tmpPath() + '/' + fileName)
        .resize(500, 500)
        .toFile(resizedImagePath)

      await fs.unlink(Application.tmpPath() + '/' + fileName)

      user.pp = `${Env.get('API')}/public/users/${fileName}`
      await user.save()

      return response.ok({ resizedImagePath })
    } catch (error) {
      throw new APIException("Erreur durant l'upload", 500)
    }
  }

  public async show({ request, response }: HttpContextContract) {
    const imageName = request.param('imageName')

    try {
      const imagePath = Application.publicPath(`/users/${imageName}` + '.png')
      await fs.access(imagePath)

      return response.download(imagePath)
    } catch (error) {
      throw new APIException(`L'image ${error} n'a pas été trouvée...`, 404)
    }
  }

  public async deleteImage({ response, auth }: HttpContextContract) {
    const user = auth.user

    if (!user) {
      throw new APIException("Vous n'êtes pas identifiés !", 501)
    }

    if (user.permission === -1) {
      throw new APIException('Votre compte est suspendu ! Vous ne pouvez pas faire ça.')
    }

    try {
      const imagePath = `users/${user.id}.png`
      await fs.unlink(Application.publicPath(imagePath))

      user.pp = null
      await user.save()

      return response.ok('Image deleted successfully')
    } catch (error) {
      throw new APIException('Erreur dans le serveur', 500)
    }
  }

  public async buymeacoffee({ request, auth, response }: HttpContextContract) {
    const user = auth.user
    if (!user) {
      throw new APIException("Vous n'êtes pas connectés !", 401)
    }
    if (user!.permission < Permissions.Redactor) {
      throw new APIException("Vous n'avez pas la permission de faire ceci !", 401)
    }

    const link = request.param('link')

    user.buymeacoffee = `https://buymeacoffee.com/${link}`
    await user.save()

    return response.noContent()
  }
}
