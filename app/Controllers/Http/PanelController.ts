import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Post from 'App/Models/Post'

export default class PanelController {
  public async list({ request }: HttpContextContract) {
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
}
