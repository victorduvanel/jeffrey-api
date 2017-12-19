import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  twilio: service(),

  classNames: 'phone-dialer',
  screen: '',

  actions: {
    buttonPressed(button) {
      const screen = this.get('screen');
      this.set('screen', screen + button);
    },

    startCall() {
      const twilio = this.get('twilio');

      twilio.startCall('+33644641618', /* '+33651648566' */ '+333957');
    }
  }
});
