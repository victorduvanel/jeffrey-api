function up(knex) {
  return knex.schema.createTable('messages', (table) => {
    table.uuid('id').primary();
    table.string('sid').unique();
    table.text('body');

    table
      .uuid('from_id')
      .references('users.id')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');

    table
      .uuid('to_id')
      .references('users.id')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');

    table.dateTime('created_at');
    table.dateTime('updated_at');
  });
}

function down(knex) {
  return knex.schema.dropTable('messages');
}

module.exports = { up, down };
