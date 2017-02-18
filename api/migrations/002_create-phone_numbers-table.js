function up(knex) {
  return knex.schema.createTable('phone_numbers', (table) => {
    table.uuid('id').primary();
    table.string('phone_number').unique();
    table.boolean('owned');
    table
      .uuid('user_id')
      .references('users.id')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');
    table.dateTime('created_at');
    table.dateTime('updated_at');
  });
}

function down(knex) {
  return knex.schema.dropTable('phone_numbers');
}

module.exports = { up, down };
