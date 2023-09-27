import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import APIException from 'App/Exceptions/APIException'
import Banner from 'App/Models/Banner'
import Post from 'App/Models/Post'

export default class PanelController {
  public async list({ request, auth }: HttpContextContract) {
    if (auth.user?.permission != 2 || 3) {
      throw new APIException("Vous n'avez pas la permission requise", 403)
    }
    const data = await request.validate({
      schema: schema.create({
        limit: schema.number.optional([rules.above(0)]),
        page: schema.number.optional([rules.above(0)]),
      }),
      messages: {
        'limit.number': "La limite d'articles doit être un nombre.",
        'limit.above': "La limite d'articles doit être supérieure à 0.",

        'page.number': 'Le numéro de page doit être un nombre.',
        'page.above': 'Le numéro de page doit être supérieur à 0.',
      },
    })

    let posts = Post.query().orderBy('created_at', 'desc').preload('author')

    if (data.limit && !data.page) {
      await posts.limit(data.limit)
    }

    if (data.limit && data.page) {
      await posts.offset(data.limit * data.page).limit(data.limit)
    }

    ;(await posts).map((post) => post.serializeAttributes({ omit: ['comments'] }))
    return await posts
  }

  public async banner({ request, auth, response }: HttpContextContract) {
    const data = await request.validate({
      schema: schema.create({
        color: schema.string(),
        text: schema.string({ trim: true }, [rules.minLength(10), rules.maxLength(200)]),
        linkText: schema.string({ trim: true }, [rules.minLength(1), rules.maxLength(10)]),
        link: schema.string({ trim: true }, [rules.minLength(2), rules.maxLength(200)])
      }),
      messages: {
        'text.minLenght': "Le text ne dois pas être en dessous de 10 caractères.",
        'text.maxLenght': "Le text ne dois pas comporter plus de 200 caractères.",

        'linkText.minLenght': 'Le text du lien ne dois pas être en dessous de 1 caractère.',
        'linkText.maxLenght': 'Le text du lien ne dois pas comporter plus de 10 caractère.',

        'link.minLenght': 'Le lien dois faire moins de 2 caractères.',
        'link.maxLenght': 'Le lien dois faire plus de 200 caractères.',
      },
    })
    if (auth.user?.permission !== 3) {
      throw new APIException("Vous n'avez pas la permission de faire ceci !")
    }
    const banner = new Banner()
    banner.content = data.text
    banner.color = data.color
    banner.text_link = data.linkText
    banner.link = data.link
    await banner.save()
    return response.noContent()
  }

  public async deleteBanner({ auth, response }: HttpContextContract) {
    if (auth.user?.permission !== 3) {
      throw new APIException("Vous n'avez pas la permission de faire ceci !")
    }
    const banner = Banner.query()
     await banner.delete()
    return response.noContent()
  }
}
