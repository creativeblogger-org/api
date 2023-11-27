import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get('/', 'PanelController.list')
  Route.delete('/delete', 'PanelController.deleteBanner')
  Route.get(':slug', 'PostsController.get')
  Route.get('iswriter', 'UsersController.iswriter')
  Route.get('/certif/ask', 'PanelController.listAskCertifPost')
  Route.post('/rss', 'PanelController.generateRSS')
}).prefix('/panel')
