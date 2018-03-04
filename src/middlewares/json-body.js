import _          from 'lodash';
import bodyParser from 'body-parser';

import errors     from '../errors';

const bodyParserJson = bodyParser.json();

export default (schema) => {
  return (req, res, next) => {
    bodyParserJson(req, res, (err) => {
      if (err) {
        return next(err);
      }

      const body = req.body;

      const newBody = { };

      let key;
      for (key in schema) {
        if (!schema.hasOwnProperty(key)) {
          continue;
        }

        const value = schema[key];
        const expectedKey = _.snakeCase(key);

        if (body.hasOwnProperty(expectedKey)) {
          const paramValue = body[expectedKey];

          if (typeof paramsValue === 'string' && String !== value.type) {
            return next(errors.InvalidParameterType);
          }

          newBody[key] = paramValue;
          delete body[expectedKey];
        } else if (value.required) {
          return next(errors.MissingParameter);
        }
      }

      for (key in body) {
        if (!body.hasOwnProperty(key)) {
          continue;
        }

        return next(errors.UnexpectedParameter);
      }

      req.body = newBody;

      return next();
    });
  };
};
