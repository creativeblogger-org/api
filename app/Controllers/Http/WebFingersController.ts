import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import APIException from 'App/Exceptions/APIException'
import User from 'App/Models/User'

export default class WebFingerController {
  public async index({ request, response }: HttpContextContract) {
    try {
      // Extraire le nom d'utilisateur de l'URI
      const resource = request.input('resource')
      const username = resource.split(':')[1].split('@')[0]

      const user = await User.findByOrFail('username', username)

      if (!user) {
        throw new APIException('User not found !', 404)
      }

      // Construire l'URI de l'acteur ActivityPub
      const actorURI = `https://api.creativeblogger.org/users/${username}/actor`

      // Construire la réponse WebFinger
      const webFingerResponse = {
        subject: resource,
        links: [
          {
            rel: 'self',
            type: 'application/activity+json',
            href: actorURI,
          },
        ],
      }

      response.header('Content-type', 'appliaction/activity+json')
      return response.json(webFingerResponse)
    } catch (error) {
      console.error(error)
      return response.status(500).json({ message: 'Internal Server Error' })
    }
  }
}
