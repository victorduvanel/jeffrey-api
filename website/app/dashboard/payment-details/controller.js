import Controller            from '@ember/controller';
import { inject as service } from '@ember/service';

export default Controller.extend({
  currentUser: service(),

  redirectTo: '',

  actions: {
    paymentDetailsValidated() {
      this.get('currentUser')
        .load()
        .then(() => {
          const redirectTo = this.get('redirectTo');
          if (redirectTo) {
            this.set('redirectTo', null);
            this.transitionToRoute(redirectTo);
          }
        });
    }
  }
});
