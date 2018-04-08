function up(knex) {
  return knex.schema.createTable('reviews', (table) => {
    table.uuid('id').primary();
    table.integer('rank');
    table.string('message');
    table
      .uuid('provider_id')
      .references('users.id')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');
    table
      .uuid('author_id')
      .references('users.id')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');
    table.dateTime('created_at');
    table.dateTime('updated_at');
  });
}

function down(knex) {
  return knex.schema.dropTable('phone_number_verifications');
}

module.exports = { up, down };
