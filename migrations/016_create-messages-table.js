function up(knex) {
  return knex.schema.createTable('messages', (table) => {
    table.uuid('id').primary();
    table.text('body');

    table
      .uuid('conversation_id')
      .references('conversations.id')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');

    table
      .uuid('from_id')
      .references('users.id')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');

    table
      .uuid('message_id');

    table.dateTime('created_at');
    table.dateTime('updated_at');
  });
}

function down(knex) {
  return knex.schema.dropTable('messages');
}

module.exports = { up, down };
