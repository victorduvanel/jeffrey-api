import uuid    from 'uuid';
import request from 'request-promise';

exports.seed = async function(knex, Promise) {

  const provider = {
    prices: [{
      user_id: '3c656ce5-1e21-4332-a268-d7599f2f0e40',
      service_category_id: '555d8eb4-d6d1-421c-a7f4-ee49b332f41e',
      price: '10'
    },
    {
      user_id: '3c656ce5-1e21-4332-a268-d7599f2f0e40',
      service_category_id: '7949f6ae-9d5f-4858-9f15-be85a3942c7c',
      price: '11'
    },
    {
      user_id: '3c656ce5-1e21-4332-a268-d7599f2f0e40',
      service_category_id: '00e45aec-b77c-4be3-a8dd-5c7c07733419',
      price: '12'
    },
    {
      user_id: '3c656ce5-1e21-4332-a268-d7599f2f0e40',
      service_category_id: '3d2a65c1-a2b7-4957-adfa-6128e704ae87',
      price: '13'
    },
    {
      user_id: '3c656ce5-1e21-4332-a268-d7599f2f0e40',
      service_category_id: '86048909-155d-4f88-80c3-7345cfc188a3',
      price: '14'
    },
    ]
  }
  const provider_prices = provider.prices.map(pp => ({
    id: uuid.v4(),
    user_id: pp.user_id,
    service_category_id: pp.service_category_id,
    price: pp.price
  }));

  return Promise.map(provider_prices, pp => knex.raw(`
      INSERT INTO "provider_prices" (
        "id", "user_id", "service_category_id", "price", "created_at",
        "updated_at"
      ) VALUES (
        :id, :user_id, :service_category_id, :price, NOW(), NOW()
      )
      ON CONFLICT DO NOTHING
    `, pp));
};
