function up(knex) {
  return knex.schema
    .createTable('stripe_cards', (table) => {
      table.string('id').primary();
      table
        .uuid('user_id')
        .references('users.id')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT');

      table.string('environment');
      table.string('type');
      table.string('last_four');
      table.string('exp_month');
      table.string('exp_year');
      table.string('holder_name');

      table.dateTime('created_at');
      table.dateTime('updated_at');
    });
}

function down(knex) {
  return knex.schema
    .dropTable('stripe_cards');
}

module.exports = { up, down };
