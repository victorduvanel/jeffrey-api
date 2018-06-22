exports.seed = (knex, Promise) => {
  const reviews = [
    {
      id: '1e2d45da-fa9a-464b-a8c3-255f3a31eceb',
      rank: 1,
      message: 'review 1',
      providerId: '3c656ce5-1e21-4332-a268-d7599f2f0e40',
      authorId: '2b1a5696-11eb-4858-ad1a-6b23c4e478cd'
    },
    {
      id: '3a39eea0-1a58-4708-8e12-6dcd7c05683a',
      rank: 3,
      message: 'review 2',
      providerId: '3c656ce5-1e21-4332-a268-d7599f2f0e40',
      authorId: '2b1a5696-11eb-4858-ad1a-6b23c4e478cd'
    }
  ];

  return Promise.map(reviews, review => {
    return knex.raw(
      `
        INSERT INTO "reviews" (
          "id", "rank", "message", "provider_id", "author_id", "created_at",
          "updated_at"
        ) VALUES (
          :id, :rank, :message, :providerId, :authorId, NOW(), NOW()
        )
        ON CONFLICT DO NOTHING
      `,
      review
    );
  });
};
