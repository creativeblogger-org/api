import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import APIException from 'App/Exceptions/APIException'
import User from 'App/Models/User'

export default class AuthController {
  public async register({ request, auth }: HttpContextContract) {
    const userSchema = schema.create({
      username: schema.string({ trim: true }, [
        rules.unique({
          table: 'users',
          column: 'username',
          caseInsensitive: true,
        }),
        rules.minLength(4),
        rules.maxLength(12),
        rules.regex(/^[a-zA-Z][\w]{2,}$/),
      ]),

      email: schema.string({ trim: true }, [
        rules.email(),
        rules.unique({
          table: 'users',
          column: 'email',
          caseInsensitive: true,
        }),
        rules.regex(
          /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,253}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,253}[a-zA-Z0-9])?)*$/
        ),
      ]),

      password: schema.string({}, [rules.minLength(8)]),

      birthdate: schema.date(),
    })

    const data = await request.validate({
      schema: userSchema,
      messages: {
        'username.required': "Un nom d'utilisateur est requis pour créer un compte.",
        'username.unique': "Le nom d'utilisateur est déjà utilisé.",
        'username.minLength':
          "Le nom d'utilisateur doit au moins faire {{ options.minLength }} caractères.",
        'username.maxLength':
          "Le nom d'utilisateur doit au plus faire {{ options.maxLength }} caractères.",
        'username.regex': "Le nom d'utilisateur comporte des caractères interdits !",

        'email.required': 'Une adresse e-mail est requise pour créer un compte.',
        'email.email': "L'adresse e-mail est invalide.",
        'email.unique': "L'adresse e-mail est déjà utilisée.",
        'email.regex': "L'adresse e-mail comporte des caractères interdits",

        'password.required': 'Un mot de passe est requis pour créer un compte.',
        'password.minLength':
          'Le mot de passe doit au moins faire {{ options.minLength }} caractères.',

        'birthdate.required': 'La date de naissance est obligatoire !',
      },
    })

    await User.create(data)
    return await auth.use('api').attempt(data.username, data.password)
  }

  public async login({ request, auth }: HttpContextContract) {
    const { username, password } = request.only(['username', 'password'])

    try {
      return await auth.use('api').attempt(username, password)
    } catch {
      throw new APIException('Les identifiants sont invalides.', 401)
    }
  }

  public async logout({ response, auth }: HttpContextContract) {
    auth.logout()
    return response.noContent()
  }
}
