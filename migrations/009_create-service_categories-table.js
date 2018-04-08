function up(knex) {
  return knex.schema.createTable('service_categories', (table) => {
    table.uuid('id').primary();

    table.string('name');

    table.dateTime('created_at');
    table.dateTime('updated_at');
  });
}

function down(knex) {
  return knex.schema.dropTable('service_categories');
}

module.exports = { up, down };
