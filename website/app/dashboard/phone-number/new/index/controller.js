import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';

export default Controller.extend({
  currentUser: service(),
  user: alias('currentUser.user'),

  actions: {
    paymentDetailsValidated() {
    },

    subscribeButtonPressed() {
      switch (this.get('user.paymentMethodStatus')) {
        case 'ok':
          this.transitionToRoute('dashboard.phone-number.new.confirm');
          break;

        default:
        case 'not_set':
        case 'expired':
        case 'expired_soon':
          this.transitionToRoute('dashboard.phone-number.new.contact-details');
          break;
      }
    }
  }
});
