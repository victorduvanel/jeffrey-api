import config from '../config';

export const get = [
  async (req, res) => {
    res.send({
      env: config.env,
      version: config.version,
      now: new Date()
    });
  }
];
