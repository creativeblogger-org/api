import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.group(() => {
    Route.post('/suspend/:id', 'ModsController.suspend')
    Route.post('/unsuspend/:id', 'ModsController.unsuspend')
  }).middleware('auth')
}).prefix('/mods')
