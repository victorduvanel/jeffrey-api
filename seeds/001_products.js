exports.seed = function(knex) {
  return knex.raw(`
    INSERT INTO "products" (
      "id", "slug", "created_at", "updated_at"
    ) VALUES (:id, :slug, NOW(), NOW())
    ON CONFLICT DO NOTHING
  `, {
    id   : 'c20ff7a5-bd85-479a-96ff-a429b5be8b59',
    slug : 'french_mobile_phone_number'
  })
    .then(() => {
      return knex.raw(`
      INSERT INTO "products" (
        "id", "slug", "created_at", "updated_at"
      ) VALUES (:id, :slug, NOW(), NOW())
      ON CONFLICT DO NOTHING
    `, {
        id   : 'cfe1028a-b175-4f32-8087-a67e0b5efddf',
        slug : 'french_incomming_sms'
      });
    })
    .then(() => {
      return knex.raw(`
      INSERT INTO "products" (
        "id", "slug", "created_at", "updated_at"
      ) VALUES (:id, :slug, NOW(), NOW())
      ON CONFLICT DO NOTHING
    `, {
        id   : '8739cdec-413c-459f-94f3-248fb43c49db',
        slug : 'french_outgoing_sms'
      });
    })
    .then(() => {
      return knex.raw(`
      INSERT INTO "products" (
        "id", "slug", "created_at", "updated_at"
      ) VALUES (:id, :slug, NOW(), NOW())
      ON CONFLICT DO NOTHING
    `, {
        id   : '3fe3e763-eb2b-435c-af6e-61113e27aa44',
        slug : 'apple-io-credit-small'
      });
    })
    .then(() => {
      return knex.raw(`
      INSERT INTO "products" (
        "id", "slug", "created_at", "updated_at"
      ) VALUES (:id, :slug, NOW(), NOW())
      ON CONFLICT DO NOTHING
    `, {
        id   : 'd9edce77-d0f4-4773-94de-6fb53812bbae',
        slug : 'apple-io-credit-medium'
      });
    })
    .then(() => {
      return knex.raw(`
      INSERT INTO "products" (
        "id", "slug", "created_at", "updated_at"
      ) VALUES (:id, :slug, NOW(), NOW())
      ON CONFLICT DO NOTHING
    `, {
        id   : 'cfcc7d2d-b704-4083-a775-38b9d229cc90',
        slug : 'ten-euros-credit'
      });
    });
};
