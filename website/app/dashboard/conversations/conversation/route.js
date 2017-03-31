import Ember from 'ember';

export default Ember.Route.extend({
  setupController(controller, conversation) {
    controller.set('conversation', conversation);

    const messages = this.store.query('message', {
      conversation_id: conversation.get('id')
    });

    controller.set('messages', messages);
  }
});
