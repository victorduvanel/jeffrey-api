import oauth2           from '../middlewares/oauth2';

export const post = [
  oauth2,

  async (req, res) => {
    const user = req.user;
    const credits = await user.purchaseTenEurosCredits();

    return res.send({
      success: true,
      credits
    });
  }
];
