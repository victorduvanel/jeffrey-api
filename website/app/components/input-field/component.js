import Ember from 'ember';

export default Ember.Component.extend({
  inputId: Ember.computed(function() {
    return this.get('elementId') + '-input';
  }),
});
