import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, CherryPick, ModelObject, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import Post from './Post'

export default class Comment extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  @belongsTo(() => User, { foreignKey: 'author' })
  public author: BelongsTo<typeof User>

  @column()
  @belongsTo(() => Post, { foreignKey: 'post' })
  public post: BelongsTo<typeof Post>

  @column()
  public content: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  public serialize(cherryPick?: CherryPick | undefined): ModelObject {
    return {
      ...this.serializeAttributes(cherryPick?.fields, false),
      ...this.serializeComputed(cherryPick?.fields),
      ...this.serializeRelations(
        {
          author: {
            fields: {
              omit: [
                'email',
                'created_at',
                'updated_at'
              ]
            }
          },
        },
      false),
    }
  }
}
