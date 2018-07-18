import uuid    from 'uuid';

exports.seed = async function(knex, Promise) {
  const addresses = [{
    id: 'b36c1144-d6d3-4b67-ac0f-64a98c2e238a',
    city: 'Paris',
    country: 'FR',
    line_1: '32 rue richer',
    line_2: '',
    postal_code: '75009',
    state: 'Paris'
  }];

  return Promise.map(addresses, address => knex.raw(`
    INSERT INTO "postal_addresses" (
      "id", "city", "country", "line_1", "line_2", "postal_code", "state", "created_at", "updated_at"
    ) VALUES (
      :id, :city, :country, :line_1, :line_2, :postal_code, :state, NOW(), NOW()
    )
    ON CONFLICT DO NOTHING
  `, { id: uuid.v4(), ...address }));
};
