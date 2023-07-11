import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import APIException from 'App/Exceptions/APIException'
import Shorts from 'App/Models/Shorts'

export default class ShortsController {
  public async list({ request }: HttpContextContract) {
    const data = await request.validate({
      schema: schema.create({
        limit: schema.number.optional([rules.above(0)]),
        page: schema.number.optional([rules.above(0)]),
      }),
      messages: {
        'limit.number': 'La limite de shorts doit être un nombre.',
        'limit.above': 'La limite de shorts doit être supérieure à 0.',

        'page.number': 'Le numéro de page doit être un nombre.',
        'page.above': 'Le numéro de page doit être supérieur à 0.',
      },
    })

    let shorts = Shorts.query().orderBy('created_at', 'desc').preload('author')

    if (data.limit && !data.page) {
      await shorts.limit(data.limit)
    }

    if (data.limit && data.page) {
      await shorts.offset(data.limit * data.page).limit(data.limit)
    }

    ;(await shorts).map((post) => post.serializeAttributes())
    return await shorts
  }

  public async new({ request, response, auth }: HttpContextContract) {
    // Defines the post schema for the validation.
    const shortsSchema = schema.create({
      title: schema.string({ trim: true }, [rules.minLength(3), rules.maxLength(30)]),

      content: schema.string({ trim: true }, [rules.minLength(10), rules.maxLength(200)]),
    })

    // Validate the provided data.
    const data = await request.validate({
      schema: shortsSchema,
      messages: {
        'title.required': 'Le titre est requis.',
        'title.minLength': 'Le titre doit faire au moins 3 caractères.',
        'title.maxLength': 'Le titre doit faire au maximum 30 caractères.',

        'content.required': 'Le contenu est requis.',
        'content.minLength': 'Le contenu doit faire au moins 10 caractères.',
        'content.maxLength': 'Le contenu doit faire au maximum 200 caractères.',
      },
    })

    // Save the post in the database.
    const shorts = new Shorts()
    shorts.title = data.title
    shorts.content = data.content
    await shorts.related('author').associate(auth.user!)
    await shorts.save()

    return response.noContent()
  }

  public async update({ request, response }: HttpContextContract) {
    // Check if the post exists.
    const short = await Shorts.findBy('id', request.param('id'))
    if (!short) throw new APIException('Le short demandé est introuvable.', 404)

    if (!short.hasPermission)
      throw new APIException("Vous n'avez pas la permission de modifier ce short.", 403)

    // Update the post.
    const { title, content } = request.only(['title', 'content'])

    await short.merge({ title, content }).save()

    return response.noContent()
  }

  public async delete({ request, response }: HttpContextContract) {
    // Check if the post exists.
    const short = await Shorts.findBy('id', request.param('id'))
    if (!short) throw new APIException('Le short demandé est introuvable.', 404)

    if (!short.hasPermission) throw new APIException("Vous n'êtes pas l'auteur de ce short.", 403)

    // Delete the post.
    await short.delete()
    return response.noContent()
  }
}
