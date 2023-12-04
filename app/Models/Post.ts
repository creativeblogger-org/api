import { DateTime } from 'luxon'
import {
  BaseModel,
  BelongsTo,
  CherryPick,
  HasMany,
  ModelObject,
  belongsTo,
  column,
  computed,
  hasMany,
} from '@ioc:Adonis/Lucid/Orm'
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
  public description: string

  @column()
  public image: string

  @column()
  public tags: string

  @column()
  public likes: number

  @column()
  public required_age: number

  @column()
  public views: number

  @column()
  public ask_verif: boolean

  @column()
  @slugify({
    strategy: 'dbIncrement',
    fields: ['title'],
  })
  public slug: string

  @column()
  @hasMany(() => Comment, {
    foreignKey: 'post',
    onQuery: (query) => query.preload('author').orderBy('created_at', 'desc'),
  })
  public comments: HasMany<typeof Comment>

  @column()
  public content: string

  @column()
  public is_last: boolean

  @column()
  public comment_count: number

  @column()
  public is_verified: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @computed({ serializeAs: 'has_permission' })
  public get hasPermission() {
    const user = HttpContext.get()!.auth.user || {
      id: 0,
      permission: Permissions.User,
    }

    return Number(this.author) === user.id || user.permission >= Permissions.Moderator
  }

  public serialize(cherryPick?: CherryPick | undefined): ModelObject {
    return {
      ...this.serializeAttributes(cherryPick?.fields, false),
      ...this.serializeComputed(cherryPick?.fields),
      ...this.serializeRelations(
        {
          author: {
            fields: { omit: ['email', 'updated_at', 'birthdate'] },
          },
          comments: { fields: { omit: ['post'] } },
        },
        false
      ),
    }
  }
}
