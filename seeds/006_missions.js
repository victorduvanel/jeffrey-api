import uuid    from 'uuid';
import request from 'request-promise';

exports.seed = async function(knex, Promise) {

  const missionsObj = {
    missions: [
      {
        id: uuid.v4(),
        price: '10',
        price_currency: 'EUR',
        provider_id: '3c656ce5-1e21-4332-a268-d7599f2f0e40',
        client_id: 'aaaaaaaa-1e21-4332-a268-d7599f2f0e40',
        service_category_id: '555d8eb4-d6d1-421c-a7f4-ee49b332f41e'
      },
      {
        id: uuid.v4(),
        price: '13',
        price_currency: 'EUR',
        provider_id: '3c656ce5-1e21-4332-a268-d7599f2f0e40',
        client_id: 'aaaaaaaa-1e21-4332-a268-d7599f2f0e40',
        service_category_id: 'c56022e7-596d-4fa6-a0dd-a3f1e8b102b7'
      }

    ]
  }
  const missions = missionsObj.missions.map(mission => ({
    id: uuid.v4(),
    price: mission.price,
    price_currency: mission.price_currency,
    provider_id: mission.provider_id,
    client_id: mission.client_id,
    service_category_id: mission.service_category_id
  }));

  return Promise.map(missions, mission => knex.raw(`
      INSERT INTO "missions" (
        "id", "price", "price_currency", "provider_id", "client_id",
        "service_category_id", "start_date", "end_date", "created_at",
        "updated_at"
      ) VALUES (
        :id, :price, :price_currency, :provider_id, :client_id, :service_category_id, NOW(), NOW(),
        NOW(), NOW()
      )
      ON CONFLICT DO NOTHING
    `, mission));
};
