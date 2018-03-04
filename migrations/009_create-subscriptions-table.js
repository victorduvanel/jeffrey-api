function up(knex) {
  return knex.schema
    .createTable('subscriptions', (table) => {
      table.uuid('id').primary();

      table
        .uuid('user_id')
        .references('users.id')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT');

      table
        .uuid('phone_number_id')
        .references('phone_numbers.id')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT');

      table.enum('frequency', ['monthly', 'yearly']);

      table.date('last_renewal');
      table.date('next_renewal');

      table.date('canceled_at');

      table.dateTime('created_at');
      table.dateTime('updated_at');
    });
}

function down(knex) {
  return knex.schema
    .dropTable('subscriptions')
    .dropTable('phone_numbers_subscriptions');
}

module.exports = { up, down };
