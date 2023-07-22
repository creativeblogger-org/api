import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import APIException from 'App/Exceptions/APIException'
import Post from 'App/Models/Post'
import User from 'App/Models/User'

export default class VerifController {
  public async iswriter({ auth }: HttpContextContract) {
    if (auth.user?.permission === 1 || 2 || 3) {
      return ''
    } else {
      throw new APIException('Seul un rédacteur peut créer un nouvel article !')
    }
  }

  public async email({ request }: HttpContextContract) {
    const email = await User.findBy('email', request.param('email'))
    if (!email) {
      throw new APIException("L'email n'existe pas", 404)
    } else {
      throw new APIException("L'email existe", 200)
    }
  }

  public async user({ request }: HttpContextContract) {
    const user = await User.findBy('username', request.param('username'))
    if (!user) {
      throw new APIException("L'utilisateur n'existe pas", 404)
    } else {
      throw new APIException("L'utilisateur existe", 200)
    }
  }

  public async post({ request }: HttpContextContract) {
    const post = await Post.findBy('slug', request.param('slug'))
    if (!post) {
      throw new APIException("Le post n'existe pas", 404)
    } else {
      throw new APIException('Le post existe', 200)
    }
  }
}
