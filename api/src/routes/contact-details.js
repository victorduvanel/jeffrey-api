import bodyParser from 'body-parser';
import twilio     from '../services/twilio';
import oauth2     from '../middlewares/oauth2';
import config     from '../config';

export const post = [
  oauth2,
  bodyParser.urlencoded({ extended: false }),

  async (req, res) => {
    if (!config.PRODUCTION) {
      res.send({
        success: true,
        address_id: 'AD70bf32f38b176f52ee0f6ad99671adaa'
      });
      return;
    }

    const { body, user } = req;

    const customerName = `${body.first_name} ${body.last_name}`.trim();
    const postalCode = body.postal_code;
    const { street, region, city } = body;

    try {
      const address = await twilio
        .addresses
        .create({
          friendlyName: user.get('id'),
          customerName,
          street,
          region,
          postalCode,
          city,
          isoCountry: 'FR'
        });

      if (address.validated) {
        res.send({
          success: true,
          address_id: address.sid
        });
        return;
      }
    } catch (err) {
      console.error(err);
    }

    res.send({
      success: false
    });
  }
];
