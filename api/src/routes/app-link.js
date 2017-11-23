import { render } from '../services/handlebars';

export const get = [
  async (req, res) => {
    const html = await render('html/app-link');

    res.set('Content-Type', 'text/html');
    res.send(`<!DOCTPYE html>${html}`);
  }
];
