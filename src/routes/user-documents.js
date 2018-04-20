import Promise      from 'bluebird';
import Busboy       from 'busboy';
import UserDocument from '../models/user-document';
import oauth2       from '../middlewares/oauth2';

const retreiveFile = (file) => {
  return new Promise((resolve, reject) => {
    const buffers = [];

    file.on('data', (chunk) => buffers.push(chunk));
    file.on('end', () => resolve(Buffer.concat(buffers)));
    file.on('error', reject);
  });
};

const retreiveDocument = (req) => {
  return new Promise((resolve, reject) => {
    const busboy = new Busboy({ headers: req.headers });

    let doc, purpose;

    busboy.on('file', (fieldname, file) => {
      if (fieldname !== 'document') {
        return;
      }
      doc = retreiveFile(file);
    });

    busboy.on('field', (fieldName, value) => {
      if (fieldName !== 'purpose' && typeof value !== 'string') {
        return;
      }
      purpose = value;
    });

    busboy.on('finish', () => {
      if (!doc || !purpose) {
        reject(new Error('Field not found'));
        return;
      }

      doc.then((docBuffer) => {
        resolve({
          doc: docBuffer,
          purpose
        });
      }, reject);
    });

    req.pipe(busboy);
  });
};


export const post = [
  oauth2,
  async (req, res) => {
    const { user } = req;
    const { doc, purpose } = await retreiveDocument(req);

    await UserDocument.create({ user, purpose, buffer: doc });

    res.send({
      success: true,
    });
  }
];
