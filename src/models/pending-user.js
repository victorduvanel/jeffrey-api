import uuid                     from 'uuid';
import Base                     from './base';
import config                   from '../config';
import bookshelf                from '../services/bookshelf';
import knex                     from '../services/knex';
import * as libEmail            from '../lib/email';
import errors                   from '../errors';
import * as mjml                from '../services/mjml';
import { sendEmail }            from '../services/mailgun';
import User, { DuplicatedUser } from './user';

const PendingUser = Base.extend({
  tableName: 'pending_users',

  cleanup: function() {
    return knex('pending_users')
      .where('email', this.get('email'))
      .del();
  }
}, {
  createFromEmail: async function(i18n, emailAddress, uriPrefix) {
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

    const prefix = uriPrefix || `${config.webappProtocol}://${config.webappHost}/`;

    const message = await mjml.render('email/register', i18n, {
      activationLink: `${prefix}activate/${id}`,
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
  },

  resolver: {
    Mutation: {
      activate: async (_, { activationCode: code, firstName, lastName }) => {
        if (typeof code !== 'string' || !code.length) {
          throw errors.MissingParameter.detail('code is required');
        }

        const pendingUser = await PendingUser.find(code);
        if (!pendingUser) {
          throw errors.InvalidParameterType.detail('Invalid code');
        }

        let user;
        const email = pendingUser.get('email');

        try {
          user = await User.create({
            firstName,
            lastName,
            email
          });
        } catch (err) {
          if (err === DuplicatedUser) {
            await pendingUser.cleanup();

            throw errors.BadRequest.detail('Duplicated user');
          }
          throw err;
        }

        if (!user) {
          throw errors.BadRequest;
        }

        const token = await user.createAccessToken({});
        await pendingUser.cleanup();

        return token.get('token');
      }
    }
  }
});

export default bookshelf.model('PendingUser', PendingUser);
