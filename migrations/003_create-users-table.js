function up(knex) {
  return knex.schema
    .createTable('users', (table) => {
      table.uuid('id').primary();
      table.string('country');
      table.string('email').unique();
      table.string('google_id').unique();
      table.string('facebook_id').unique();
      table.string('stripe_customer_id').unique();
      table.string('password');
      table.string('locale');
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
      table.float('lat');
      table.float('lng');
      table
        .uuid('postal_address_id')
        .references('postal_addresses.id')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT');
      table.string('livechat_token').unique();
      table.dateTime('created_at');
      table.dateTime('updated_at');
    });
}

function down(knex) {
  return knex.schema
    .dropTable('users');
}

module.exports = { up, down };
