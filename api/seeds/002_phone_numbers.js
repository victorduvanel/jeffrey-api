exports.seed = function(knex) {
  return knex.raw(`
    INSERT INTO "phone_numbers" (
      "id", "phone_number", "owned", "user_id", "created_at", "updated_at"
    ) VALUES (:id, :phoneNumber, :owned, :userId, NOW(), NOW())
    ON CONFLICT DO NOTHING
  `, {
    id          : '9fa666e8-556e-400e-a356-3078fdb3f8e3',
    phoneNumber : '+33644641618',
    owned       : true,
    userId      : '2fe88767-9af9-4944-abb0-03fbdb2ab1da'
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
      id          : 'A9DBE4CD-E654-4BCD-A2B5-64542B918625',
      phoneNumber : '+33651648566',
      owned       : false
    });
  });
};
