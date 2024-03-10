import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import APIException from 'App/Exceptions/APIException'
import Follow from 'App/Models/Follow'
import User from 'App/Models/User'

export default class FollowController {
  public async follow({ params, response }: HttpContextContract) {
    const followerId = params.followerId
    const followingId = params.followingId

    const targetUser = await User.findBy('id', followingId)

    if (!targetUser) {
      throw new APIException("L'utilisateur à suivre est inconnu")
    }

    const existingFollow = await Follow.query()
      .where('follower_id', followerId)
      .where('following_id', followingId)
      .first()

    if (!existingFollow) {
      await Follow.create({
        followerId,
        followingId,
      })

      targetUser.followers += 1

      return response.noContent()
    }

    throw new APIException('Vous êtes déjà abonné à cette personne !', 401)
  }

  public async unfollow({ params, response }: HttpContextContract) {
    const followerId = params.followerId
    const followingId = params.followingId

    const targetUser = await User.findBy('id', followingId)

    if (!targetUser) {
      throw new APIException("L'utilisateur à suivre est inconnu")
    }

    await Follow.query()
      .where('follower_id', followerId)
      .where('following_id', followingId)
      .delete()

    targetUser.followers -= 1

    return response.noContent()
  }
}
