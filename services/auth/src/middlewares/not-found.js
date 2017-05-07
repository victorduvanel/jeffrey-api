import { NotFound } from '../errors';

export default (req, res, next) => {
  next(NotFound);
};
