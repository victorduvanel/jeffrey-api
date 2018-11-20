import uuid          from 'uuid';
import Base          from './base';
import config        from '../config';
import bookshelf     from '../services/bookshelf';
import knex          from '../services/knex';
import * as libEmail from '../lib/email';
import errors        from '../errors';
import { sendEmail } from '../services/mailjet';
import { getLocale } from '../locales';
import i18n          from '../lib/i18n';

const PendingUser = Base.extend({
  tableName: 'pending_users',

  cleanup: function() {
    return knex('pending_users')
      .where('email', this.get('email'))
      .del();
  }
}, {
  createFromEmail: async function(rawLocale, emailAddress, uriPrefix) {
    const id = uuid.v4();
    const locale = getLocale(rawLocale);

    emailAddress = libEmail.sanitize(emailAddress);

    if (libEmail.isBlackListed(emailAddress)) {
      throw errors.EmailRejected;
    }

    await this.forge({
      id,
      locale: rawLocale,
      email: emailAddress
    })
      .save(null, { method: 'insert' });

    const prefix = uriPrefix || `${config.webappProtocol}://${config.webappHost}/`;
    const activationLink = `${prefix}activate/${id}`;
    const appRedirectLink = `${config.webappProtocol}://${config.webappHost}/app-link?link=${encodeURIComponent(activationLink)}`;

    let templateId = i18n[locale].formatMessage({
      id: 'emails.confirmEmail.id',
      defaultMessage: '600647'
    });

    templateId = parseInt(templateId, 10);

    return sendEmail({
      Messages: [{
        TemplateID: templateId,
        TemplateLanguage: true,
        From: {
          Email: i18n[locale].formatMessage({
            id: 'emails.confirmEmail.fromEmail',
            defaultMessage: 'no-reply@jeffrey.app'
          }),
          Name: i18n[locale].formatMessage({
            id: 'emails.confirmEmail.fromName',
            defaultMessage: 'Jeffrey'
          })
        },
        To: [{
          Email: emailAddress
        }],
        Subject: i18n[locale].formatMessage({
          id: 'emails.confirmEmail.subject',
          defaultMessage: 'Jeffrey - Confirm your email address',
        }),
        Variables: {
          activationLink: appRedirectLink
        }
      }]
    });
  },

  find: async function(id) {
    return this.forge({ id })
      .fetch();
  }
});

export default bookshelf.model('PendingUser', PendingUser);
