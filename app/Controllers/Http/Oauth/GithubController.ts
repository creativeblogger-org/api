import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class GithubController {
  public async login({ ally }: HttpContextContract) {
    await ally.use('github').redirect()
  }

  public async callback({ ally }: HttpContextContract) {
    const github = ally.use('github')
    return await github.user()
  }
}
