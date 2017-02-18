import oauth2 from '../../middlewares/oauth2';

export const post = [
  oauth2,

  async (req, res) => {
    const user = req.user;
    const accessToken = await user.createAccessToken({ singleUse: true });

    res.send({
      access_token: accessToken.get('token'),
      token_type: 'Bearer'
    });
  }
];
