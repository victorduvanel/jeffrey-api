import Controller from '@ember/controller';

export default Controller.extend({
  actions: {
    paymentDetailsValidated() {
      this.transitionToRoute('dashboard.phone-number.new.confirm');
    }
  }
});
