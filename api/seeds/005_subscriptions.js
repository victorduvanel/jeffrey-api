exports.seed = function(knex) {
  return knex.raw(`
    INSERT INTO "subscriptions" (
      "id", "user_id", "frequency", "last_renewal",
      "next_renewal", "created_at", "updated_at"
    ) VALUES (:id, :userId, :frequency, :lastRenewal,
      :nextRenewal, NOW(), NOW()
    )
    ON CONFLICT DO NOTHING
  `, {
    id          : 'aa05199c-e862-4f15-bd92-b13b1ca7362e',
    userId      : 'a7b45d93-1022-431e-9de3-18003852a0fd',
    frequency   : 'monthly',
    lastRenewal : '2017-02-23',
    nextRenewal : '2017-03-23'
  })
  .then(() => {
    return knex.raw(`
      INSERT INTO "phone_numbers_subscriptions" (
        "subscription_id", "phone_number_id",
        "created_at", "updated_at"
      ) VALUES (
        :subscriptionId, :phoneNumberId,
        NOW(), NOW()
      )
      ON CONFLICT DO NOTHING
    `, {
      subscriptionId : 'aa05199c-e862-4f15-bd92-b13b1ca7362e',
      phoneNumberId  : '9fa666e8-556e-400e-a356-3078fdb3f8e3'
    });
  })
  .then(() => {
    return knex.raw(`
      INSERT INTO "subscriptions" (
        "id", "user_id", "frequency", "last_renewal",
        "next_renewal", "created_at", "updated_at"
      ) VALUES (:id, :userId, :frequency, :lastRenewal,
        :nextRenewal, NOW(), NOW()
      )
      ON CONFLICT DO NOTHING
    `, {
      id          : '2e438fbc-9b52-4e16-b908-99d69979aff4',
      userId      : 'a7b45d93-1022-431e-9de3-18003852a0fd',
      frequency   : 'monthly',
      lastRenewal : '2017-02-23',
      nextRenewal : '2017-03-23'
    });
  })
  .then(() => {
    return knex.raw(`
      INSERT INTO "phone_numbers_subscriptions" (
        "subscription_id", "phone_number_id",
        "created_at", "updated_at"
      ) VALUES (
        :subscriptionId, :phoneNumberId,
        NOW(), NOW()
      )
      ON CONFLICT DO NOTHING
    `, {
      subscriptionId : '2e438fbc-9b52-4e16-b908-99d69979aff4',
      phoneNumberId  : 'dcd5d5bc-426f-44be-9a23-0fa7bb2da5bd'
    });
  });
};
