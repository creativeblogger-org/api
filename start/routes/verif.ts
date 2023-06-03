import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get('writer', 'VerifController.iswriter')
}).prefix('/verif')
