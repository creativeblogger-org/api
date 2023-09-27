declare module '@ioc:Adonis/Addons/Ally' {
  interface SocialProviders {
    github: {
      config: GithubDriverConfig
      implementation: GithubDriverContract
    }
    google: {
      config: GoogleDriverConfig
      implementation: GoogleDriverContract
    }
    discord: {
      config: DiscordDriverConfig
      implementation: DiscordDriverContract
    }
  }
}
