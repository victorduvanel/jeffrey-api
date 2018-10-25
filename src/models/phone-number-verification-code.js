import _            from 'lodash';
import uuid         from 'uuid';
import bookshelf    from '../services/bookshelf';
import twilio       from '../services/twilio';
import Base         from './base';
import config       from '../config';
import { AppError } from '../errors';

const PhoneNumberVerificationCode = Base.extend({
  tableName: 'phone_number_verification_codes',

  user() {
    return this.belongsTo('User');
  }
}, {
  verify: async function({ user, phoneNumber, verificationCode }) {
    const code = await this.forge({
      userId: user ? user.get('id') : null,
      verificationCode,
      phoneNumber
    })
      .fetch();

    if (!code) {
      throw AppError('Wrong code');
    }

    if (user) {
      user.set('phoneNumber', phoneNumber);
      await user.save();
    }

    await code.destroy();

    return true;
  },

  create: async function({ user, phoneNumber, ip, intl }) {
    const id = uuid.v4();
    let verificationCode = '';

    for (let i = 0; i < 4; ++i) {
      verificationCode = verificationCode.concat(_.random(0, 9));
    }

    const code = await this.forge({
      id,
      userId: user ? user.get('id') : null,
      verificationCode,
      phoneNumber,
      ip
    })
      .save(null, { method: 'insert' });

    const message = intl.formatMessage({
      id: 'phoneNumberVerification.smsMessage',
      defaultMessage: '{verificationCode} is your verficiation code for {serviceName}',
      values: {
        verificationCode,
        serviceName: config.app.name
      }
    });

    if (config.PRODUCTION) {
      await twilio.messages.create({
        body: message,
        to: phoneNumber,
        from: config.app.name
      });
    } else {
      console.log(message);
    }

    return code;
  },
});

export default bookshelf.model('PhoneNumberVerificationCode', PhoneNumberVerificationCode);
