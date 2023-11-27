import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.group(() => {
    Route.post('/ask-certif/:slug', 'GlobalController.ask_certif')
  }).middleware('auth')
}).prefix('/global')
