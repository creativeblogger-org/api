/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Route from '@ioc:Adonis/Core/Route'

Route.get('/', ({ response }: HttpContextContract) => {
  return response.json({ status: 'ok' })
})

import './routes/@me'
import './routes/auth'
import './routes/comments'
import './routes/oauth'
import './routes/posts'
import './routes/users'
import './routes/ban'
import './routes/panel'
import './routes/verif'
import './routes/image'
import './routes/shorts'
