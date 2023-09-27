import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'banner'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('color')
      table.string('link_text')
      table.string('link')
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
