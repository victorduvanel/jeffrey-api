import wkhtmltopdf     from 'wkhtmltopdf';
import fs              from 'fs';
import path            from 'path';
import uuid            from 'uuid';
import { payoutAlert } from '../charger';
import { sendEmail }   from '../services/mailgun';

export const post = [
  async (req, res) => {
    res.set('Content-Type', 'text/html');

    const html = await payoutAlert();
    if (html) {
      const output = path.join('/tmp', `jeffrey_api_${uuid.v4()}`);

      const pdf = wkhtmltopdf(
        html,
        {
          zoom: 2,
          pageSize: 'A4'
        }
      );

      pdf.on('end', () => {
        sendEmail({
          from: 'noreply@jeffrey.app',
          to: 'finance@532technologies.com',
          subject: '[JEFFREY] Payout Forecast',
          message: 'New payout forecast',
          attachment: {
            value: fs.createReadStream(output),
            options: {
              filename: 'payout-forecast.pdf',
              contentType: 'application/pdf'
            }
          }
        })
          .then(() => {
            res.send('ok');
          })
          .finally(() => {
            fs.unlink(output, err => err && console.error(err));
          })
          .catch((err) => { throw err; });
      });
      pdf.on('error', (err) => { throw err; });
      pdf.pipe(fs.createWriteStream(output));
    } else {
      res.send('ok');
    }
  }
];
