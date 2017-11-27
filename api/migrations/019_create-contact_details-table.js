function up(knex) {
  return knex.schema.createTable('contact_details', (table) => {
    table.uuid('id').primary();

    table
      .uuid('user_id')
      .references('users.id')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');

    table.string('first_name');
    table.string('last_name');
    table.string('address_first_line');
    table.string('address_second_line');
    table.string('city');
    table.string('postal_code');
    table.string('company_name');
    table.string('vat_number');

    table.dateTime('created_at');
    table.dateTime('updated_at');
  });
}

function down(knex) {
  return knex.schema.dropTable('contact_details');
}

module.exports = { up, down };
