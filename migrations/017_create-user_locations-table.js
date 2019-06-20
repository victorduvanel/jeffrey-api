export const up = async (knex) => {
  await knex.schema.createTable('user_locations', (table) => {
    table
      .uuid('user_id')
      .references('users.id')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');

    table.float('lat');
    table.float('lng');
    table.string('description');
    table.string('description_locale');
    table.dateTime('timestamp');

    table.dateTime('created_at');
  });
};

export const down = async (knex) => {
  await knex.schema.dropTable('user_locations');
};
