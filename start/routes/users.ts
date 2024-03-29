import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get('/', 'UsersController.list')
  Route.get(':username', 'UsersController.get')
  Route.get(':id/posts', 'UsersController.posts')
  Route.delete(':username', 'UsersController.delete')
  Route.put('/upgrade/:username', 'UsersController.upgrade')
  Route.get('/:username/actor', 'UsersController.getActivityPubProfile')
  Route.post('/:username/actor/inbox', 'UsersController.handleActivityPubInbox')
  Route.post('/:username/actor/outbox', 'UsersController.handleActivityPubOutbox')
  Route.group(() => {
    Route.post('/follow/:followerId/:followingId', 'FollowsController.follow')
    Route.delete('/unfollow/:followerId/:followingId', 'FollowsController.unfollow')
  }).middleware('auth')
}).prefix('/users')
