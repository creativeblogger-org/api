import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get(':id', 'CommentsController.list')

  Route.group(() => {
    Route.put(':id', 'CommentsController.update').where('id', /^[0-9]+$/)
    Route.delete(':id', 'CommentsController.delete').where('id', /^[0-9]+$/)
  }).middleware('auth')
}).prefix('/comments')
