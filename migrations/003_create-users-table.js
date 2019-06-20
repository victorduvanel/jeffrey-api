function up(knex) {
  return knex.schema
    .createTable('users', (table) => {
      table.uuid('id').primary();
      table.string('stripe_customer_id').unique();
      table.enum('gender', ['male', 'female']);
      table.string('first_name');
      table.string('last_name');
      table.date('date_of_birth');
      table.string('profile_picture');
      table.string('phone_number').unique();
      table.text('bio');
      table.boolean('is_provider');
      table.boolean('is_available');
      table.boolean('is_tester');
      table
        .uuid('postal_address_id')
        .references('postal_addresses.id')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT');
      table.dateTime('created_at');
      table.dateTime('updated_at');
      table.dateTime('last_activity_at');
    });
}

function down(knex) {
  return knex.schema
    .dropTable('users');
}

module.exports = { up, down };
