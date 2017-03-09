import Ember from 'ember';
import email from '../utils/email';

export default Ember.Controller.extend({
  actions: {
    submit() {
      const emailAddress = this.get('email');
      if (!email || !email.isValid(emailAddress)) {
        this.set('shakeEmailInput', true);
      }
    }
  }
});
