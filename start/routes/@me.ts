import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get('/image/:imageName', 'MeController.show')

  Route.group(() => {
    Route.post('/upload', 'MeController.upload')
    Route.get('/', 'MeController.me')
    Route.put('/', 'MeController.update')
    Route.delete('/', 'MeController.delete')
    Route.post('/buymeacoffee/:link', 'MeController.buymeacoffee')
    Route.delete('/delete', 'MeController.deleteImage')

    Route.get('logs', 'MeController.logs')
  }).middleware('auth')
}).prefix('/@me')
