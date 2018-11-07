import enUS from './en-US.json';
import frFR from './fr-FR.json';

const locales = {
  en: enUS,
  fr: frFR
};

export const getLocale = (locale) => {
  if (!locale) {
    return 'en';
  }

  const lng = locale.split('-').shift();

  if (locales[lng]) {
    return lng;
  }
  return 'en';
};

export default locales;
