import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import APIException from 'App/Exceptions/APIException'
import Post from 'App/Models/Post'
import RssGenerator from 'App/Services/RssGenerator'
import Permissions from 'Contracts/Enums/Permissions'

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

    let posts = Post.query()
      .orderBy('created_at', 'desc')
      .preload('author')
      .select([
        'id',
        'title',
        'slug',
        'created_at',
        'updated_at',
        'views',
        'likes',
        'image',
        'description',
        'author',
      ])

    if (data.limit && !data.page) {
      await posts.limit(data.limit)
    }

    if (data.limit && data.page) {
      await posts.offset(data.limit * data.page).limit(data.limit)
    }

    ;(await posts).map((post) => post.serializeAttributes({ omit: ['comments'] }))
    return await posts
  }

  public async listAskCertifPost({ auth }: HttpContextContract) {
    if (auth.user?.permission !== 3) {
      throw new APIException("Vous n'avez pas la permission de faire ceci !", 401)
    }

    const posts = await Post.query()
      .preload('author')
      .preload('comments', (query) => query.limit(20))
      .where('ask_verif', '=', true)
      .select([
        'id',
        'title',
        'slug',
        'created_at',
        'updated_at',
        'views',
        'likes',
        'image',
        'description',
        'author',
      ])
      .first()

    return posts
  }

  public async generateRSS({ auth, response }: HttpContextContract) {
    if (auth.user?.permission !== Permissions.Administrator) {
      throw new APIException("Vous n'avez pas la permission de faire ceci !", 401)
    }

    const allPosts = await Post.query().orderBy('created_at', 'desc').limit(10)

    const rssGenerator = new RssGenerator()
    const rssFeed = rssGenerator.generateRss(allPosts)

    await rssGenerator.saveRssToFile(rssFeed)

    return response.noContent()
  }
}
