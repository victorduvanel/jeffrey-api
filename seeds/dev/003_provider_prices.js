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
        serviceCategoryId: 'cfceb483-53f9-47fe-bbc4-45ab5375d6aa',
        price: 1400,
        currency: 'EUR',
        isEnabled: true
      }
    );
  });
};
