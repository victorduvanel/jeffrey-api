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
        serviceCategoryId: '297ba79f-4065-4a27-a6cd-3f59383af701',
        price: 1400,
        currency: 'EUR'
      }
    );
  });
};
