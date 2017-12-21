import Controller from '@ember/controller';

export default Controller.extend({
  actions: {
    subscribeButtonPressed() {
      this.transitionToRoute('dashboard.phone-number.new.contact-details');
    }
  }
});
