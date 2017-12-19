import Route from '@ember/routing/route';

export default Route.extend({
  model() {
    return this
      .get('store')
      .findAll('phone-number');
  },

  setupController(controller, model) {
    controller.set('phoneNumbers', model);
  },

  redirect(phoneNumbers, transition) {
    if (phoneNumbers.get('length')) {
      const to = 'dashboard.phone-number.phone-number';
      if (transition.targetName.substr(0, to.length) !== to) {
        const phoneNumber = phoneNumbers.objectAt(0);
        this.transitionTo(to, phoneNumber);
      }
    } else {
      const newPhoneNumberRoute = 'dashboard.phone-number.new';
      if (transition.targetName.substr(0, newPhoneNumberRoute.length) !== newPhoneNumberRoute) {
        this.transitionTo(newPhoneNumberRoute);
      }
    }
  }
});
