import enUS from './en-US.json';
import frFR from './fr-FR.json';
import jaJP from './ja-JP.json';
import koKR from './ko-KR.json';

const locales = {
  en: enUS,
  fr: frFR,
  ja: jaJP,
  ko: koKR
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
