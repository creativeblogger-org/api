import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import User from './User'

export default class Log extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public ip: string

  @column()
  @belongsTo(() => User, { foreignKey: 'user' })
  public user: BelongsTo<typeof User>

  @column()
  public action: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime
}
