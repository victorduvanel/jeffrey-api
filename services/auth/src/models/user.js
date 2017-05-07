import Promise                      from 'bluebird';
import nativeBcrypt                 from 'bcryptjs';
import bookshelf                    from '../services/bookshelf';
import uuid                         from 'uuid';
import Base                         from './base';
import AccessToken                  from './access-token';
import { send as sendNotification } from '../services/notification';

export const InvalidCredentials = new Error('Invalid Credentials');
export const DuplicatedUser = new Error('Duplicated User');

const bcrypt = Promise.promisifyAll(nativeBcrypt);

const User = Base.extend({
  tableName: 'users',

  conversations() {
    return this.hasMany('Conversation');
  },

  stripeCustomer() {
    return this.hasMany('StripeCustomer');
  },

  phoneNumbers() {
    return this.hasMany('PhoneNumber');
  },

  createAccessToken({ singleUse = false }) {
    return AccessToken.create({ user: this, singleUse });
  },

  updatePassword(newPassword) {
    const saltRounds = 10;

    return bcrypt.hashAsync(newPassword, saltRounds)
      .then((hash) => {
        this.set('password', hash);
      });
  },

  async paymentMethodStatus() {
    await this.load('stripeCustomer');

    const customers = this.related('stripeCustomer');
    if (!customers.length) {
      return 'not_set';
    }

    const customer = customers.at(0);
    const expYear = customer.get('expYear');
    const expMonth = customer.get('expMonth');

    const now = new Date();
    const expirationDate = new Date(expYear, expMonth - 1);

    if (now >= expirationDate) {
      return 'expired';
    } else if ((now - expirationDate) / (1000 * 60 * 60 * 24) >= 30) {
      // expires in 30 days or less
      return 'expired_soon';
    } else {
      return 'ok';
    }
  },

  sendMessage(message) {
    sendNotification(this, message);
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

    throw InvalidCredentials;
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
