function up(knex) {
  return knex.schema.createTable('tos_acceptances', (table) => {
    table.uuid('id').primary();
    table.string('ip');
    table.string('user_agent');
    table
      .uuid('user_id')
      .references('users.id')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');
    table.dateTime('created_at');
    table.dateTime('updated_at');
  });
}

function down(knex) {
  return knex.schema.dropTable('tos_acceptances');
}

module.exports = { up, down };
