import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import APIException from 'App/Exceptions/APIException'
import Banner from 'App/Models/Banner'
import Post from 'App/Models/Post'

export default class GlobalController {
  public async banner({}) {
    const banner = await Banner.query()
    if (!banner) {
      throw new APIException("Il n'y a pas de bannière", 404)
    }
    return banner
  }

  public async ask_certif({ request, response }: HttpContextContract) {
    const post = await Post.findBy('slug', request.param('slug'))

    if (!post) {
      throw new APIException('Le post demandé est introuvable', 404)
    }
    if (!post.hasPermission) {
      throw new APIException("Vous n'êtes pas l'auteur de cet article !", 401)
    }
    if(post.views < 50) {
        throw new APIException("Votre post n'est pas éligible à la certification")
    }
    if(post.ask_verif === 1) {
        throw new APIException("Le post est déjà sous demande de certification")
    }
    post.ask_verif = 1
    await post.save()

    return response.noContent()
  }
}
