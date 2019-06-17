import bodyParser from 'body-parser';
import mailjet from '../services/mailjet';

export const post = [
  bodyParser.json(),

  async (req, res) => {
    const { email } = req.body;

    try {
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

