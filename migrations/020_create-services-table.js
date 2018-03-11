function up(knex) {
  return knex.schema.createTable('services', (table) => {
    table.uuid('id').primary();

    table.string('name');

    table.dateTime('created_at');
    table.dateTime('updated_at');
  });
}

function down(knex) {
  return knex.schema.dropTable('services');
}

module.exports = { up, down };
