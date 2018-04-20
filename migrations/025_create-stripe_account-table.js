function up(knex) {
  return knex.schema.createTable('stripe_accounts', (table) => {
    table.string('id').primary();
    table
      .uuid('user_id')
      .references('users.id')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT')
      .unique();
    table.boolean('has_external_account');

    table.dateTime('created_at');
    table.dateTime('updated_at');
  });
}

function down(knex) {
  return knex.schema.dropTable('stripe_accounts');
}

module.exports = { up, down };
