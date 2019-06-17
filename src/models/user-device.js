import uuid        from 'uuid';
import apn         from 'apn';
import bookshelf   from '../services/bookshelf';
import apnProvider from '../services/apn';
import firebase    from '../services/firebase';
import Base        from './base';

const UserDevice = Base.extend({
  tableName: 'user_devices',

  owner() {
    return this.belongsTo('User');
  },

  accessToken() {
    return this.belongsTo('AccessToken');
  },

  async setBadge(value) {
    const deviceToken = this.get('token');
    const type = this.get('type');

    switch (type) {
      case 'apn': {
        const notification = new apn.Notification();
        notification.badge = value;
        notification.topic = 'com.jeffrey.client';
        await apnProvider.send(notification, deviceToken);
      } break;
    }
  },

  async pushNotification(notif /* { body, sound } */) {
    const deviceToken = this.get('token');
    const type = this.get('type');

    switch (type) {
      case 'apn': {
        const notification = new apn.Notification();

        // notification.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
        // notification.badge = 3;

        notification.title = notif.title;
        notification.sound = notif.sound;
        notification.body = notif.body;
        notification.threadId = notif.threadId;
        notification.payload = notif.payload;

        // notification.payload = { messageFrom: 'John Appleseed' };

        notification.topic = 'com.jeffrey.client';

        await apnProvider.send(notification, deviceToken);
      } break;

      case 'fcm': {
        const message = {
          notification: {
            title: notif.title,
            body: notif.body
          },
          data: {
            ...notif.payload
          },
          android: {
            // ttl: 3600 * 1000,
            notification: {
              icon: 'ic_stat_notify',
              color: '#A6CB88',
              // sound: 'definite.mp3',
            },
          },
          token: deviceToken
        };

        try {
          await firebase.messaging().send(message);
        } catch (err) {
          if (err.code === 'messaging/registration-token-not-registered') {
            await this.destroy();
          } else {
            throw err;
          }
        }
      } break;
    }
  }
}, {
  create: async function({ user, token, type, locale, accessToken }) {
    const id = uuid.v4();

    let accessTokenId = null;
    if (accessToken) {
      accessTokenId = accessToken.get('id');
    }

    await bookshelf.knex.raw(
      `INSERT INTO user_devices(
         id, token, owner_id, type, locale,
         access_token_id,
         created_at, updated_at
       )
       VALUES (
         :id, :token, :ownerId, :type, :locale,
         :accessTokenId,
         NOW(), NOW()
       )
       ON CONFLICT (token, type) DO UPDATE
       SET
         owner_id = EXCLUDED.owner_id,
         locale = EXCLUDED.locale,
          access_token_id = EXCLUDED.access_token_id,
         updated_at = NOW()
      `,
      {
        id,
        token,
        ownerId: user.get('id'),
        type,
        locale,
        accessTokenId
      }
    );

    return this.forge({ id }).fetch();
  },

  find: function(token) {
    return this.forge({ token })
      .fetch({
        withRelated: ['owner']
      });
  },

  revoke: function(user, token, type) {
    return bookshelf.knex.raw(
      `DELETE FROM user_devices
       WHERE token = :token AND type = :type AND owner_id = :ownerId
      `,
      {
        token,
        type,
        ownerId: user.id
      }
    );
  }
});

export default bookshelf.model('UserDevice', UserDevice);
