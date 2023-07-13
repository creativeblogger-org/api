import { DateTime } from 'luxon'
import {
  BaseModel,
  BelongsTo,
  CherryPick,
  ModelObject,
  belongsTo,
  column,
  computed,
} from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import { slugify } from '@ioc:Adonis/Addons/LucidSlugify'
import HttpContext from '@ioc:Adonis/Core/HttpContext'
import Permissions from 'Contracts/Enums/Permissions'

export default class Shorts extends BaseModel {
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
  @column()
  public content: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @column.dateTime({ serializeAs: null })
  public expiresAt: DateTime

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
            fields: {
              omit: ['email', 'created_at', 'updated_at'],
            },
          },
        },
        false
      ),
    }
  }
}
