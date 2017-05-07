function up(knex) {
  return knex.schema
    .createTable('invoice_items', (table) => {
      table.uuid('id').primary();
      table
        .uuid('invoice_id')
        .references('invoices.id')
        .onUpdate('CASCADE')
        .onDelete('CASCADE');

      table
        .uuid('product_id')
        .references('products.id')
        .onUpdate('CASCADE')
        .onDelete('CASCADE');

      table.integer('quantity');
      table.integer('amount');

      table.dateTime('created_at');
      table.dateTime('updated_at');
    });
}

function down(knex) {
  return knex.schema
    .dropTable('invoice_items');
}

module.exports = { up, down };
