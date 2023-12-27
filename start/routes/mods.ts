import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.group(() => {
    Route.post('/suspend/:id', 'ModsController.suspend')
  }).middleware('auth')
}).prefix('/mods')
