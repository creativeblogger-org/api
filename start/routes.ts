import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Route from '@ioc:Adonis/Core/Route'

Route.get('/', ({ response }: HttpContextContract) => {
  return response.json({ status: 'ok' })
})

Route.get('/.well-known/webfinger', 'WebFingersController.index')

import './routes/@me'
import './routes/auth'
import './routes/comments'
import './routes/oauth'
import './routes/posts'
import './routes/users'
import './routes/panel'
import './routes/verif'
import './routes/social'
import './routes/global'
import './routes/mods'
