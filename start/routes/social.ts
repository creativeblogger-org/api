import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.post('/mastodon', 'SocialController.mastodon')
})
  .prefix('/social')
  .middleware('auth')
