import bodyParser from 'body-parser';
// import recaptcha from '../services/recaptcha';
import mailjet from '../services/mailjet';

export const post = [
  bodyParser.json(),

  async (req, res) => {
    const { /* token, */ email } = req.body;

    try {
      // const captchaRes = await recaptcha(token, req.ip);

      // if (captchaRes.score > 0.4) {
        await mailjet
          .post('contact')
          .action('managemanycontacts')
          .request({
            ContactsLists:[
              {
                ListID: 12526,
                action: 'addforce'
              }
            ],
            Contacts:[
              {
                Email: email
              }
            ]
          });
      // }

      res.send({
        success: true
      });
    } catch (err) {
      console.error(err);
      res.send({
        success: false
      });
    }
  }
];

