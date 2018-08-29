import { render } from '../services/handlebars';

export const get = [
  async (req, res) => {
    // const { link } = req.query;
    const html = await render('html/pay', {
      clientAuthorization: 'sandbox_r59674p2_w7hjbfnz6c4j53py',
      env: 'sandbox', // production
      locale: 'en_US',
      agreementDescription: 'Your agreement description'
    });

    res.set('Content-Type', 'text/html');
    res.send(`<!DOCTPYE html>${html}`);
  }
];
