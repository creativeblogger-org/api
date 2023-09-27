import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get('google', 'Oauth/GoogleController.login')
  Route.get('google/callback', 'Oauth/GoogleController.callback').as('oauth.google')

  Route.get('github', 'Oauth/GithubController.login')
  Route.get('github/callback', 'Oauth/GithubController.callback').as('oauth.github')

  Route.get('discord', 'Oauth/DiscordController.login')
  Route.get('discord/callback', 'Oauth/DiscordController.callback').as('oauth.discord')
}).prefix('/oauth')
