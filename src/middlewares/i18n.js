import { getLocale } from '../locales';
import intl          from '../lib/i18n';

export default async (req, res, next) => {
  const acceptLanguage = req.headers['accept-language'];
  const lang = getLocale(acceptLanguage);

  req.intl = intl[lang];
  next();
};
