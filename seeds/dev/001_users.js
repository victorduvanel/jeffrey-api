import uuid    from 'uuid';
import request from 'request-promise';

const capitalize = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

exports.seed = async function(knex, Promise) {
  const response = await request({
    uri: 'https://randomuser.me/api/?results=50'
  });
  const result = JSON.parse(response);

  const users = result.results.map(user => ({
    id: uuid.v4(),
    email: user.email,
    gender: user.gender,
    facebookId: null,
    firstName: capitalize(user.name.first),
    lastName: capitalize(user.name.last),
    profilePicture: user.picture.large,
    phoneNumber: user.phone,
    lat: '1',
    lng: '2',
    isProvider: 'false',
    isAvailable: 'false',
    password: null
  }));

  users.push({
    id: '3c656ce5-1e21-4332-a268-d7599f2f0e40',
    email: 'wr.wllm@gmail.com',
    facebookId: '1590831811013736',
    gender: 'male',
    firstName: 'William',
    lastName: 'Riancho',
    lat: '41.3938',
    lng: '2.19504',
    isProvider: 'true',
    isAvailable: 'true',
    profilePicture: 'https://storage.googleapis.com/eu-jffr/profile-pictures/409d5c83-ccdb-47f0-956e-02de7e471c0c/original.jpg',
    phoneNumber: '+33651648566',
    password: '$2a$10$is7MWK4ws1hwG9Aokkh4R.sg5PYo9qg27hyPipO0GUXBntcTozao2'
  });

  users.push({
    id: 'aaaaaaaa-1e21-4332-a268-d7599f2f0e40',
    email: 'matias@gmail.com',
    facebookId: '1590831811013731',
    gender: 'male',
    firstName: 'Matias',
    lastName: 'Kochman',
    lat: '41.3938',
    lng: '2.19504',
    isProvider: 'true',
    isAvailable: 'true',
    profilePicture: 'https://storage.googleapis.com/eu-jffr/profile-pictures/409d5c83-ccdb-47f0-956e-02de7e471c0c/original.jpg',
    phoneNumber: '+34616903546',
    password: '$2a$10$webc5Tpybw/tfjwcZ1trHO9.3Y2Oek/zjoYH3lMZnKdtejTmmD4Fu'
  });

  return Promise.map(users, user => knex.raw(`
    INSERT INTO "users" (
      "id", "email", "facebook_id", "gender",
      "first_name", "last_name", "profile_picture",
      "phone_number", "password", "lat", "lng",
      "is_provider", "is_available", "locale",
      "created_at", "updated_at"
    ) VALUES (
      :id, :email, :facebookId, :gender, :firstName,
      :lastName, :profilePicture, :phoneNumber,
      :password, :lat, :lng, :isProvider, :isAvailable, 'en-US', NOW(), NOW()
    )
    ON CONFLICT DO NOTHING
  `, user));
};
