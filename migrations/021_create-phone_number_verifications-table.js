function up(knex) {
  return knex.schema.createTable('phone_number_verification_codes', (table) => {
    table.uuid('id').primary();
    table.string('ip');
    table.string('phone_number');
    table.string('verification_code');
    table
      .uuid('user_id')
      .references('users.id')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');
    table.dateTime('created_at');
    table.dateTime('updated_at');
  });
}

function down(knex) {
  return knex.schema.dropTable('phone_number_verification_codes');
}

module.exports = { up, down };
