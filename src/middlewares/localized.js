import IntlMessageFormat          from 'intl-messageformat';
import locales, { defaultLocale } from '../resources/locales';

const localeNames = Object.keys(locales);

const i18n_ = (locale, key, args) => {
  let message = locales[locale][key];
  if (!message && locale !== defaultLocale) {
    message = locales[defaultLocale][key];
  }
  const formater = new IntlMessageFormat(message || key, locale);
  return formater.format(args);
};

const i18ns = {};

localeNames.forEach(locale => {
  i18ns[locale] = (...args) => i18n_(locale, ...args);
  i18ns[locale].locale = locale;
});

export default (req, res, next) => {
  const locale = req.query.locale || defaultLocale;

  if (localeNames.includes(locale)) {
    req.locale = locale;
  } else {
    req.locale = defaultLocale;
  }

  req.i18n = i18ns[req.locale];

  next();
};
