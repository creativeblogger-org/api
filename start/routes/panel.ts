import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get('/', 'PanelController.list')
  Route.post('/banner', 'PanelController.banner')
  Route.delete('/delete', 'PanelController.deleteBanner')
  Route.get(':slug', 'PostsController.get')
  Route.get('iswriter', 'UsersController.iswriter')
  Route.get('/certif/ask', 'PanelController.listAskCertifPost')
}).prefix('/panel')
