exports.seed = function(knex, Promise) {
  const users = [
    {
      id: '3c656ce5-1e21-4332-a268-d7599f2f0e40',
      email: 'wr.wllm@gmail.com',
      facebookId: '1590831811013736',
      firstName: 'William',
      lastName: 'Riancho',
      profilePicture: 'https://storage.googleapis.com/eu-jffr/profile-pictures/409d5c83-ccdb-47f0-956e-02de7e471c0c/original.jpg',
      phoneNumber: '+33651648566',
      password: ''
    },
    {
      id: 'd4b3e91d-5ce4-4268-b612-da113ac457d4',
      email: 'willam@reptilians.io',
      facebookId: null,
      firstName: 'Ibrahim',
      lastName: '',
      profilePicture: '',
      phoneNumber: '',
      password: ''
    }
  ];

  return Promise.map(users, user => knex.raw(`
    INSERT INTO "users" (
      "id", "email", "facebook_id",
      "first_name", "last_name", "profile_picture",
      "phone_number", "password",
      "created_at", "updated_at"
    ) VALUES (
      :id, :email, :facebookId, :firstName,
      :lastName, :profilePicture, :phoneNumber,
      :password, NOW(), NOW()
    )
    ON CONFLICT DO NOTHING
  `, user));
};
