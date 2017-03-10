function up(knex) {
  return knex.schema
    .createTable('reset_password_tokens', (table) => {
      table.uuid('id').primary();
      table
        .uuid('user_id')
        .references('users.id')
        .onUpdate('CASCADE')
        .onDelete('CASCADE');

      table.dateTime('expired_at');
      table.dateTime('created_at');
      table.dateTime('updated_at');
    });
}

function down(knex) {
  return knex.schema
    .dropTable('reset_password_tokens');
}

module.exports = { up, down };
