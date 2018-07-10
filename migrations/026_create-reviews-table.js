function up(knex) {
  return knex.schema.createTable('reviews', (table) => {
    table.uuid('id').primary();
    table.integer('rank');
    table.string('message');
    table
      .uuid('mission_id')
      .references('missions.id')
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
  return knex.schema.dropTable('reviews');
}

module.exports = { up, down };
