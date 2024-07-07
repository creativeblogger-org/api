import Mail from '@ioc:Adonis/Addons/Mail'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import APIException from 'App/Exceptions/APIException'
import User from 'App/Models/User'
import Permissions from 'Contracts/Enums/Permissions'
import Env from '@ioc:Adonis/Core/Env'
import Application from '@ioc:Adonis/Core/Application'

export default class ModsController {
  public async suspend({ auth, request, response }: HttpContextContract) {
    if (auth.user && auth.user?.permission < Permissions.Moderator) {
      throw new APIException("Vous n'avez pas la permission de faire ceci !", 401)
    }
    const target = await User.findBy('id', request.param('id'))
    if (!target) {
      throw new APIException("Impossible de trouver l'utilisateur visé.", 404)
    }
    if (target.permission === -1) {
      throw new APIException("L'utilisateur est déjà suspendu !", 405)
    }

    target.permission = Permissions.SuspendedAccount
    target.merge(target).save()

    await Mail.send((message) => {
      message
        .from(Env.get('SMTP_USERNAME'))
        .to(target.email)
        .embed(Application.publicPath('logo2.png'), 'logo')
        .embed(Application.publicPath('insta.png'), 'insta')
        .embed(Application.publicPath('discord.png'), 'discord')
        .embed(Application.publicPath('element.png'), 'element')
        .embed(Application.publicPath('github.png'), 'github')
        .embed(Application.publicPath('mastodon.svg'), 'mastodon')
        .embed(Application.publicPath('twitter.png'), 'twitter')
        .embed(Application.publicPath('youtube.png'), 'youtube')
        .subject('Votre compte à été suspendu !')
        .htmlView('emails/suspend', {
          name: target.username,
          api: Env.get('API'),
          platformName: Env.get('PLATFORM_NAME'),
        })
    })

    return response.noContent()
  }
  public async unsuspend({ auth, request, response }: HttpContextContract) {
    if (auth.user && auth.user?.permission < Permissions.Moderator) {
      throw new APIException("Vous n'avez pas la permission de faire ceci !", 401)
    }
    const target = await User.findBy('id', request.param('id'))
    if (!target) {
      throw new APIException("Impossible de trouver l'utilisateur visé.", 404)
    }
    if (target.permission !== -1) {
      throw new APIException("L'utilisateur n'est pas suspendu !", 405)
    }

    target.permission = Permissions.User
    target.merge(target).save()

    await Mail.send((message) => {
      message
        .from(Env.get('SMTP_USERNAME'))
        .to(target.email)
        .embed(Application.publicPath('logo2.png'), 'logo')
        .embed(Application.publicPath('insta.png'), 'insta')
        .embed(Application.publicPath('discord.png'), 'discord')
        .embed(Application.publicPath('element.png'), 'element')
        .embed(Application.publicPath('github.png'), 'github')
        .embed(Application.publicPath('mastodon.svg'), 'mastodon')
        .embed(Application.publicPath('twitter.png'), 'twitter')
        .embed(Application.publicPath('youtube.png'), 'youtube')
        .subject("Votre compte n'est plus suspendu !")
        .htmlView('emails/unsuspend', {
          name: target.username,
          api: Env.get('API'),
          platformName: Env.get('PLATFORM_NAME'),
        })
    })

    return response.noContent()
  }
}
