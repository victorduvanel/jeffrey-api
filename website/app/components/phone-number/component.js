import Ember from 'ember';
import styles from './style';

export default Ember.Component.extend({
  tagName: 'span',
  localClassNames: ['phone-number'],

  styles,

  number: null,

  formatted: Ember.computed('number', function() {
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

    return Ember.String.htmlSafe(formatted);
  })
});
