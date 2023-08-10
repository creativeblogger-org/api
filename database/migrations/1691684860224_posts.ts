import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'posts'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('age_restricted')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
