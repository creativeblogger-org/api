import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'banner'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.string('content')
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
