import Promise     from 'bluebird';
import uuid        from 'uuid';
import fileTypeLib from 'file-type';
import { S3 }      from '../services/aws';
import bookshelf   from '../services/bookshelf';
import Base        from './base';

const uploadDocument = (document, mime, path) => {
  return new Promise((resolve, reject) => {
    S3.upload({
      Bucket: 'user-documents',
      Key: path,
      Body: document,
      ContentType: mime,
      ACL: 'authenticated-read'
    }, (err) => {
      if (err) {
        console.error(err);
        reject(err);
        return;
      }

      resolve();
    });
  });
};

const UserDocument = Base.extend({
  tableName: 'user_documents',

  purpose() {
    return this.get('purpose');
  },

  createdAt() {
    return this.get('createdAt');
  },

  updatedAt() {
    return this.get('updatedAt');
  }
}, {
  create: async function({ purpose, user, buffer }) {
    let mime = null;

    const fileType = fileTypeLib(buffer);
    if (fileType) {
      mime = fileType.mime;
    }

    const id = uuid.v4();
    const path = `${user.get('id')}/${id}`;

    const uri = `https://cdn.jeffrey.app/${path}`;

    await uploadDocument(buffer, mime, path);

    return this.forge({ id, purpose, uri, mime, ownerId: user.get('id') })
      .save(null, { method: 'insert' });
  },

  findDocuments: function(owner, type) {
    return UserDocument.where({
      owner_id: owner.get('id'),
      purpose: type
    })
      .fetchAll();
  }
});

export default bookshelf.model('UserDocument', UserDocument);
