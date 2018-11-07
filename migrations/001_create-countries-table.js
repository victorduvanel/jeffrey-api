function up(knex) {
  return knex.schema.createTable('countries', (table) => {
    table.uuid('id').primary();

    table.string('name');
    table.string('code').unique();
    table.string('phone_code');
    table.string('region');
    table.string('flag');
    table.string('currency_code');
    table.boolean('is_enabled');
    table.string('sms_from');

    table.dateTime('created_at');
    table.dateTime('updated_at');
  });
}

function down(knex) {
  return knex.schema.dropTable('countries');
}

module.exports = { up, down };
