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

    await user.setDetails({
      firstName: body.first_name,
      lastName: body.last_name,
      dateOfBirth: body.date_of_birth,
      gender: body.gender
    });

    if (body.password) {
      await user.updatePassword(body.password);
    }

    res.send(await jsonSerialize(user));
  }
];
