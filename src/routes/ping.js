import bodyParser from 'body-parser';
import oauth2     from '../middlewares/oauth2';
import datastore  from '../services/google/datastore';

export const post = [
  oauth2,
  bodyParser.json(),

  async (req, res) => {
    const user = req.user;

    const userAgent = req.headers['user-agent'];
    const { latitude, longitude } = req.body;
    const { ip } = req;

    const kind = 'locations';
    const key = datastore.key(kind);

    const location = {
      key,
      data: {
        user_id: user.get('id'),
        location: {
          latitude,
          longitude
        },
        user_agent: userAgent,
        created_at: new Date(),
        ip
      },
    };

    await datastore.save(location);

    res.send({ success: true });
  }
];
