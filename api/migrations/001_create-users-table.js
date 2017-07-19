function up(knex) {
  return knex.schema
    .createTable('users', (table) => {
      table.uuid('id').primary();
      table.string('email').unique();
      table.string('google_id').unique();
      table.string('facebook_id').unique();
      table.string('password');
      table.string('first_name');
      table.string('last_name');
      table.dateTime('created_at');
      table.dateTime('updated_at');
    });
}

function down(knex) {
  return knex.schema
    .dropTable('users');
}

module.exports = { up, down };
