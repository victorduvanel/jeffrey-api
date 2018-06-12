exports.seed = function(knex, Promise) {
  const countries = [
    {
      id: '15ADFA6B-AFB3-47D0-9710-714E940B06AC',
      name: 'United States',
      code: 'US',
      phone_code: 1,
      region: 'US'
    },
    {
      id: '6555D2DE-4600-45EA-A47D-1120CBB9811E',
      name: 'France',
      code: 'FR',
      phone_code: 33,
      region: 'EU'
    },
    {
      id: 'FEBEB123-09B6-401D-96EB-863182A83934',
      name: 'Japan',
      code: 'JP',
      phone_code: 81,
      region: 'ASIA'
    },
    {
      id: '05DA5186-00DB-4263-B973-769A386AC219',
      name: 'South Korea',
      code: 'KR',
      phone_code: 82,
      region: 'ASIA'
    },
    {
      id: '3D401EE9-D011-4D2A-83E6-33DD2EDDC478',
      name: 'Switzerland',
      code: 'CH',
      phone_code: 41,
      region: 'EU'
    },
    {
      id: 'D61613C7-71A1-4C8B-B7E9-9331B93A4161',
      name: 'United Kingdom',
      code: 'GB',
      phone_code: 44,
      region: 'EU'
    },
    {
      id: 'E66F4C6E-E0A7-4823-A1BE-2CAF8A5D7952',
      name: 'Spain',
      code: 'ES',
      phone_code: 34,
      region: 'EU'
    },
  ];

  return Promise.map(countries, country => knex.raw(`
    INSERT INTO "countries" (
      "id", "name", "code", "phone_code", "region",
      "created_at", "updated_at"
    ) VALUES (
      :id, :name, :code, :phone_code, :region,
      NOW(), NOW()
    )
    ON CONFLICT DO NOTHING
  `, country));
};
