import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'posts'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('is_verified')
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
