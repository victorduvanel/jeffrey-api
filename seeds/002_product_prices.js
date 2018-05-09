exports.seed = function(knex) {
  return knex.raw(`
    INSERT INTO "product_prices" (
      "id", "currency", "value", "available_at",
      "product_id", "created_at", "updated_at"
    ) VALUES (:id, :currency, :value, :availableAt,
      :productId, NOW(), NOW()
    )
    ON CONFLICT DO NOTHING
  `, {
    id          : '2a4de93c-85e2-4190-ac16-4071508ce512',
    currency    : 'eur',
    value       : 500,
    availableAt : '2017-01-01 00:00:00',
    productId   : 'c20ff7a5-bd85-479a-96ff-a429b5be8b59'
  })
    .then(() => {
      return knex.raw(`
      INSERT INTO "product_prices" (
        "id", "currency", "value", "available_at",
        "product_id", "created_at", "updated_at"
      ) VALUES (:id, :currency, :value, :availableAt,
        :productId, NOW(), NOW()
      )
      ON CONFLICT DO NOTHING
    `, {
        id          : 'cfe1028a-b175-4f32-8087-a67e0b5efddf',
        currency    : 'eur',
        value       : 1,
        availableAt : '2017-01-01 00:00:00',
        productId   : 'cfe1028a-b175-4f32-8087-a67e0b5efddf'
      });
    })
    .then(() => {
      return knex.raw(`
      INSERT INTO "product_prices" (
        "id", "currency", "value", "available_at",
        "product_id", "created_at", "updated_at"
      ) VALUES (:id, :currency, :value, :availableAt,
        :productId, NOW(), NOW()
      )
      ON CONFLICT DO NOTHING
    `, {
        id          : '8739cdec-413c-459f-94f3-248fb43c49db',
        currency    : 'eur',
        value       : 10,
        availableAt : '2017-01-01 00:00:00',
        productId   : '8739cdec-413c-459f-94f3-248fb43c49db'
      });
    })
    .then(() => {
      return knex.raw(`
      INSERT INTO "product_prices" (
        "id", "currency", "value", "available_at",
        "product_id", "created_at", "updated_at"
      ) VALUES (:id, :currency, :value, :availableAt,
        :productId, NOW(), NOW()
      )
      ON CONFLICT DO NOTHING
    `, {
        id          : '960cecc7-259e-4ba6-9641-d68a0856823b',
        currency    : 'eur',
        value       : 549,
        availableAt : '2017-01-01 00:00:00',
        productId   : '3fe3e763-eb2b-435c-af6e-61113e27aa44'
      });
    })
    .then(() => {
      return knex.raw(`
      INSERT INTO "product_prices" (
        "id", "currency", "value", "available_at",
        "product_id", "created_at", "updated_at"
      ) VALUES (:id, :currency, :value, :availableAt,
        :productId, NOW(), NOW()
      )
      ON CONFLICT DO NOTHING
    `, {
        id          : '6f0484b0-9551-495a-8383-c55f4f7fba62',
        currency    : 'eur',
        value       : 1099,
        availableAt : '2017-01-01 00:00:00',
        productId   : 'd9edce77-d0f4-4773-94de-6fb53812bbae'
      });
    })
    .then(() => {
      return knex.raw(`
      INSERT INTO "product_prices" (
        "id", "currency", "value", "available_at",
        "product_id", "created_at", "updated_at"
      ) VALUES (:id, :currency, :value, :availableAt,
        :productId, NOW(), NOW()
      )
      ON CONFLICT DO NOTHING
    `, {
        id          : 'b170f6e7-f26e-48ea-b8a1-72c847e921ab',
        currency    : 'eur',
        value       : 1000,
        availableAt : '2017-01-01 00:00:00',
        productId   : 'cfcc7d2d-b704-4083-a775-38b9d229cc90'
      });
    });
};
