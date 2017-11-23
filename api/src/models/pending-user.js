import Base            from './base';
import bookshelf       from '../services/bookshelf';
import knex            from '../services/knex';
import * as libEmail   from '../lib/email';
import errors          from '../errors';
import uuid            from 'uuid';
import * as handlebars from '../services/handlebars';
import { sendEmail }   from '../services/mailgun';
import config          from '../config';

const PendingUser = Base.extend({
  tableName: 'pending_users',

  cleanup: function() {
    return knex('pending_users')
      .where('email', this.get('email'))
      .del();
  }
}, {
  createFromEmail: async function(emailAddress) {
    const id = uuid.v4();

    emailAddress = libEmail.sanitize(emailAddress);

    if (libEmail.isBlackListed(emailAddress)) {
      throw errors.EmailRejected;
    }

    await this.forge({
      id,
      email: emailAddress
    })
      .save(null, { method: 'insert' });

    const message = await handlebars.render('email/register', {
      // activationLink: `/app-redirect/activate?code=${id}`,
       activationLink: `/activate?code=${id}`,
      title: 'Prestine - Confirmez votre adresse mail',
    });

    return sendEmail({
      from: '"Prestine" <noreply@prestine.io>',
      to: emailAddress,
      subject: 'Prestine - Confirmez votre adresse mail',
      message
    });
  },

  find: async function(id) {
    return this.forge({ id })
      .fetch();
  }
});

export default bookshelf.model('PendingUser', PendingUser);
