function up(knex) {
  return knex.schema.createTable('service_categories', (table) => {
    table.uuid('id').primary();
    table.string('slug');
    table.integer('ordinal_position');
    table.string('color');
    table.string('icon');
    table
      .uuid('root_id')
      .references('service_categories.id')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');

    table
      .uuid('parent_id')
      .references('service_categories.id')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');

    table
      .uuid('country_id')
      .references('countries.id')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');

    table.dateTime('created_at');
    table.dateTime('updated_at');
  });
}

function down(knex) {
  return knex.schema.dropTable('service_categories');
}

module.exports = { up, down };
