import { DateTime } from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'
import { column, beforeSave, BaseModel } from '@ioc:Adonis/Lucid/Orm'
import Permissions from 'Contracts/Enums/Permissions'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public username: string

  @column()
  public pp: string | null

  @column({ serializeAs: null })
  public email: string

  @column({ serializeAs: null })
  public password: string

  @column()
  public permission: Permissions

  @column()
  public buymeacoffee: string | null

  @column({ serializeAs: null })
  public rememberMeToken: string | null

  @column.dateTime({ serializeAs: null })
  public birthdate: DateTime

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  public updatedAt: DateTime

  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }
}
