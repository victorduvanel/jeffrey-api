function up(knex) {
  return knex.schema.createTable('businesses', (table) => {
    table.uuid('id').primary();
    table.string('name');
    table.string('tax_id');
    table.enum('type', ['company', 'individual']);

    table
      .uuid('owner_id')
      .references('users.id')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');

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
  return knex.schema.dropTable('businesses');
}

module.exports = { up, down };
