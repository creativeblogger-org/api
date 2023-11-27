import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import APIException from 'App/Exceptions/APIException'
import Post from 'App/Models/Post'

export default class GlobalController {
  public async ask_certif({ request, response }: HttpContextContract) {
    const post = await Post.findBy('slug', request.param('slug'))

    if (!post) {
      throw new APIException('Le post demandé est introuvable', 404)
    }
    if (!post.hasPermission) {
      throw new APIException("Vous n'êtes pas l'auteur de cet article !", 401)
    }
    if (post.views < 50) {
      throw new APIException("Votre post n'est pas éligible à la certification")
    }
    if (post.ask_verif === true) {
      throw new APIException('Le post est déjà sous demande de certification')
    }
    post.ask_verif = true
    await post.save()

    return response.noContent()
  }
}
