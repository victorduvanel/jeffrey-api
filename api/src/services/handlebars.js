import Promise    from 'bluebird';
import Handlebars from 'handlebars';
import path       from 'path';
import config     from '../config';
import nativeFs   from 'fs';

const fs = Promise.promisifyAll(nativeFs);

const viewsDirectory = './src/views';

Handlebars.registerHelper('link', function(path) {
  path  = Handlebars.Utils.escapeExpression(path);

  const result = `${config.protocol}://${config.webappHost}${path}"`;

  return new Handlebars.SafeString(result);
});

export const render = (templateName, data) => {
  return fs.readFileAsync(path.join(viewsDirectory, `${templateName}.hbs`))
    .then((tmpl) => {
      const template = Handlebars.compile(tmpl.toString());
      const result = template(data);
      return result;
    });
};
