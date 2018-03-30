import Promise         from 'bluebird';
import Base            from './base';
import bookshelf       from '../services/bookshelf';
import knex            from '../services/knex';
import * as libEmail   from '../lib/email';
import errors          from '../errors';
import uuid            from 'uuid';
import * as mjml       from '../services/mjml';
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
  createFromEmail: async function(i18n, emailAddress) {
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

    const message = await mjml.render('email/register', i18n, {
      activationLink: `http://192.168.1.5:3000/app-link/activate?code=${id}`,
    });

    return sendEmail({
      from: '"Jeffrey" <noreply@jeffrey-services.com>',
      to: emailAddress,
      subject: 'Jeffrey - Confirmez votre adresse mail',
      message
    });
  },

  find: async function(id) {
    return this.forge({ id })
      .fetch();
  }
});

export default bookshelf.model('PendingUser', PendingUser);
