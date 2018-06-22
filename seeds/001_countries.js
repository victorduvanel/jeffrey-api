import uuid from 'uuid';
import countries from './json/countries.json';

exports.seed = (knex, Promise) => {
  return Promise.map(countries, (country) => {
    return knex.raw(`
      INSERT INTO countries (
        id, name, code, phone_code, region, is_enabled, alpha_support, flag, currency_code,
        created_at, updated_at
      ) VALUES (
        :id, :name, :code, :phone_code, :region, :is_enabled, :alpha_support, :flag, :currency_code,
        NOW(), NOW()
      )
      ON CONFLICT DO NOTHING
    `, {
      id: uuid.v4(),
      ...country
    });
  });
};
