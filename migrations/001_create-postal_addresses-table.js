function up(knex) {
  return knex.schema
    .createTable('postal_addresses', (table) => {
      table.uuid('id').primary();
      table.string('city');
      table.string('country');
      table.string('line1');
      table.string('line2');
      table.string('postal_code');
      table.string('state');
      table.dateTime('created_at');
      table.dateTime('updated_at');
    });
}

function down(knex) {
  return knex.schema
    .dropTable('postal_addresses');
}

module.exports = { up, down };
