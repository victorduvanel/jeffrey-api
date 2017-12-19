import DS from 'ember-data';
import { computed } from '@ember/object';

export default DS.Model.extend({
  message: DS.attr('string'),
  type: DS.attr('string'),
  date: DS.attr('date'),

  incoming: computed('type', function() {
    return this.get('type') === 'incoming';
  }).readOnly(),

  outgoing: computed('type', function() {
    return this.get('type') === 'outgoing';
  }).readOnly()
});
