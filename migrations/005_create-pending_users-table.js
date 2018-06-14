function up(knex) {
  return knex.schema
    .createTable('pending_users', (table) => {
      table.uuid('id').primary();
      table.string('email');
      table.string('locale');
      table.dateTime('created_at');
      table.dateTime('updated_at');
    });
}

function down(knex) {
  return knex.schema
    .dropTable('pending_users');
}

module.exports = { up, down };
