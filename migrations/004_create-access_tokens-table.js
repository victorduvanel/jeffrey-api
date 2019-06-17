function up(knex) {
  return knex.schema.createTable('access_tokens', (table) => {
    table.uuid('id').primary();
    table.string('token').unique();

    table
      .uuid('user_id')
      .references('users.id')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');

    table.dateTime('created_at');
    table.dateTime('updated_at');
  });
}

function down(knex) {
  return knex.schema.dropTable('access_tokens');
}

module.exports = { up, down };
