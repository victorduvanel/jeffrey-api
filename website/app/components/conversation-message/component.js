import Ember from 'ember';

import styles from './style';

export default Ember.Component.extend({
  localClassNames: ['message'],
  localClassNameBindings: ['outgoing', 'incoming'],

  styles,
  message: null,

  incoming: Ember.computed('message.type', function() {
    return this.get('message.type') === 'incoming';
  }),

  outgoing: Ember.computed('message.type', function() {
    return this.get('message.type') === 'outgoing';
  })
});
