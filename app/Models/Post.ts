import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, CherryPick, HasMany, ModelObject, belongsTo, column, computed, hasMany } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import { slugify } from '@ioc:Adonis/Addons/LucidSlugify'
import Comment from './Comment'
import HttpContext from '@ioc:Adonis/Core/HttpContext'
import Permissions from 'Contracts/Enums/Permissions'

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

  @computed({ serializeAs: 'has_permission' })
  public get hasPermission() {
    const { user } = HttpContext.get()!.auth
    return Number(this.author) === user!.id
      || user!.permission >= Permissions.Moderator
  }

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
