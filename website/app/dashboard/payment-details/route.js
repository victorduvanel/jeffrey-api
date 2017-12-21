import Route from '@ember/routing/route';

export default Route.extend({
  redirect() {
    const controller = this.controllerFor('dashboard.payment-details');
    if (!controller.get('redirectTo')) {
      this.transitionTo('dashboard.index');
    }
  }
});
