import uuid      from 'uuid';

import bookshelf from '../services/bookshelf';
import Base      from './base';

import PhoneNumber from './phone-number';

const Message = Base.extend({
  tableName: 'messages',

  to() {
    return this.belongsTo(PhoneNumber);
  },

  from() {
    return this.belongsTo(PhoneNumber);
  }
}, {
  create: async function({ sid, from, to, body }) {
    const id = uuid.v4();

    await bookshelf.knex.raw(
      `INSERT INTO messages
        (id, sid, body, from_id, to_id, created_at, updated_at)
        VALUES (:id, :sid, :body, :fromId, :toId, NOW(), NOW())
        ON CONFLICT DO NOTHING
      `,
      {
        id,
        sid,
        body,
        fromId: from.get('id'),
        toId  : to.get('id')
      }
    );

    return await new this({ id }).fetch();
  }
});

export default bookshelf.model('Message', Message);
