import { BaseModel, column, BelongsTo, belongsTo } from '@ioc:Adonis/Lucid/Orm'
import User from './User'

export default class Follow extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public followerId: number

  @column()
  public followingId: number

  @belongsTo(() => User, {
    foreignKey: 'followerId',
  })
  public follower: BelongsTo<typeof User>

  @belongsTo(() => User, {
    foreignKey: 'followingId',
  })
  public following: BelongsTo<typeof User>
}
