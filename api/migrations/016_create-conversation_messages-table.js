function up(knex) {
  return knex.schema
    .createTable('conversation_messages', (table) => {
      table.uuid('id').primary();
      table.specificType('position', 'BIGSERIAL');

      table
        .uuid('conversation_id')
        .references('conversations.id')
        .onUpdate('CASCADE')
        .onDelete('CASCADE');

      table
        .uuid('message_id')
        .references('messages.id')
        .onUpdate('CASCADE')
        .onDelete('CASCADE');

      table.enum('type', ['incoming', 'outgoing']);

      table.dateTime('created_at');
      table.dateTime('updated_at');

      table.unique(['id', 'conversation_id']);
    });
}

function down(knex) {
  return knex.schema
    .dropTable('conversation_messages');
}

module.exports = { up, down };
