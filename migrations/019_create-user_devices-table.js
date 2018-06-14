function up(knex) {
  return knex.schema.createTable('user_devices', (table) => {
    table.uuid('id').primary();

    table.string('token');
    table.enu('type', ['ios']);

    table
      .uuid('owner_id')
      .references('users.id')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');

    table.string('locale');

    table.unique(['token', 'type']);

    table.dateTime('created_at');
    table.dateTime('updated_at');
  });
}

function down(knex) {
  return knex.schema.dropTable('user_devices');
}

module.exports = { up, down };
