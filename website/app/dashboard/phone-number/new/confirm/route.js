import Route from '@ember/routing/route';

export default Route.extend({
  redirect() {
    const controller = this.controllerFor('dashboard.phone-number.new.confirm');
    if (!controller.get('addressId')) {
      this.transitionTo('dashboard.phone-number.new.index');
    }
  }
});
