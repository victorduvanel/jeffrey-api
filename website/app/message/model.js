import Ember from 'ember';
import DS from 'ember-data';

export default DS.Model.extend({
  message: DS.attr('string'),
  type: DS.attr('string'),
  date: DS.attr('date'),

  incoming: Ember.computed('type', function() {
    return this.get('type') === 'incoming';
  }).readOnly(),

  outgoing: Ember.computed('type', function() {
    return this.get('type') === 'outgoing';
  }).readOnly()

});
