import uuid from 'uuid';
import countries from './json/countries.json';
import config from '../src/config';

exports.seed = (knex, Promise) => {
  return Promise.map(countries, (country) => {
    return knex.raw(`
      INSERT INTO countries (
        id, name, code, phone_code,
        is_enabled, sms_from, flag,
        currency_code, requires_civil_liability_insurance,
        is_eu,
        created_at, updated_at
      ) VALUES (
        :id, :name, :code, :phone_code,
        :is_enabled, :sms_from, :flag,
        :currency_code, :requires_civil_liability_insurance,
        :is_eu,
        NOW(), NOW()
      )
      ON CONFLICT (code) DO UPDATE
      SET
        name = EXCLUDED.name,
        phone_code = EXCLUDED.phone_code,
        is_enabled = EXCLUDED.is_enabled,
        sms_from = EXCLUDED.sms_from,
        flag = EXCLUDED.flag,
        currency_code = EXCLUDED.currency_code,
        requires_civil_liability_insurance = EXCLUDED.requires_civil_liability_insurance,
        is_eu = EXCLUDED.is_eu,
        updated_at = NOW()
    `, {
      id: uuid.v4(),
      sms_from: country.alpha_support ? config.app.name : (country.sms_from || null),
      requires_civil_liability_insurance: false,
      is_eu: false,
      ...country
    });
  });
};
