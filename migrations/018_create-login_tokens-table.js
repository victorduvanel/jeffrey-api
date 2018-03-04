function up(knex) {
  return knex.schema.createTable('login_tokens', (table) => {
    table.uuid('id').primary();

    table
      .uuid('user_id')
      .references('users.id')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');

    table.dateTime('used_at');

    table.dateTime('created_at');
    table.dateTime('updated_at');
  });
}

function down(knex) {
  return knex.schema.dropTable('login_tokens');
}

module.exports = { up, down };
