exports.seed = function(knex) {
  return knex.raw(`
    INSERT INTO "conversations" (
      "id", "name", "user_id", "from_id", "to_id",
      "last_activity", "created_at", "updated_at"
    ) VALUES (
      :id, :name, :userId, :fromId, :toId,
      NOW(), NOW(), NOW()
    )
    ON CONFLICT DO NOTHING
  `, {
    id          : '6a28b973-d48b-44e6-b7f8-9b58f695361d',
    name        : 'Bonjour',
    userId      : '2fe88767-9af9-4944-abb0-03fbdb2ab1da',
    fromId      : '9fa666e8-556e-400e-a356-3078fdb3f8e3',
    toId        : 'A9DBE4CD-E654-4BCD-A2B5-64542B918625'
  });
};
