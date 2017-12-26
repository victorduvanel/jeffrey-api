import Component from '@ember/component';
import { run, next } from '@ember/runloop';
import { AsYouType } from 'libphonenumber-js';

export default Component.extend({
  inputValue: '',

  init() {
    this._super(...arguments);

    this._asYouType = new AsYouType('FR');
  },

  formatNumber() {
    console.log('formatNumber 2');
    const number = this.get('inputValue');
  },

  actions: {
    onInputChange() {
      console.log(arguments);
    },
    onInputKeyDown(event) {
      const inputValue = this.get('inputValue');
      switch (event.key) {
        case 'Backspace':
          /// this._asYouType.reset();
          break;
        default:
          if ('+0123456789'.indexOf(event.key) !== -1) {
            event.preventDefault();
            this.set('inputValue', this._asYouType.input(event.key));
          }
      }
      run.debounce(this, this.formatNumber, 150, true);
    }
  }
});
