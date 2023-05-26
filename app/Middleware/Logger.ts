import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Log from 'App/Models/Log'
import LogMessages from 'Contracts/Enums/LogMessages'

export default class Logger {
  public async handle({ request, auth }: HttpContextContract, next: () => Promise<void>) {
    // code for middleware goes here. ABOVE THE NEXT CALL
    if (!auth.user)
      return await next()

    const message = LogMessages[
      request
        .url()
        .slice(1)
        .replace(/\//g, '.')
    ]

    if (!message)
      return await next()

    const log = new Log()
    log.ip = request.ip()
    log.related('user').associate(auth.user!)
    log.action = message
    log.save()

    await next()
  }
}
