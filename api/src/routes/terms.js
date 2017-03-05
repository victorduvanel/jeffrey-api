import Promise from 'bluebird';
import fsNative from 'fs';

const fs = Promise.promisifyAll(fsNative);

export const get = [
  async (req, res) => {
    const terms = await fs.readFileAsync('./resources/terms.html');

    res.header('Content-Type', 'text/html');
    res.send(terms);
  }
];
