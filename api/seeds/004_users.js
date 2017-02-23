exports.seed = function(knex) {
  return knex.raw(`
    INSERT INTO "users" (
      "id", "email", "password", "first_name",
      "last_name", "created_at", "updated_at"
    ) VALUES (:id, :email, :password, :firstName,
      :lastName, NOW(), NOW()
    )
    ON CONFLICT DO NOTHING
  `, {
    id          : 'a7b45d93-1022-431e-9de3-18003852a0fd',
    email       : 'wr.wllm@gmail.com',
    password    : '$2a$10$cWCnn6pvBkp18gfBDW5VxOWF04cEZgwsIrVvtV1.R1TGPfmeChTse',
    firstName   : 'William',
    lastName    : 'Riancho'
  })
  .then(() => {
    return knex.raw(`
      INSERT INTO "stripe_customers" (
        "id", "user_id", "type", "last_four",
        "exp_month", "exp_year", "holder_name",
         "created_at", "updated_at"
      ) VALUES (
        :id, :userId, :type, :lastFour,
        :expMonth, :expYear, :holderName,
        NOW(), NOW()
      )
      ON CONFLICT DO NOTHING
    `, {
      id          : 'cus_AAizHFaKvWBlLF',
      userId      : 'a7b45d93-1022-431e-9de3-18003852a0fd',
      type        : 'Visa',
      lastFour    : '0003',
      expMonth    : '9',
      expYear     : '2022',
      holderName  : 'William Riancho'
    });
  });
};
