function up(knex) {
  return knex.schema
    .createTable('voice_conversations', (table) => {
      table.uuid('id').primary();
      table.string('sid').unique();

      table
        .uuid('from_id')
        .references('phone_numbers.id')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT');

      table
        .uuid('to_id')
        .references('phone_numbers.id')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT');

      table.dateTime('started_at');
      table.integer('duration').unsigned();

      table.dateTime('created_at');
      table.dateTime('updated_at');
    });
}

function down(knex) {
  return knex.schema
    .dropTable('voice_conversations');
}

module.exports = { up, down };
