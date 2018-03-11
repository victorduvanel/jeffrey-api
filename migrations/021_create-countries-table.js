function up(knex) {
  return knex.schema.createTable('countries', (table) => {
    table.uuid('id').primary();

    table.string('code');
    table.string('name');

    table.dateTime('created_at');
    table.dateTime('updated_at');
  });
}

function down(knex) {
  return knex.schema.dropTable('countries');
}

module.exports = { up, down };
