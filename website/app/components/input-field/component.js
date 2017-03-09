import Ember from 'ember';

export default Ember.Component.extend({
  focused: false,

  inputId: Ember.computed(function() {
    return this.get('elementId') + '-input';
  }),

  focusObserver: Ember.on('init', Ember.observer('focused', function() {
    if (this.get('focused')) {
      Ember.run.next(() => {
        Ember.$('#' + this.get('inputId')).focus();
        this.set('focused', false);
      });
    }
  }))
});
