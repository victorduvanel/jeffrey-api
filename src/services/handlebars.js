import Promise        from 'bluebird';
import moment         from 'moment';
import handlebars     from 'handlebars';
import handlebarsIntl from 'handlebars-intl';
import path           from 'path';
import config         from '../config';
import nativeFs       from 'fs';

const fs = Promise.promisifyAll(nativeFs);

const viewsDirectory = './src/views';

handlebarsIntl.registerWith(handlebars);

handlebars.registerHelper('duration', (duration) => {
  return moment.utc(moment.duration(duration).as('milliseconds')).format('HH[h] mm[m] ss[s]');
});

handlebars.registerHelper('link', function(path) {
  path  = handlebars.Utils.escapeExpression(path);

  const result = `${config.webappProtocol}://${config.webappHost}${path}"`;

  return new handlebars.SafeString(result);
});

export const render = async (templateName, data, intlData) => {
  const tmpl = await fs.readFileAsync(path.join(viewsDirectory, `${templateName}.hbs`));
  const template = handlebars.compile(tmpl.toString());

  if (intlData) {
    return template(data, {
      data: {
        intl: intlData
      }
    });
  }
  return template(data);
};

export { default } from 'handlebars';
