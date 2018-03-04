function up(knex) {
  return knex.schema
    .createTable('web_notifications', (table) => {
      table.uuid('id').primary();
      table
        .uuid('user_id')
        .references('users.id')
        .onUpdate('CASCADE')
        .onDelete('CASCADE');

      table.text('payload');

      table.dateTime('created_at');
      table.dateTime('updated_at');
    });
}

function down(knex) {
  return knex.schema
    .dropTable('web_notifications');
}

module.exports = { up, down };
