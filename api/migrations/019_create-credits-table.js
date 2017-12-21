function up(knex) {
  return knex.schema.createTable('credits', (table) => {
    table.uuid('id').primary();

    table
      .uuid('user_id')
      .references('users.id')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');

    table.integer('amount');

    table.dateTime('created_at');
    table.dateTime('updated_at');
  });
}

function down(knex) {
  return knex.schema.dropTable('credits');
}

module.exports = { up, down };
