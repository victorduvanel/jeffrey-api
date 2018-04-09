import oauth2     from '../middlewares/oauth2';
import bodyParser from 'body-parser';

const jsonSerialize = async (user) => {
  const paymentMethodStatus = await user.paymentMethodStatus();

  return {
    id: user.get('id'),
    first_name: user.get('firstName'),
    last_name: user.get('lastName'),
    email: user.get('email'),
    profile_picture: user.get('profilePicture'),
    payment_method_status: paymentMethodStatus,
  };
};

export const get = [
  oauth2,
  async (req, res) => {
    const user = req.user;

    res.send(await jsonSerialize(user));
  }
];

export const post = [
  oauth2,
  bodyParser.json(),

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

    if (user.hasChanged()) {
      await user.save();
    }

    res.send(await jsonSerialize(user));
  }
];
