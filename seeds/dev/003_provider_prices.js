import uuid from 'uuid/v4';

exports.seed = async (knex, Promise) => {
  const users = await knex('users').select('id');
  const categories = await knex('service_categories').select('id');
  const providerPrices = [];

  users.forEach((user) => {
    categories.forEach((category) => {
      providerPrices.push({
        id: uuid(),
        userId: user.id,
        serviceCategoryId: category.id,
        price: 1400,
        currency: 'EUR',
        isEnabled: true
      });
    });
  });

  return Promise.map(providerPrices, providerPrice => {
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
      providerPrice
    );
  });
};
