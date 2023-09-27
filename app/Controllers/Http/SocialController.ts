import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { rules, schema } from '@ioc:Adonis/Core/Validator'
import APIException from 'App/Exceptions/APIException'
import Permissions from 'Contracts/Enums/Permissions'
import Mastodon from 'mastodon-api'
import Env from '@ioc:Adonis/Core/Env'

const M = new Mastodon({
  client_key: Env.get('MASTODON_CLIENT_KEY'),
  client_secret: Env.get('MASTODON_CLIENT_SECRET'),
  access_token: Env.get('MASTODON_ACCESS_TOKEN'),
  timeout_ms: 60 * 1000,
  api_url: 'https://mastodon.social/api/v1/',
})

export default class SocialController {
  public async mastodon({ auth, request, response }: HttpContextContract) {
    if (auth.user!.permission < Permissions.Administrator)
      throw new APIException("Vous n'avez pas la permission de créer un article.", 403)

    const postSchema = schema.create({
      title: schema.string({ trim: true }, [rules.minLength(3), rules.maxLength(30)]),

      content: schema.string({ trim: true }, [rules.minLength(10), rules.maxLength(420)]),

      tags: schema.string({ trim: true }, [rules.minLength(3), rules.maxLength(50)]),
    })

    const data = await request.validate({
      schema: postSchema,
      messages: {
        'title.required': 'Le titre est requis.',
        'title.minLength': 'Le titre doit faire au moins 3 caractères.',
        'title.maxLength': 'Le titre doit faire au maximum 30 caractères.',

        'tags.required': 'Vous devez ajouter un tag à votre article.',
        'tags.minLength': "Il n'y a pas assez de tags",
        'tags.maxLength': 'Il y a trop de tags',

        'content.required': 'Le contenu est requis.',
        'content.minLength': 'Le contenu doit faire au moins 10 caractères.',
        'content.maxLength': 'Le contenu doit faire au maximum 420 caractères.',
      },
    })

    const status = `
     ${data.title}
     ${data.content}
     ${data.tags}
  `

    try {
      await M.post('statuses', { status })
      console.log('Article posté sur Mastodon !')
    } catch (error) {
      console.error('Erreur lors de la publication sur Mastodon :', error)
    }

    return response.noContent()
  }
}
