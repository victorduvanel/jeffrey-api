import uuid      from 'uuid';
import bookshelf from '../services/bookshelf';
import Base      from './base';

const Message = Base.extend({
  tableName: 'messages',

  conversation() {
    return this.belongsTo('Conversation');
  },

  from() {
    return this.belongsTo('User');
  }
}, {
  create: async function({ from, body }) {
    const id = uuid.v4();

    await bookshelf.knex.raw(
      `INSERT INTO messages
        (id, body, from_id, created_at, updated_at)
        VALUES (:id, :body, :fromId, NOW(), NOW())
        ON CONFLICT DO NOTHING
      `,
      {
        id,
        body,
        fromId: from.get('id')
      }
    );

    return await new this({ id }).fetch();
  }
});

export default bookshelf.model('Message', Message);
