import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get('/', 'ShortsController.list')

  Route.group(() => {
    Route.post('/', 'ShortsController.new')
    Route.put(':id', 'ShortsController.update')
    Route.delete(':id', 'ShortsController.delete')
  }).middleware('auth')
}).prefix('/shorts')
