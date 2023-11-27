import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Route from '@ioc:Adonis/Core/Route'
import View from '@ioc:Adonis/Core/View'

Route.get('/', ({}: HttpContextContract) => {
  return View.render('welcome')
})

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
