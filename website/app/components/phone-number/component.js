import { computed } from '@ember/object';
import { htmlSafe } from '@ember/string';
import Component from '@ember/component';
import styles from './style';

export default Component.extend({
  tagName: 'span',
  localClassNames: ['phone-number'],

  styles,

  number: null,

  formatted: computed('number', function() {
    let phoneNumber = this.get('number');

    if (!phoneNumber) {
      return '';
    }

    phoneNumber = '0' + phoneNumber.slice(3);
    const length = phoneNumber.length - 1;
    let formatted = phoneNumber[0];

    let i;
    for (i = 1; i < length; ++i) {
      formatted += phoneNumber[i];
      if (i % 2) {
        formatted += '<span></span>';
      }
    }
    formatted += phoneNumber[i];

    return htmlSafe(formatted);
  })
});
