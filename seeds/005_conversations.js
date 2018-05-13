exports.seed = async (knex) => {
  const CONVERSATION_ID = 'c0daff08-f565-413e-a668-5ef432eb8a6b';
  await knex.raw(
    `
      INSERT INTO "conversations" ("id", "created_at", "updated_at")
      VALUES (:id, NOW(), NOW())
      ON CONFLICT DO NOTHING
    `,
    {
      id: CONVERSATION_ID
    });

  await knex.raw(
    `
      INSERT INTO "conversation_participants" (
        "user_id", "conversation_id"
      )
      VALUES (:userId, :conversationId)
      ON CONFLICT DO NOTHING
    `,
    {
      userId: '3c656ce5-1e21-4332-a268-d7599f2f0e40',
      conversationId: CONVERSATION_ID
    }
  );
};
