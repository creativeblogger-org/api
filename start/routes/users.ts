import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get('/', 'UsersController.list')
  Route.get(':username', 'UsersController.get')
  Route.get(':id/posts', 'UsersController.posts')
  Route.delete(':username', 'UsersController.delete')
  Route.put('/upgrade/:username', 'UsersController.upgrade')
}).prefix('/users')
