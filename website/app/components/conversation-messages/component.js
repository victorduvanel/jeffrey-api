import Ember from 'ember';
import styles from './style';

export default Ember.Component.extend({
  localClassNames: ['conversation-messages'],

  styles,

  messages: null,

  messageSorting: ['date'],
  sortedMessage: Ember.computed.sort('messages', 'messageSorting')
});
