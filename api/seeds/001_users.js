exports.seed = function(knex) {
  return knex.raw(`
    INSERT INTO "users" (
      "id", "email", "password",
      "account_disabled", "friend",
      "created_at", "updated_at"
    ) VALUES (
      :id, :email, :password, :accountDisabled,
      :friend,
      NOW(), NOW()
    )
    ON CONFLICT DO NOTHING
  `, {
    id      : '2fe88767-9af9-4944-abb0-03fbdb2ab1da',
    email   : 'wr.wllm@gmail.com',
    password: '$2a$10$10Q6jj9uP4V0KoBV4GayZOi1XLJf0KesSBMof/xbklxsD2gcOOYZ2',
    friend  : true,
    accountDisabled: true
  });
};
