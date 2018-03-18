exports.seed = function(knex) {
  return knex.raw(`
    INSERT INTO "users" (
      "id", "email", "facebook_id",
      "first_name", "last_name", "profile_picture",
      "phone_number", "created_at", "updated_at"
    ) VALUES (
      :id, :email, :facebookId, :firstName,
      :lastName, :profilePicture, :phoneNumber,
      NOW(), NOW()
    )
    ON CONFLICT DO NOTHING
  `, {
    id: '3c656ce5-1e21-4332-a268-d7599f2f0e40',
    email: 'wr.wllm@gmail.com',
    facebookId: '1590831811013736',
    firstName: 'William',
    lastName: 'Riancho',
    profilePicture: 'https://storage.googleapis.com/eu-jffr/profile-pictures/409d5c83-ccdb-47f0-956e-02de7e471c0c/original.jpg',
    phoneNumber: '+33651648566',
  });
};
