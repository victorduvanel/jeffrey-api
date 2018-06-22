exports.seed = async (knex, Promise) => {
  const missions = [
    {
      id: 'a567b720-459e-498b-b6c9-46b4822a5aef',
      price: 1000,
      priceCurrency: 'EUR',
      providerId: '3c656ce5-1e21-4332-a268-d7599f2f0e40',
      clientId: '2b1a5696-11eb-4858-ad1a-6b23c4e478cd',
      serviceCategoryId: '555d8eb4-d6d1-421c-a7f4-ee49b332f41e',
      status: 'pending'
    },
    {
      id: 'b98b5e86-083a-4bf3-97e3-a9a202c0f06d',
      price: 1300,
      priceCurrency: 'EUR',
      providerId: '3c656ce5-1e21-4332-a268-d7599f2f0e40',
      clientId: '2b1a5696-11eb-4858-ad1a-6b23c4e478cd',
      serviceCategoryId: 'c56022e7-596d-4fa6-a0dd-a3f1e8b102b7',
      status: 'pending'
    }
  ];

  return Promise.map(missions, mission => {
    return knex.raw(
      `INSERT INTO "missions" (
          "id", "price", "price_currency", "provider_id", "client_id",
          "service_category_id", "start_date", "status",
          "created_at", "updated_at"
        ) VALUES (
          :id, :price, :priceCurrency,
          :providerId, :clientId,
          :serviceCategoryId,
          NOW(), :status,
          NOW(), NOW()
        )
        ON CONFLICT DO NOTHING
      `,
      mission
    );
  });
};
