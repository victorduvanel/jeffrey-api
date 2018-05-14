function up(knex) {
  return knex.schema
    .createTable('conversation_participants', (table) => {
      table
        .uuid('user_id')
        .references('users.id')
        .onUpdate('CASCADE')
        .onDelete('CASCADE');

      table
        .uuid('conversation_id')
        .references('conversations.id')
        .onUpdate('CASCADE')
        .onDelete('CASCADE');

      table.unique(['user_id', 'conversation_id']);
    });
}

function down(knex) {
  return knex.schema
    .dropTable('conversations');
}

module.exports = { up, down };
