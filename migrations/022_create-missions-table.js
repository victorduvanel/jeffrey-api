function up(knex) {
  return knex.schema.createTable('missions', (table) => {
    table.uuid('id').primary();

    table.integer('price');
    table.string('price_currency');

    table.text('description');

    table.enum('payment_method', [
      'credit-card-at-delivery',
      'credit-card-in-app',
      'cash-at-delivery',
      'paypal'
    ]);

    table.float('lat');
    table.float('lng');
    table.string('location');

    table.float('provider_lat');
    table.float('provider_lng');

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
    table.dateTime('started_date');
    table.dateTime('ended_date');

    table.dateTime('pay_tentative_at');
    table.dateTime('paid_at');

    table.boolean('users_notified');

    table.enum('status', [
      'pending',
      'canceled',
      'accepted',
      'refused',
      'started',
      'aborted',
      'confirmed',
      'terminated'
    ]);

    table.dateTime('created_at');
    table.dateTime('updated_at');
  });
}

function down(knex) {
  return knex.schema.dropTable('provider_prices');
}

module.exports = { up, down };
