import oauth2 from '../middlewares/oauth2';
import bodyParser from 'body-parser';

export const get = [
  oauth2,
  async (req, res) => {
    const user = req.user;

    const paymentMethodStatus = await user.paymentMethodStatus();
    const credits = await user.credits();

    res.send({
      id: user.get('id'),
      first_name: user.get('firstName'),
      last_name: user.get('lastName'),
      email: user.get('email'),
      payment_method_status: paymentMethodStatus,
      credit_auto_reload: user.get('creditAutoReload'),
      accountDisabled: user.get('accountDisabled'),
      credit: {
        amount: credits,
        currency: 'EUR'
      }
    });
  }
];

export const patch = [
  oauth2,
  bodyParser.urlencoded({ extended: false }),

  async (req, res) => {
    const user = req.user;
    const body = req.body;

    if (body.first_name) {
      user.set('firstName', body.first_name);
    }

    if (body.last_name) {
      user.set('lastName', body.last_name);
    }

    if (body.password) {
      await user.updatePassword(body.password);
    }

    if (body.credit_auto_reload) {
      user.set('creditAutoReload', body.credit_auto_reload);
    }

    if (user.hasChanged()) {
      await user.save();
    }

    res.send(user);
  }
];
