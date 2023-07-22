import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get('writer', 'VerifController.iswriter')
  Route.get('email/:email', 'VerifController.email')
  Route.get('user/:username', 'VerifController.user')
  Route.get('post/:slug', 'VerifController.post')
}).prefix('/verif')
