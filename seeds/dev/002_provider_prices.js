exports.seed = (knex, Promise) => {
  const providerPrices = [
    {
      id: '4e145b36-2729-4331-ad6f-9a82cbe8c00b',
      userId: '3c656ce5-1e21-4332-a268-d7599f2f0e40',
      serviceCategoryId: '555d8eb4-d6d1-421c-a7f4-ee49b332f41e',
      price: 1000,
      currency: 'EUR'
    },
    {
      id: '73c90d57-acd9-4117-866c-31602f4d78bc',
      userId: '3c656ce5-1e21-4332-a268-d7599f2f0e40',
      serviceCategoryId: '7949f6ae-9d5f-4858-9f15-be85a3942c7c',
      price: 1100,
      currency: 'EUR'
    },
    {
      id: 'edd91226-f739-4aeb-a6cb-77c88f8ffbe4',
      userId: '3c656ce5-1e21-4332-a268-d7599f2f0e40',
      serviceCategoryId: '00e45aec-b77c-4be3-a8dd-5c7c07733419',
      price: 1200,
      currency: 'EUR'
    },
    {
      id: 'e857b799-7c67-4ea9-947a-87c20b7af240',
      userId: '3c656ce5-1e21-4332-a268-d7599f2f0e40',
      serviceCategoryId: '3d2a65c1-a2b7-4957-adfa-6128e704ae87',
      price: 1300,
      currency: 'EUR'
    },
    {
      id: '2abe2616-143e-4e3f-b576-e244165f3be2',
      userId: '3c656ce5-1e21-4332-a268-d7599f2f0e40',
      serviceCategoryId: '86048909-155d-4f88-80c3-7345cfc188a3',
      price: 1400,
      currency: 'EUR'
    }
  ];

  return Promise.map(providerPrices, providerPrice => {
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
      providerPrice
    );
  });
};
