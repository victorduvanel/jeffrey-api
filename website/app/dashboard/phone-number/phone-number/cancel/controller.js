import Ember from 'ember';

export default Ember.Controller.extend({
  actions: {
    confirmCancel() {
      this
        .get('phoneNumber')
        .destroyRecord()
        .then(() => {
          this.transitionToRoute('dashboard');
        });
    }
  }
});
