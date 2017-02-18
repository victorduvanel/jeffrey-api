function up(knex) {
  return knex.schema.createTable('messages', (table) => {
    table.uuid('id').primary();
    table.string('sid').unique();
    table.text('body');

    table
      .uuid('from_id')
      .references('phone_numbers.id')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');

    table
      .uuid('to_id')
      .references('phone_numbers.id')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');

    table.dateTime('created_at');
    table.dateTime('updated_at');
  });
}

function down(knex) {
  return knex.schema.dropTable('messages');
}

module.exports = { up, down };
