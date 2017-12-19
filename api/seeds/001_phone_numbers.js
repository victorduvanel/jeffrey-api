exports.seed = function(knex) {
  return knex.raw(`
    INSERT INTO "phone_numbers" (
      "id", "phone_number", "owned", "sid", "created_at", "updated_at"
    ) VALUES (:id, :phoneNumber, :owned, :sid, NOW(), NOW())
    ON CONFLICT DO NOTHING
  `, {
    id          : '9fa666e8-556e-400e-a356-3078fdb3f8e3',
    phoneNumber : '+33644641618',
    sid         : 'PNc418bfdb02a5a6c44268d4a3b294ffc2',
    owned       : true
  })
  .then(() => {
    return knex.raw(`
      INSERT INTO "phone_numbers" (
        "id", "phone_number", "owned", "sid", "created_at", "updated_at"
      ) VALUES (:id, :phoneNumber, :owned, :sid, NOW(), NOW())
      ON CONFLICT DO NOTHING
    `, {
      id          : 'dcd5d5bc-426f-44be-9a23-0fa7bb2da5bd',
      phoneNumber : '+33644641504',
      sid         : 'PNf23bf8bafb1ee5db5b74756d19126d65',
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
      id          : 'A9DBE4CD-E654-4BCD-A2B5-64542B918625',
      phoneNumber : '+33651648566',
      owned       : false
    });
  });
};
