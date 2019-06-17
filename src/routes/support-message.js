import bodyParser from 'body-parser';
import { sendEmail } from '../services/mailgun';
import { render } from '../services/handlebars';

export const post = [
  bodyParser.json(),

  async (req, res) => {
    const { email, firstName, lastName, message } = req.body;

    const content = await render('html/contact-message', {
      email,
      firstName,
      lastName,
      message
    });

    await sendEmail({
      from: 'no-reply@jeffrey.app',
      to: 'contact@jeffrey.app',
      subject: '[JEFFREY] New contact',
      email,
      message: content
    });

    res.send({
      success: true
    });
  }
];
