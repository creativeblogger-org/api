import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import APIException from 'App/Exceptions/APIException'
import Shorts from 'App/Models/Shorts'
import { DateTime } from 'luxon'

export default class ShortsController {
  public async list({ request }: HttpContextContract) {
    const expirationDate = DateTime.local().minus({ days: 3 })
    const expirationDateString = expirationDate.toFormat('yyyy-MM-dd HH:mm:ss')
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
    await Shorts.query().whereRaw('created_at < ?', [expirationDateString]).delete()

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
      content: schema.string({ trim: true }, [rules.minLength(10), rules.maxLength(333)]),
    })

    // Validate the provided data.
    const data = await request.validate({
      schema: shortsSchema,
      messages: {
        'content.required': 'Le contenu est requis.',
        'content.minLength': 'Le contenu doit faire au moins 10 caractères.',
        'content.maxLength': 'Le contenu doit faire au maximum 333 caractères.',
      },
    })

    // Save the post in the database.
    const shorts = new Shorts()
    shorts.content = data.content
    await shorts.related('author').associate(auth.user!)
    shorts.expiresAt = DateTime.local().plus({ days: 1 })
    await shorts.save()

    return response.noContent()
  }

  public async update({ request, response }: HttpContextContract) {
    // Check if the post exists.
    const short = await Shorts.findBy('id', request.param('id'))
    if (!short) throw new APIException('Le koy demandé est introuvable.', 404)

    if (!short.hasPermission)
      throw new APIException("Vous n'avez pas la permission de modifier ce koy.", 403)

    // Update the post.
    const { content } = request.only(['content'])

    await short.merge({ content }).save()

    return response.noContent()
  }

  public async delete({ request, response }: HttpContextContract) {
    // Check if the post exists.
    const short = await Shorts.findBy('id', request.param('id'))
    if (!short) throw new APIException('Le koy demandé est introuvable.', 404)

    if (!short.hasPermission) throw new APIException("Vous n'êtes pas l'auteur de ce koy.", 403)

    // Delete the post.
    await short.delete()
    return response.noContent()
  }
}
