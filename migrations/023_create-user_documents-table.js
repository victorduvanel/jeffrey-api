function up(knex) {
  return knex.schema.createTable('user_documents', (table) => {
    table.uuid('id').primary();

    table.string('mime');
    table.string('uri');
    table.enum('purpose', ['identity_document']);

    table
      .uuid('owner_id')
      .references('users.id')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');

    table.dateTime('created_at');
    table.dateTime('updated_at');
  });
}

function down(knex) {
  return knex.schema.dropTable('user_documents');
}

module.exports = { up, down };
