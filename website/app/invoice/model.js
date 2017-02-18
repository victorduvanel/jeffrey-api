import DS from 'ember-data';

export default DS.Model.extend({
  amount    : DS.attr('number'),
  currency  : DS.attr('string'),
  status    : DS.attr('string'),
  createdAt : DS.attr('date')
});
