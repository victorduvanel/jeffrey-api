function up(knex) {
  return knex.schema
    .createTable('product_prices', (table) => {
      table.uuid('id').primary();
      table.enum('currency', ['eur']);
      table.integer('value');
      table.dateTime('available_at');

      table
        .uuid('product_id')
        .references('products.id')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT');

      table.dateTime('created_at');
      table.dateTime('updated_at');
    });
}

function down(knex) {
  return knex.schema
    .dropTable('product_prices');
}

module.exports = { up, down };
