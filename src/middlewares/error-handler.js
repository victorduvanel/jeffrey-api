import { APIError, InternalServerError } from '../errors';

/* jshint ignore:start */
/* eslint-disable no-unused-vars */
export default (err, req, res, next) => {
  if (!(err instanceof APIError)) {
    /* eslint-disable no-console */
    console.error(err);
    /* eslint-enable no-console */

    err = InternalServerError;
  }

  res.status(err.status.code);
  res.json({ error: err });
};
/* eslint-enable no-unused-vars */
/* jshint ignore:end */
