import DS from 'ember-data';
import { computed } from '@ember/object';

export default DS.Model.extend({
  phoneNumber: DS.attr('string'),

  formated: computed('phoneNumber', function() {
    let phoneNumber = this.get('phoneNumber');

    if (!phoneNumber) {
      return '';
    }

    phoneNumber = '0' + phoneNumber.slice(3);
    const length = phoneNumber.length;
    let formated = '';

    for (let i = 0; i < length; ++i) {
      formated += phoneNumber[i];
      if (i % 2) {
        formated += ' ';
      }
    }

    return formated.trim();
  })
});
