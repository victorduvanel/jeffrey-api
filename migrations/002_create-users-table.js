function up(knex) {
  return knex.schema
    .createTable('users', (table) => {
      table.uuid('id').primary();
      table.string('country');
      table.string('email').unique();
      table.string('google_id').unique();
      table.string('facebook_id').unique();
      table.string('password');
      table.enum('gender', ['male', 'female']);
      table.string('first_name');
      table.string('last_name');
      table.date('date_of_birth');
      table.string('profile_picture');
      table.string('phone_number');
      table.text('bio');
      table
        .uuid('postal_address_id')
        .references('postal_addresses.id')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT');
      table.dateTime('created_at');
      table.dateTime('updated_at');
    });
}

function down(knex) {
  return knex.schema
    .dropTable('users');
}

module.exports = { up, down };
