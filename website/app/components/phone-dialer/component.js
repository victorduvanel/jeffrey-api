import Ember from 'ember';

export default Ember.Component.extend({
  twilio: Ember.inject.service(),

  classNames: 'phone-dialer',
  screen: '',

  actions: {
    buttonPressed(button) {
      const screen = this.get('screen');
      this.set('screen', screen + button);
    },

    startCall() {
      const twilio = this.get('twilio');

      twilio.startCall('+33644641618', '+33651648566');
    }
  }
});
