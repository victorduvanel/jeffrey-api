import uuid from 'uuid';

exports.seed = async (knex, Promise) => {
  const users = await knex('users').select('id');

  return Promise.map(users, user => {
    return knex.raw(
      `
        INSERT INTO "provider_prices" (
          "id", "user_id", "service_category_id", "price", "is_enabled", "currency", "created_at",
          "updated_at"
        ) VALUES (
          :id, :userId, :serviceCategoryId, :price, :isEnabled, :currency, NOW(), NOW()
        )
        ON CONFLICT DO NOTHING
      `,
      {
        id: uuid.v4(),
        userId: user.id,
        serviceCategoryId: 'e7475032-c56b-4ade-a5ee-4e0bd7a4adde',
        price: 1400,
        currency: 'EUR',
        isEnabled: true
      }
    );
  });
};
