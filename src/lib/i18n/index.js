import _                 from 'lodash';
import IntlMessageFormat from 'intl-messageformat';

// if (!global.Intl) {
//   require('intl');
// }

const intl = {};

export const loadLocale = (locale, messages) => {
  const formattedMessages = {};

  _.forEach(messages, (message, id) => {
    formattedMessages[id] = new IntlMessageFormat(message, locale);
  });

  intl[locale] = {
    formatMessage: ({ id, defaultMessage, values }) => {
      if (formattedMessages[id]) {
        return formattedMessages[id].format(values);
      }
      return defaultMessage;
    },
    formatNumber: (value, props) => {
      return new Intl.NumberFormat(locale, props).format(value);
    }
  };
};

export default intl;
