import Ember from 'ember';

export default Ember.Component.extend({
  classNameBindings: ['shake'],
  shake: false,

  shakeObs: Ember.observer('shake', function() {
    if (this.get('shake')) {
      Ember.run.later(() => {
        this.set('shake', false);
      }, 800);
    }
  })
});
