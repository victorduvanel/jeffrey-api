function up(knex) {
  return knex.schema.createTable('provider_prices', (table) => {
    table.string('id').primary();
    table
      .uuid('user_id')
      .references('users.id')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');
    table
      .uuid('service_category_id')
      .references('service_categories.id')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');
    table.integer('price');
    table.string('currency');
    table.dateTime('created_at');
    table.dateTime('updated_at');
  });
}

function down(knex) {
  return knex.schema.dropTable('provider_prices');
}

module.exports = { up, down };
