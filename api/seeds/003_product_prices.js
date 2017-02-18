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
  });
};
