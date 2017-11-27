import Promise                      from 'bluebird';
import request                      from 'request-promise';
import nativeBcrypt                 from 'bcryptjs';
import bookshelf                    from '../services/bookshelf';
import uuid                         from 'uuid';
import Base                         from './base';
import AccessToken                  from './access-token';
import { send as sendNotification } from '../services/notification';
import googleService                from '../services/google';
import * as handlebars              from '../services/handlebars';
import { sendEmail }                from '../services/mailgun';
import LoginToken                   from '../models/login-token';

const bcrypt = Promise.promisifyAll(nativeBcrypt);

const ContactDetail = Base.extend({
  tableName: 'contact_details',

  user() {
    return this.belongsTo('User');
  }

}, {

  create: async function({
    user,
    firstName,
    lastName,
    city,
    postalCode,
    addressFirstLine,
    addressSecondLine,
    companyName,
    vatNumber
  }) {
    const id = uuid.v4();

    return this.forge({
      id,
      userId: user.get('id'),
      firstName,
      lastName,
      city,
      postalCode,
      addressFirstLine,
      addressSecondLine,
      companyName,
      vatNumber
    })
      .save(null, { method: 'insert' })
      .catch((err) => {
        throw err;
      });
  }
});

export default bookshelf.model('ContactDetail', ContactDetail);
