import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import APIException from 'App/Exceptions/APIException'
import Follow from 'App/Models/Follow'

export default class FollowController {
  public async follow({ params, response }: HttpContextContract) {
    const followerId = params.followerId
    const followingId = params.followingId

    // Vérifier si la relation de suivi existe déjà
    const existingFollow = await Follow.query()
      .where('follower_id', followerId)
      .where('following_id', followingId)
      .first()

    if (!existingFollow) {
      // Créer la relation de suivi
      await Follow.create({
        followerId,
        followingId,
      })

      return response.noContent()
    }

    throw new APIException('Vous êtes déjà abonné à cette personne !', 401)
  }

  public async unfollow({ params, response }: HttpContextContract) {
    const followerId = params.followerId
    const followingId = params.followingId

    // Supprimer la relation de suivi
    await Follow.query()
      .where('follower_id', followerId)
      .where('following_id', followingId)
      .delete()

    return response.noContent()
  }
}
