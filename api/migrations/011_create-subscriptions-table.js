function up(knex) {
  return knex.schema
    .createTable('subscriptions', (table) => {
      table.uuid('id').primary();

      table
        .uuid('user_id')
        .references('users.id')
        .onUpdate('CASCADE')
        .onDelete('CASCADE');

      table
        .uuid('product_id')
        .references('products.id')
        .onUpdate('CASCADE')
        .onDelete('CASCADE');

      table.enum('frequency', ['monthly', 'yearly']);
      table.date('renewal_date');
      table.date('canceled_at');

      table.dateTime('created_at');
      table.dateTime('updated_at');
    });
}

function down(knex) {
  return knex.schema
    .dropTable('subscriptions');
}

module.exports = { up, down };
