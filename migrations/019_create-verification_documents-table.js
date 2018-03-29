function up(knex) {
  return knex.schema.createTable('verification_documents', (table) => {
    table.uuid('id').primary();
    table.string('uri');
    table.enum('purpose', ['identity_document']);

    table
      .uuid('user_id')
      .references('users.id')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');

    table.dateTime('created_at');
    table.dateTime('updated_at');
  });
}

function down(knex) {
  return knex.schema.dropTable('verification_documents');
}

module.exports = { up, down };
