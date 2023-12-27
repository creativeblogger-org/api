import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.text('biography')
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
