
function up(knex) {
  return knex.raw(`
    create extension if not exists cube;
    create extension if not exists earthdistance;
  `);
}

function down(knex) {
  return knex.raw(`
    drop extension if exists earthdistance;
    drop extension if exists cube;
  `);
}

module.exports = { up, down };
