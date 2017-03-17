function up(knex) {
  return knex.schema
    .createTable('voice_conversations', (table) => {
      table.uuid('id').primary();
      table.string('sid').unique();

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

      table.dateTime('started_at');
      table.dateTime('ended_at');

      table.dateTime('created_at');
      table.dateTime('updated_at');
    });
}

function down(knex) {
  return knex.schema
    .dropTable('voice_conversations');
}

module.exports = { up, down };
