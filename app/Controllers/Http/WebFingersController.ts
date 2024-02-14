import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class WebFingerController {
  public async index({ request, response }: HttpContextContract) {
    try {
      // Extraire le nom d'utilisateur de l'URI
      const resource = request.input('resource')
      const username = resource.split(':')[1].split('@')[0]

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

      // Renvoyer la réponse WebFinger au format JSON
      return response.json(webFingerResponse)
    } catch (error) {
      console.error(error)
      return response.status(500).json({ message: 'Internal Server Error' })
    }
  }
}
