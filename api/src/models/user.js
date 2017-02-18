import Promise      from 'bluebird';
import nativeBcrypt from 'bcryptjs';
import bookshelf    from '../services/bookshelf';
import uuid         from 'uuid';
import Base         from './base';
import AccessToken  from './access-token';
import { InvalidUserCredentials } from '../errors';

export const DuplicatedUser = new Error('Duplicated User');

const bcrypt = Promise.promisifyAll(nativeBcrypt);

const User = Base.extend({
  tableName: 'users',

  stripeCustomer: function() {
    return this.hasMany('StripeCustomer');
  },

  phoneNumbers: function() {
    return this.hasMany('PhoneNumber');
  },

  createAccessToken: function({ singleUse = false }) {
    return AccessToken.create({ user: this, singleUse });
  },

  updatePassword: function(newPassword) {
    const saltRounds = 10;

    return bcrypt.hashAsync(newPassword, saltRounds)
      .then((hash) => {
        this.set('password', hash);
      });
  },

  toJSON() {
    let attrs = Base.prototype.toJSON.apply(this, arguments);

    delete attrs.password;
    delete attrs.email;

    return attrs;
  }
}, {
  authenticate: async function({ email, password }) {
    const user = await this.forge({ email }).fetch();

    if (user) {
      const passwordMatch = await bcrypt.compareAsync(password, user.get('password'));

      if (passwordMatch) {
        return user;
      }
    }

    throw InvalidUserCredentials;
  },

  create: async function({ email }) {
    const id = uuid.v4();

    return this.forge({ id, email })
      .save(null, { method: 'insert' })
      .catch((err) => {
        if (err.code === '23505') {
          throw DuplicatedUser;
        }

        throw err;
      });
  }
});

export default bookshelf.model('User', User);
