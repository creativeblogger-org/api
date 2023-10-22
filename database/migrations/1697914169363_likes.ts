import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'likes'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('user')
        .unsigned()
        .references('users.id')
      table
        .integer('post')
        .unsigned()
        .references('posts.id')
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
