import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import User from './User'

export default class Like extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  @belongsTo(() => User, { foreignKey: 'user' })
  public user: BelongsTo<typeof User>

  @column()
  public post: number
}
