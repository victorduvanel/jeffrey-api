import bodyParser from 'body-parser';
// import recaptcha from '../services/recaptcha';
import { sendEmail } from '../services/mailgun';
import { render } from '../services/handlebars';

export const post = [
  bodyParser.json(),

  async (req, res) => {
    const { /* token, */ email, firstName, lastName, message } = req.body;

    // const captchaRes = await recaptcha(token, req.ip);

    // if (captchaRes.score > 0.4) {
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
      return;
    // }

    res.send({
      success: false
    });
  }
];
