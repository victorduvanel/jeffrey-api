import uuid    from 'uuid';
import request from 'request-promise';

exports.seed = async function(knex, Promise) {

  const reviewsObj = {
    reviews: [
      {
        id: uuid.v4(),
        rank: '1',
        message: 'review 1',
        provider_id: '3c656ce5-1e21-4332-a268-d7599f2f0e40',
        author_id: 'aaaaaaaa-1e21-4332-a268-d7599f2f0e40'
      },
      {
        id: uuid.v4(),
        rank: 3,
        message: 'review 2',
        provider_id: '3c656ce5-1e21-4332-a268-d7599f2f0e40',
        author_id: 'aaaaaaaa-1e21-4332-a268-d7599f2f0e40'
      }

    ]
  };
  const reviews = reviewsObj.reviews.map(rev => ({
    id: uuid.v4(),
    rank: rev.rank,
    message: rev.message,
    provider_id: rev.provider_id,
    author_id: rev.author_id
  }));

  return Promise.map(reviews, rev => knex.raw(`
      INSERT INTO "reviews" (
        "id", "rank", "message", "provider_id", "author_id", "created_at",
        "updated_at"
      ) VALUES (
        :id, :rank, :message, :provider_id, :author_id, NOW(), NOW()
      )
      ON CONFLICT DO NOTHING
    `, rev));
};
