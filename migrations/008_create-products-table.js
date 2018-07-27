function up(knex) {
  return knex.schema
    .createTable('products', (table) => {
      table.uuid('id').primary();
      table.string('slug');
      table.dateTime('created_at');
      table.dateTime('updated_at');
    });
}

function down(knex) {
  return knex.schema
    .dropTable('products');
}

module.exports = { up, down };
