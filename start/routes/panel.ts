import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get('/', 'PanelController.list')
  Route.get('/banner', 'PanelController.banner')
  Route.get('/delete', 'PanelController.deleteBanner')
  Route.get(':slug', 'PostsController.get')
  Route.get('iswriter', 'UsersController.iswriter')
}).prefix('/panel')
