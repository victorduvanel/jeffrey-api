function up(knex) {
  return knex.schema
    .createTable('subscriptions', (table) => {
      table.uuid('id').primary();

      table
        .uuid('user_id')
        .references('users.id')
        .onUpdate('CASCADE')
        .onDelete('CASCADE');

      table.enum('frequency', ['monthly', 'yearly']);

      table.date('last_renewal');
      table.date('next_renewal');

      table.date('canceled_at');

      table.dateTime('created_at');
      table.dateTime('updated_at');
    })
    .createTable('phone_numbers_subscriptions', (table) => {
      table.uuid('subscription_id');
      table.uuid('phone_number_id');

      table.dateTime('created_at');
      table.dateTime('updated_at');

      table.primary(['subscription_id', 'phone_number_id']);
    });
}

function down(knex) {
  return knex.schema
    .dropTable('subscriptions')
    .dropTable('phone_numbers_subscriptions');
}

module.exports = { up, down };
