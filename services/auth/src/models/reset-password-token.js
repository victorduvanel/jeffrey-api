import bookshelf       from '../services/bookshelf';
import uuid            from 'uuid';
import Base            from './base';
import * as handlebars from '../services/handlebars';
import { sendEmail }   from '../services/mailgun';

const ResetPasswordToken = Base.extend({
  tableName: 'reset_password_tokens',

  user() {
    return this.belongsTo('User');
  },

  async sendEmail() {
    const id = this.get('id');

    await this.load('user');

    const user = this.related('user');
    const title = 'Prestine - Réinitialiser votre mot de passe';

    const message = await handlebars.render('email/reset-password', {
      resetLink: `/reset-password/${id}`,
      title
    });

    await sendEmail({
      from: '"Prestine" <noreply@prestine.io>',
      to: user.get('email'),
      subject: title,
      message
    });
  }
}, {
  find: async function(id) {
    return this
      .where({ id })
      .where('expired_at', '>', bookshelf.knex.raw('NOW()'))
      .fetch();
  },

  create: async function({ user }) {
    const id = uuid.v4();

    await bookshelf.knex.raw(
      `INSERT INTO reset_password_tokens
        (id, user_id, expired_at, created_at, updated_at)
        VALUES (:id, :userId, NOW() + interval '20 minutes', NOW(), NOW())
      `,
      {
        id: id,
        userId: user.get('id')
      }
    );

    const resetPasswordToken = await this.forge({ id }).fetch();

    await resetPasswordToken.sendEmail();

    return resetPasswordToken;
  }
});

export default bookshelf.model('ResetPasswordToken', ResetPasswordToken);
