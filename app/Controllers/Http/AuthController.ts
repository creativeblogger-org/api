import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import APIException from 'App/Exceptions/APIException'
import User from 'App/Models/User'

export default class AuthController {
  public async register({ request, auth }: HttpContextContract) {
    // Definition of rules for data verification.
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

      password: schema.string({}, [rules.minLength(5)]),

      birthdate: schema.date(),
    })

    // Verification of the data provided by the user.
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

        'birthdate': "La date d'anniversaire est obligatoire !",
      },
    })

    // Creation of the user and return connection token.
    await User.create(data)
    return await auth.use('api').attempt(data.username, data.password)
  }

  public async login({ request, auth }: HttpContextContract) {
    // Retrieves the essential elements to connect.
    const { username, password } = request.only(['username', 'password'])

    // Login the user.
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
