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

import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get('google', 'Oauth/GoogleController.login')
  Route.get('google/callback', 'Oauth/GoogleController.callback').as('oauth.google')

  Route.get('github', 'Oauth/GithubController.login')
  Route.get('github/callback', 'Oauth/GithubController.callback').as('oauth.github')

  Route.get('discord', 'Oauth/DiscordController.login')
  Route.get('discord/callback', 'Oauth/DiscordController.callback').as('oauth.discord')
}).prefix('/oauth')