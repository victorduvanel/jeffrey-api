import uuid from 'uuid';
import countries from './json/countries.json';
import config from '../src/config';

exports.seed = (knex, Promise) => {
  return Promise.map(countries, (country) => {
    return knex.raw(`
      INSERT INTO countries (
        id, name, code, phone_code, region,
        is_enabled, sms_from, flag,
        currency_code, requires_civil_liability_insurance,
        created_at, updated_at
      ) VALUES (
        :id, :name, :code, :phone_code, :region,
        :is_enabled, :sms_from, :flag,
        :currency_code, :requires_civil_liability_insurance,
        NOW(), NOW()
      )
      ON CONFLICT (code) DO UPDATE
      SET
        sms_from = EXCLUDED.sms_from,
        updated_at = NOW()
    `, {
      id: uuid.v4(),
      sms_from: country.alpha_support ? config.app.name : (country.sms_from || null),
      requires_civil_liability_insurance: false,
      ...country
    });
  });
};
