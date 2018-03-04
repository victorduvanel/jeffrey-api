import { URL }                   from 'url';

export const get = [
  async (req, res) => {
    const { action } = req.params;

    res.redirect(`prestine:/${req.originalUrl}`);
  }
];
