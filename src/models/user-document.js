import Promise     from 'bluebird';
import uuid        from 'uuid';
import fileTypeLib from 'file-type';
import { S3 }      from '../services/aws';
import bookshelf   from '../services/bookshelf';
import Base        from './base';

const uploadDocument = (document, mime, path) => {
  return new Promise((resolve, reject) => {
    S3.upload({
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
    const path = `user-documents/${user.get('id')}/${id}`;

    const uri = `https://jffr.ams3.digitaloceanspaces.com/${path}`;

    await uploadDocument(buffer, mime, path);

    return this.forge({ id, purpose, uri, mime, ownerId: user.get('id') })
      .save(null, { method: 'insert' });
  },

  findIdentifyDocuments: function(owner) {
    return UserDocument.where({
      owner_id: owner.get('id'),
      purpose: 'identity_document'
    })
      .fetchAll();
  }
});

export default bookshelf.model('UserDocument', UserDocument);
