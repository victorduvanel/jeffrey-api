import Promise    from 'bluebird';
import mjml2html  from 'mjml';
import nativeFs   from 'fs';
import path       from 'path';
import locales    from '../resources/locales';
import handlebars from './handlebars';

const fs = Promise.promisifyAll(nativeFs);

const viewsDirectory = './src/views';

export const render = async (templateName, { locale }, context) => {
  const tmpl = await fs.readFileAsync(path.join(viewsDirectory, `${templateName}.mjml`));
  const t = handlebars.compile(tmpl.toString());

  const intlData = {
    locales: locale,
    i18n: locales[locale]
  };

  const tt = t(context, {
    data: {
      intl: intlData
    }
  });

  const res = mjml2html(tt);
  if (res.errors.length) {
    throw res.errors;
  }
  return res.html;
};
