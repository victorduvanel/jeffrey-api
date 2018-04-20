function up(knex) {
  return knex.schema.createTable('providers', (table) => {
    table.string('id').primary();
    table
      .uuid('user_id')
      .references('users.id')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT')
      .unique();

    table.dateTime('created_at');
    table.dateTime('updated_at');
  });
}

function down(knex) {
  return knex.schema.dropTable('providers');
}

module.exports = { up, down };
