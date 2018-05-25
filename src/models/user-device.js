import uuid        from 'uuid';
import apn         from 'apn';
import bookshelf   from '../services/bookshelf';
import apnProvider from '../services/apn';
import expo        from '../services/expo';
import Base        from './base';

const UserDevice = Base.extend({
  tableName: 'user_devices',

  owner() {
    return this.belongsTo('User');
  },

  pushNotification({ body }) {
    const deviceToken = this.get('token');

    // const notification = new apn.Notification(args);
    // return apnProvider.send(notification, deviceToken);

    expo.sendPushNotificationAsync({
      to: deviceToken,
      sound: 'default',
      body,
      data: {
        withSome: 'data'
      },
    });
  }
}, {
  create: async function({ user, token, type }) {
    const id = uuid.v4();

    await bookshelf.knex.raw(
      `INSERT INTO user_devices
        (id, token, owner_id, type, created_at, updated_at)
        VALUES (:id, :token, :ownerId, :type, NOW(), NOW())
        ON CONFLICT DO NOTHING
      `,
      {
        id,
        token,
        ownerId: user.get('id'),
        type
      }
    );

    return this.forge({ id }).fetch();
  },

  find: function(token) {
    return this.forge({ token })
      .fetch({
        withRelated: ['owner']
      });
  }
});

export default bookshelf.model('UserDevice', UserDevice);
