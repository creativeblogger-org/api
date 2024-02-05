import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.group(() => {
    Route.post('/ask-certif/:slug', 'GlobalController.ask_certif')
    Route.get('redactor-list', 'GlobalController.list')
  }).middleware('auth')
  Route.post('/activitypub', 'ActivitiesController.handleActivity')
}).prefix('/global')
