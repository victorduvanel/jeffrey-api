import oauth2        from '../middlewares/oauth2';
import TOSAcceptance from '../models/tos-acceptance';
import bodyParser    from 'body-parser';

export const post = [
  oauth2,
  bodyParser.json(),

  async (req, res) => {
    const user = req.user;

    if (req.body.accepted) {
      await TOSAcceptance.create({
        user,
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });

      res.send({ success: true });
      return;
    }

    res.send({ success: false });
  }
];
