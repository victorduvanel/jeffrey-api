import Promise                      from 'bluebird';
import request                      from 'request-promise';
import nativeBcrypt                 from 'bcryptjs';
import bookshelf                    from '../services/bookshelf';
import uuid                         from 'uuid';
import Base                         from './base';
import AccessToken                  from './access-token';
import { send as sendNotification } from '../services/notification';
import googleService                from '../services/google';

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

  facebookAuthenticate: async function(token) {
    const response = await request({
      method: 'GET',
      uri: 'https://graph.facebook.com/v2.9/me?fields=id,first_name,last_name,email,verified',
      auth: {
        bearer: token
      },
      form: {
        id_token: token
      }
    });

    const facebookUser = JSON.parse(response);

    if (!facebookUser.verified) {
      throw new Error('user not verified');
    }

    const user = await this.forge({
      facebookId: facebookUser.id
    }).fetch();

    if (user) {
      return user;
    }

    return this.create({
      facebookId: facebookUser.id,
      firstName: facebookUser.first_name,
      lastName: facebookUser.last_name,
      email: facebookUser.email
    });
  },

  googleAuthenticate: async function(token) {
    const googleUser = await googleService.verifyToken(token)
    const user = await this.forge({ googleId: googleUser.id }).fetch();

    if (user) {
      return user;
    }

    if (!googleUser.verified) {
      throw new Error('User not verified');
    }

    return this.create({
      googleId: googleUser.id,
      email: googleUser.email,
      firstName: googleUser.firstName,
      lastName: googleUser.lastName
    });
  },

  create: async function(props) {
    const id = uuid.v4();

    return this.forge({ id, ...props })
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
