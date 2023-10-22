import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'posts'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer("ask_verif")
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
