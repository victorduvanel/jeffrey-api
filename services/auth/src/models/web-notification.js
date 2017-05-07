import uuid      from 'uuid';
import webpush   from 'web-push';
import Base      from './base';
import bookshelf from '../services/bookshelf';
import config    from '../config';

const WebNotification = Base.extend({
  tableName: 'web_notifications',

  user() {
    return this.belongsTo('User');
  },

  async notify(message) {
    const payload = this.get('payload');
    const subscription = JSON.parse(payload);

    await webpush.sendNotification(
      subscription,
      message,
      {
        vapidDetails: config.vapidDetails,
        TTL: 60 * 60 // 1 hour in seconds.
      }
    );
  }
}, {
  create: async function({ user, payload }) {
    const id = uuid.v4();

    return this.forge({
      id,
      userId: user.get('id'),
      payload
    })
      .save(null, { method: 'insert' });
  }
});

export default bookshelf.model('WebNotification', WebNotification);
