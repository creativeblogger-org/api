import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Banner extends BaseModel {
    @column()
    public content: string
    @column()
    public color: string
    @column()
    public link_text: string
    @column()
    public link: string
}
