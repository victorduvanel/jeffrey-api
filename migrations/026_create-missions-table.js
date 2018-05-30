function up(knex) {
  return knex.schema.createTable('missions', (table) => {
    table.string('id').primary();

    table.integer('price');
    table.enum('price_currency', [
      'GBP',
      'EUR',
      'USD',
      'KRW',
      'JPY',
      'CHF'
    ]);

    table
      .uuid('provider_id')
      .references('users.id')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');

    table
      .uuid('client_id')
      .references('users.id')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');

    table
      .uuid('service_category_id')
      .references('service_categories.id')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');

    table.dateTime('start_date');
    table.dateTime('end_date');

    table.enum('status', [
      'accepted',
      'refused',
      'canceled',
      'pending'
    ]);

    table.dateTime('created_at');
    table.dateTime('updated_at');
  });
}

function down(knex) {
  return knex.schema.dropTable('provider_prices');
}

module.exports = { up, down };