import bodyParser from 'body-parser';
import oauth2     from '../middlewares/oauth2';

export const post = [
  oauth2,
  bodyParser.json(),
  async (req, res) => {
    const { user, body } = req;
    const { token, type, locale } = body;

    await user.associateDevice(token, type, locale);
    res.send({
      success: true
    });
  }
];
