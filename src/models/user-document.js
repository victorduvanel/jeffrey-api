import Promise     from 'bluebird';
import uuid        from 'uuid';
import fileTypeLib from 'file-type';
import bookshelf   from '../services/bookshelf';
import buckets     from '../services/google/storage';
import Base        from './base';

const uploadDocument = ({ bucket, mime, buffer, path }) => {
  return new Promise((resolve, reject) => {
    const file = bucket.file(path);
    const fileStream = file.createWriteStream({
      metadata: {
        contentType: mime
      }
    });

    fileStream.on('error', reject);
    fileStream.on('finish', resolve);
    fileStream.end(buffer);
  });
};

const UserDocument = Base.extend({
  tableName: 'user_documents',

  owner() {
    return this.belongsTo('User');
  }
}, {
  create: async function({ name, user, buffer, region = 'EU' }) {
    let mime = null;

    const fileType = fileTypeLib(buffer);
    if (fileType) {
      mime = fileType.mime;
    }

    const id = uuid.v4();
    const bucket = buckets[region];

    const path = `documents/${user.get('id')}/${id}`;
    const uri = `https://storage.googleapis.com/${bucket.name}/${path}`;

    await uploadDocument({ bucket, buffer, path, mime });

    return this.forge({ id, name, uri, mime, ownerId: user.get('id') })
      .save(null, { method: 'insert' });
  },

  findIdentifyDocuments: function(owner) {
    return UserDocument.where({
      owner_id: owner.get('id'),
      purpose: 'identity_document'
    })
      .fetch();
  }
});

export default bookshelf.model('UserDocument', UserDocument);
