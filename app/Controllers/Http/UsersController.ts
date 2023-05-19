import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'

export default class UsersController {
  public async list({}: HttpContextContract) {
    return (await User.all())
      .map(user => {
        return user.serialize({
          fields: {
            omit: [
              'email',
              'created_at',
              'updated_at',
            ],
          },
        })
      })
  }

  public async get({ request }: HttpContextContract) {
    const username = request.param('username')
    return (await User.findBy('username', username))?.serialize({
      fields: {
        omit: [
          'email',
          'created_at',
          'updated_at',
        ],
      },
    })
  }
}