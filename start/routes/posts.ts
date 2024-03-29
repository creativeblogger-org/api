import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get('/', 'PostsController.list')
  Route.get(':slug', 'PostsController.get')

  Route.group(() => {
    Route.post('/', 'PostsController.new')
    Route.put(':slug', 'PostsController.update')
    Route.delete(':slug', 'PostsController.delete')
    Route.post('/upload', 'PostsController.upload')
    Route.post('/like/:id', 'PostsController.like')
    Route.delete('/unlike/:id', 'PostsController.unlike')
    Route.post('/verified/:slug', 'PostsController.verified')
    Route.post('/unverified/:slug', 'PostsController.unverified')

    Route.post(':slug/comment', 'CommentsController.new')
  }).middleware('auth')
}).prefix('/posts')
