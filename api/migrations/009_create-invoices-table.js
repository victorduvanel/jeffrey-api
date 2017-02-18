function up(knex) {
  return knex.schema
    .createTable('invoices', (table) => {
      table.uuid('id').primary();

      table
        .uuid('user_id')
        .references('users.id')
        .onUpdate('CASCADE')
        .onDelete('CASCADE');

      table.enum('status', ['paid', 'pending', 'failed']);
      table.enum('currency', ['eur']);
      table.integer('amount');

      table.dateTime('created_at');
      table.dateTime('updated_at');
    });
}

function down(knex) {
  return knex.schema
    .dropTable('invoices');
}

module.exports = { up, down };
