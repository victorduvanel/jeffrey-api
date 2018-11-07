exports.seed = async (knex, Promise) => {
  const missions = [
    {
      id: 'a567b720-459e-498b-b6c9-46b4822a5aef',
      price: 1000,
      priceCurrency: 'EUR',
      providerId: '3c656ce5-1e21-4332-a268-d7599f2f0e40',
      clientId: '2b1a5696-11eb-4858-ad1a-6b23c4e478cd',
      serviceCategoryId: 'e7475032-c56b-4ade-a5ee-4e0bd7a4adde',
      status: 'pending',
      startedDate: null,
      endedDate: null,
      startDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'b98b5e86-083a-4bf3-97e3-a9a202c0f06d',
      price: 1300,
      priceCurrency: 'EUR',
      providerId: '3c656ce5-1e21-4332-a268-d7599f2f0e40',
      clientId: '2b1a5696-11eb-4858-ad1a-6b23c4e478cd',
      serviceCategoryId: 'e7475032-c56b-4ade-a5ee-4e0bd7a4adde',
      status: 'pending',
      startedDate: null,
      endedDate: null,
      startDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'dd77dd1f-2863-4480-8ce0-cf7751a9fc46',
      price: 1300,
      priceCurrency: 'EUR',
      providerId: '3c656ce5-1e21-4332-a268-d7599f2f0e40',
      clientId: '2b1a5696-11eb-4858-ad1a-6b23c4e478cd',
      serviceCategoryId: 'e7475032-c56b-4ade-a5ee-4e0bd7a4adde',
      status: 'pending',
      startedDate: null,
      endedDate: null,
      startDate: new Date('2018-09-18 11:27:54.151148+02'),
      createdAt: new Date('2018-09-18 11:27:54.151148+02'),
      updatedAt: new Date('2018-09-18 11:27:54.151148+02')
    },
    {
      id: '634cbc2e-b97a-4015-8c6d-4a6a91d5a0de',
      price: 1300,
      priceCurrency: 'EUR',
      providerId: '3c656ce5-1e21-4332-a268-d7599f2f0e40',
      clientId: '2b1a5696-11eb-4858-ad1a-6b23c4e478cd',
      serviceCategoryId: 'e7475032-c56b-4ade-a5ee-4e0bd7a4adde',
      status: 'pending',
      startedDate: null,
      endedDate: null,
      startDate: new Date('2018-09-18 11:27:54.151148+02'),
      createdAt: new Date('2018-09-18 11:27:54.151148+02'),
      updatedAt: new Date('2018-09-18 11:27:54.151148+02')
    },
    {
      id: '1f2d3cec-e861-477a-8408-a46e175b68c8',
      price: 1300,
      priceCurrency: 'EUR',
      providerId: '3c656ce5-1e21-4332-a268-d7599f2f0e40',
      clientId: '2b1a5696-11eb-4858-ad1a-6b23c4e478cd',
      serviceCategoryId: 'e7475032-c56b-4ade-a5ee-4e0bd7a4adde',
      status: 'terminated',
      startedDate: new Date('2018-09-18 09:27:54.151148+02'),
      endedDate: new Date('2018-09-18 11:27:54.151148+02'),
      startDate: new Date('2018-09-18 09:27:54.151148+02'),
      createdAt: new Date('2018-08-18 09:27:54.151148+02'),
      updatedAt: new Date('2018-09-18 09:27:54.151148+02')
    },
  ];

  return Promise.map(missions, mission => {
    return knex.raw(
      `INSERT INTO "missions" (
          "id", "price", "price_currency", "provider_id", "client_id",
          "service_category_id", "start_date", "status",
          "started_date", "ended_date",
          "created_at", "updated_at"
        ) VALUES (
          :id, :price, :priceCurrency,
          :providerId, :clientId,
          :serviceCategoryId,
          :startDate, :status,
          :startedDate, :endedDate,
          :createdAt, :updatedAt
        )
        ON CONFLICT DO NOTHING
      `,
      mission
    );
  });
};
