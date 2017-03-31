import DS from 'ember-data';

export default DS.Model.extend({
  to: DS.attr('string'),
  from: DS.attr('string'),
  name: DS.attr('string')
});
