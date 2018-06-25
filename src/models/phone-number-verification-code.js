import _         from 'lodash';
import uuid      from 'uuid';
import bookshelf from '../services/bookshelf';
import twilio    from '../services/twilio';
import Base      from './base';
import config    from '../config';

const PhoneNumberVerificationCode = Base.extend({
  tableName: 'phone_number_verification_codes',

  user() {
    return this.belongsTo('User');
  }
}, {
  verify: async function({ user, phoneNumber, verificationCode }) {
    const code = await this.forge({
      userId: user.get('id'),
      verificationCode,
      phoneNumber
    })
      .fetch();

    if (!code) {
      return false;
    }

    user.set('phoneNumber', phoneNumber);
    await user.save();
    await code.destroy();

    return true;
  },

  create: async function({ user, phoneNumber, ip }) {
    const id = uuid.v4();
    let verificationCode = '';

    for (let i = 0; i < 4; ++i) {
      verificationCode = verificationCode.concat(_.random(0, 9));
    }

    const code = await this.forge({
      id,
      userId: user.get('id'),
      verificationCode,
      phoneNumber,
      ip
    })
      .save(null, { method: 'insert' });

    if (config.PRODUCTION) {
      await twilio.messages.create({
        body: `${verificationCode} is your verficiation code for Jeffrey`,
        to: phoneNumber,
        from: 'Jeffrey'
      });
    } else {
      console.log(`${verificationCode} is your verficiation code for Jeffrey`);
    }

    return code;
  },
});

export default bookshelf.model('PhoneNumberVerificationCode', PhoneNumberVerificationCode);
