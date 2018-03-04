import uuid      from 'uuid';
import Base      from './base';
import bookshelf from '../services/bookshelf';

const VoiceConversation = Base.extend({
  tableName: 'voice_conversations',
}, {
  create: async function({ sid, from, to }) {
    const id = uuid.v4();

    await bookshelf.knex.raw(
      `INSERT INTO voice_conversations
        (id, sid, from_id, to_id,
        started_at, duration,
        created_at, updated_at)
        VALUES (:id, :sid, :fromId, :toId,
        NOW(), 0,
        NOW(), NOW())
        ON CONFLICT DO NOTHING
      `,
      {
        id,
        sid,
        fromId: from.get('id'),
        toId  : to.get('id')
      }
    );

    return await new this({ id }).fetch();
  }
});

export default bookshelf.model('VoiceConversation', VoiceConversation);
