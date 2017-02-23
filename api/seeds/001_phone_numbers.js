exports.seed = function(knex) {
  return knex.raw(`
    INSERT INTO "phone_numbers" (
      "id", "phone_number", "owned", "created_at", "updated_at"
    ) VALUES (:id, :phoneNumber, :owned, NOW(), NOW())
    ON CONFLICT DO NOTHING
  `, {
    id          : '9fa666e8-556e-400e-a356-3078fdb3f8e3',
    phoneNumber : '+33644641618',
    owned       : true
  })
  .then(() => {
    return knex.raw(`
      INSERT INTO "phone_numbers" (
        "id", "phone_number", "owned", "created_at", "updated_at"
      ) VALUES (:id, :phoneNumber, :owned, NOW(), NOW())
      ON CONFLICT DO NOTHING
    `, {
      id          : 'dcd5d5bc-426f-44be-9a23-0fa7bb2da5bd',
      phoneNumber : '+33644641504',
      owned       : true
    });
  })
  .then(() => {
    return knex.raw(`
      INSERT INTO "phone_numbers" (
        "id", "phone_number", "owned", "created_at", "updated_at"
      ) VALUES (:id, :phoneNumber, :owned, NOW(), NOW())
      ON CONFLICT DO NOTHING
    `, {
      id          : '59c3e601-d8b0-432a-b344-2d8849d80355',
      phoneNumber : '+33651648566',
      owned       : false
    });
  });
};
