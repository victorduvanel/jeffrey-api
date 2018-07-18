import uuid from 'uuid';

exports.seed = async (knex, Promise) => {
  const users = await knex('users').select('id');

  return Promise.map(users, user => {
    return knex.raw(
      `
        INSERT INTO "provider_prices" (
          "id", "user_id", "service_category_id", "price", "currency", "created_at",
          "updated_at"
        ) VALUES (
          :id, :userId, :serviceCategoryId, :price, :currency, NOW(), NOW()
        )
        ON CONFLICT DO NOTHING
      `,
      {
        id: uuid.v4(),
        userId: user.id,
        serviceCategoryId: '555d8eb4-d6d1-421c-a7f4-ee49b332f41e',
        price: 1400,
        currency: 'EUR'
      }
    );
  });
};
