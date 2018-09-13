export const up = async (knex) => {
  await knex.schema.createTable('service_category_attributes', (table) => {
    table.uuid('id').primary();

    table.string('lang');

    table.string('name');
    table.string('icon');
    table.string('symbol');

    table
      .uuid('service_category_id')
      .references('service_categories.id')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');

    table.dateTime('created_at');
    table.dateTime('updated_at');

    table.unique(['service_category_id', 'lang']);
  });

  await knex.schema.table('service_categories', (table) => {
    table
      .uuid('default_attibutes_id')
      .references('service_category_attributes.id')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');
  });
};

export const down = async (knex) => {
  await knex.schema.table('service_categories', (table) => {
    table.dropColumn('default_attibutes_id');
  });
  await knex.schema.dropTable('service_category_attributes');
};
