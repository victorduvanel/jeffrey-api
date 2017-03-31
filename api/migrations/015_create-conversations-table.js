function up(knex) {
  return knex.schema
    .createTable('conversations', (table) => {
      table.uuid('id').primary();
      table
        .uuid('user_id')
        .references('users.id')
        .onUpdate('CASCADE')
        .onDelete('CASCADE');

      table
        .uuid('from_id')
        .references('phone_numbers.id')
        .onUpdate('CASCADE')
        .onDelete('CASCADE');

      table
        .uuid('to_id')
        .references('phone_numbers.id')
        .onUpdate('CASCADE')
        .onDelete('CASCADE');

      table.dateTime('last_activity');

      table.dateTime('created_at');
      table.dateTime('updated_at');

      table.unique(['user_id', 'from_id', 'to_id']);
    });
}

function down(knex) {
  return knex.schema
    .dropTable('conversations');
}

module.exports = { up, down };
