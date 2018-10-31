function up(knex) {
  return knex.schema
    .createTable('apple_ios_receipts', (table) => {
      table.uuid('id').primary();
      table.string('transaction_id').unique();
      table.uuid('receipt_file_id');
      table.integer('quantity');
      table.dateTime('purchase_date');
      table.dateTime('expires_date');

      table
        .uuid('product_id')
        .references('products.id')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT');

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
  return knex.schema
    .dropTable('apple_ios_receipts');
}

module.exports = { up, down };
