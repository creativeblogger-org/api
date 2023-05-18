import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
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
      ]),

      email: schema.string({ trim: true }, [
        rules.email(),
        rules.unique({
          table: 'users',
          column: 'email',
          caseInsensitive: true,
        }),
      ]),

      password: schema.string({}, [rules.minLength(5)]),
    })

    // Verification of the data provided by the user.
    const data = await request.validate({
      schema: userSchema,
      messages: {
        'username.required': 'Un nom d\'utilisateur est requis pour créer un compte.',
        'username.unique': 'Le nom d\'utilisateur est déjà utilisé.',
        'username.minLength': 'Le nom d\'utilisateur doit au moins faire {{ options.minLength }} caractères.',
        'username.maxLength': 'Le nom d\'utilisateur doit au plus faire {{ options.maxLength }} caractères.',

        'email.required': 'Une adresse e-mail est requise pour créer un compte.',
        'email.email': 'L\'adresse e-mail est invalide.',
        'email.unique': 'L\'adresse e-mail est déjà utilisée.',

        'password.required': 'Un mot de passe est requis pour créer un compte.',
        'password.minLength': 'Le mot de passe doit au moins faire {{ options.minLength }} caractères.',
      },
    })

    // Creation of the user and return connection token.
    await User.create(data)
    return await auth.use('api').attempt(data.email, data.password)
  }

  public async login({ request, response, auth }: HttpContextContract) {
    // Retrieves the essential elements to connect.
    const { email, username, password } = request.only([
      'email',
      'username',
      'password',
    ])

    try {
      const token = await auth.use('api').attempt(email || username, password)
      return token
    } catch {
      return response.unauthorized('Identifiants invalides.')
    }
  }

  public async logout({ response, auth }: HttpContextContract) {
    auth.logout()
    return response.noContent()
  }
}
