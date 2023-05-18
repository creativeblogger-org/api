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

Route.group(() => {
  Route.post('register', 'AuthController.register')
  Route.post('login', 'AuthController.login')
}).prefix('/auth')

Route.group(() => { 
  Route.get('/auth/logout', 'AuthController.logout')
  Route.group(() => {
    Route.get('/', 'UsersController.me')
    Route.delete('/delete', 'UsersController.delete')
    Route.put('/update', 'UsersController.update')
  }).prefix('/@me')
}).middleware('auth')

Route.group(() => {
  Route.get('/', 'PostsController.list')
  Route.get(':id', 'PostsController.get').where('id', /^[0-9]$/)
  
  Route.group(() => {
    Route.put('new', 'PostsController.new')
    Route.put(':id', 'PostsController.update').where('id', /^[0-9]$/)
  }).middleware('auth')
}).prefix('/posts')