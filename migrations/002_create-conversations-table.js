function up(knex) {
  return knex.schema
    .createTable('conversations', (table) => {
      table.uuid('id').primary();

      table.dateTime('created_at');
      table.dateTime('updated_at');
    });
}

function down(knex) {
  return knex.schema
    .dropTable('conversations');
}

module.exports = { up, down };
