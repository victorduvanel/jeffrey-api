import uuid      from 'uuid';
import bookshelf from '../services/bookshelf';
import Base      from './base';
import twilio    from '../services/twilio';
import config    from '../config';
import './user';

export const PhoneNumberNotAttached = new Error('Phone Number Not Attached');
export const PhoneNumberNotOwned = new Error('Phone Number Not Owned');

const getAvailablePhoneNumber = async () => {
  if (config.PRODUCTION) {
    const result = await twilio
      .availablePhoneNumbers('FR')
      .local
      .list();

    const phoneNumber = result.availablePhoneNumbers[0].phoneNumber;

    return phoneNumber;
  }

  return '+15005550006';
};

const PhoneNumber = Base.extend({
  tableName: 'phone_numbers',

  user() {
    return this.belongsTo('User');
  },

  incomingMessages() {
    return this.hasMany('Message', 'to_id');
  },

  outgoingMessages() {
    return this.hasMany('Message', 'from_id');
  },

  async detach() {
    const userId = this.get('userId');

    if (!userId) {
      throw PhoneNumberNotAttached;
    }

    if (!this.get('owned')) {
      throw PhoneNumberNotOwned;
    }
  }
}, {
  purchase: async function(user) {
    const id = uuid.v4();
    const phoneNumber = await getAvailablePhoneNumber();

    await twilio.incomingPhoneNumbers.create({
      phoneNumber,
      // voiceUrl: 'https://api.prestine.io/webhook',
      smsmUrl: 'https://api.prestine.io/webhook'
    });

    return this.forge({
      id,
      userId: user.get('id'),
      phoneNumber,
      owned: true
    })
      .save(null, { method: 'insert' });
  },

  findOrCreate: async function({ phoneNumber }) {
    await bookshelf.knex.raw(
      `INSERT INTO phone_numbers
        (id, phone_number, created_at, updated_at)
        VALUES (:id, :phoneNumber, NOW(), NOW())
        ON CONFLICT DO NOTHING
      `,
      {
        id: uuid.v4(),
        phoneNumber
      }
    );

    return await new this({ phoneNumber }).fetch();
  },

  associateAvailable: async function(user) {
    const res = await bookshelf.knex.raw(
      `UPDATE phone_numbers
       SET    user_id = :userId
       FROM  (
         SELECT id
         FROM   phone_numbers
         WHERE  owned = true
         AND    user_id IS NULL
         LIMIT  1
         FOR   UPDATE
       ) sub
       WHERE  phone_numbers.id = sub.id
       RETURNING phone_numbers.id
      `,
      {
        userId: user.get('id')
      }
    );
    if (res.rows.length) {
      return await new this({
        id: res.rows[0].id
      })
        .fetch();
    }
    return null;
  }
});

export default bookshelf.model('PhoneNumber', PhoneNumber);
