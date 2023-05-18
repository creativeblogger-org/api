import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'
import Post from 'App/Models/Post'

export default class PostsController {
  public async list({ request }: HttpContextContract) {
    const data = await request.validate({
      schema: schema.create({
        limit: schema.number.optional(),
        omitted: schema.number.optional(),
      }),
      messages: {
        'limit.number': 'La limite d\'articles doit être un nombre.',
        'omitted.number': 'Le nombre d\'articles omis doit être un nombre.',
      },
    })
    
    if (data.limit && data.omitted) {
      return Post
        .query()
        .offset(data.omitted)
        .limit(data.limit)
    }

    if (data.limit) {
      return Post
        .query()
        .limit(data.limit)
    }

    return Post
      .all()  
  }

  public async get({ request }: HttpContextContract) {
    return await Post.find(request.param('id'))
  }

  public async new({ request }: HttpContextContract) {
    return 'ta maman je la nique tous les soirs.'
  }
}
