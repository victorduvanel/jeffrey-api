exports.seed = function(knex) {
  return knex.raw(`
    INSERT INTO "messages" (
      "id", "from_id", "to_id", "created_at", "updated_at"
    ) VALUES (
      :id, :fromId, :toId,
      :createdAt, :updatedAt
    )
    ON CONFLICT DO NOTHING
  `, {
    id          : '80EA2E2E-F7CD-4403-A1A6-DAC807096F37',
    fromId      : '9fa666e8-556e-400e-a356-3078fdb3f8e3',
    toId        : '59c3e601-d8b0-432a-b344-2d8849d80355',
    createdAt   : '2017-02-22 00:17:00.258217+08',
    updatedAt   : '2017-02-22 00:17:00.258217+08'
  })
  .then(() => {
    return knex.raw(`
      INSERT INTO "messages" (
        "id", "from_id", "to_id", "created_at", "updated_at"
      ) VALUES (
        :id, :fromId, :toId,
        :createdAt, :updatedAt
      )
      ON CONFLICT DO NOTHING
    `, {
      id          : 'CF034BDB-9F8E-4466-A5F0-D2B00204C508',
      fromId      : '9fa666e8-556e-400e-a356-3078fdb3f8e3',
      toId        : '59c3e601-d8b0-432a-b344-2d8849d80355',
      createdAt   : '2017-02-22 00:17:00.258217+08',
      updatedAt   : '2017-02-22 00:17:00.258217+08'
    });
  })
  .then(() => {
    return knex.raw(`
      INSERT INTO "messages" (
        "id", "from_id", "to_id", "created_at", "updated_at"
      ) VALUES (
        :id, :fromId, :toId,
        :createdAt, :updatedAt
      )
      ON CONFLICT DO NOTHING
    `, {
      id          : '63E96454-4DB3-40BC-93C0-DD815C9F8202',
      fromId      : '9fa666e8-556e-400e-a356-3078fdb3f8e3',
      toId        : '59c3e601-d8b0-432a-b344-2d8849d80355',
      createdAt   : '2017-01-22 00:17:00.258217+08',
      updatedAt   : '2017-01-22 00:17:00.258217+08'
    });
  })
  .then(() => {
    return knex.raw(`
      INSERT INTO "messages" (
        "id", "from_id", "to_id", "created_at", "updated_at"
      ) VALUES (
        :id, :fromId, :toId,
        :createdAt, :updatedAt
      )
      ON CONFLICT DO NOTHING
    `, {
      id          : '918A06B0-DC60-4EB8-9F06-FB00B5D5018A',
      fromId      : '59c3e601-d8b0-432a-b344-2d8849d80355',
      toId        : '9fa666e8-556e-400e-a356-3078fdb3f8e3',
      createdAt   : '2017-02-22 00:17:00.258217+08',
      updatedAt   : '2017-02-22 00:17:00.258217+08'
    });
  });
};
