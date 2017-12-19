import Controller from '@ember/controller';

export default Controller.extend({
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
