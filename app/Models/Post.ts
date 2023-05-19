import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, CherryPick, HasMany, ModelObject, belongsTo, column, hasMany } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import { slugify } from '@ioc:Adonis/Addons/LucidSlugify'
import Comment from './Comment'

export default class Post extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  @belongsTo(() => User, { foreignKey: 'author' })
  public author: BelongsTo<typeof User>

  @column()
  public title: string

  @column()
  @slugify({
    strategy: 'dbIncrement',
    fields: ['title'],
  })
  public slug: string

  @column()
  @hasMany(() => Comment, {
    foreignKey: 'post',
    onQuery: (query) => query.preload('author')
  })
  public comments: HasMany<typeof Comment>

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
          comments: { fields: { omit: ['post'] } }
        },
      false),
    }
  }
}
