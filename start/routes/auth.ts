import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.post('register', 'AuthController.register')
  Route.post('login', 'AuthController.login')
  Route.post('/forgot-password/:email', 'AuthController.password')
}).prefix('/auth')

Route.get('/auth/logout', 'AuthController.logout').middleware('auth')
