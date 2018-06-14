import uuid from 'uuid';
import countries from './json/countries.json';

exports.seed = function(knex, Promise) {
  return Promise.map(countries, (country) => {
    country.id = uuid.v4();
    console.log(country);
    return knex.raw(`
      INSERT INTO countries (
        id, name, code, phone_code, region, is_enabled, alpha_support, flag, currency_code,
        created_at, updated_at
      ) VALUES (
        :id, :name, :code, :phone_code, :region, :is_enabled, :alpha_support, :flag, :currency_code,
        NOW(), NOW()
      )
      ON CONFLICT DO NOTHING
    `, country);
  });
};

// INSERT INTO 'countries' (
//   'id', 'name', 'code', 'phone_code', 'region',
//   'created_at', 'updated_at'
// ) VALUES (
//   :id, :name, :code, :phone_code, :region,
//   NOW(), NOW()
// )
// ON CONFLICT DO NOTHING



// INSERT INTO 'countries' (
//   'id', 'name', 'code', 'phone_code', 'region', 'is_enable', 'alpha_support', 'flag', 'currency_code',
//   'created_at', 'updated_at'
// ) VALUES (
//   '6fc93a86-ce91-4a59-a9da-19451fbc2519', 'Antigua and Barbuda', 'AG', ':phone_code', ':region', true, true, ':flag', 'EUR',
//   NOW(), NOW()
// )
// ON CONFLICT DO NOTHING