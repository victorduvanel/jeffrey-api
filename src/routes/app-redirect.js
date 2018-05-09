export const get = [
  async (req, res) => {
    res.redirect(`prestine:/${req.originalUrl}`);
  }
];
