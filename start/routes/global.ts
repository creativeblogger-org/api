import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get('banner', 'GlobalController.banner')
}).prefix('/global')
