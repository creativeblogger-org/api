import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import Post from './Post'

export default class Like extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  @belongsTo(() => User, { foreignKey: 'user' })
  public user: BelongsTo<typeof User>

  @column()
  @belongsTo(() => Post, { foreignKey: 'post' })
  public post: BelongsTo<typeof Post>
}
