import { render } from '../services/handlebars';

export const get = [
  async (req, res) => {
    const activationLink = req.originalUrl.slice('/app-link/'.length);
    const html = await render('html/app-link', { activationLink });

    res.set('Content-Type', 'text/html');
    res.send(`<!DOCTPYE html>${html}`);
  }
];
