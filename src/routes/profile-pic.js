import Promise               from 'bluebird';
import uuid                  from 'uuid';
import Busboy                from 'busboy';
import Buckets               from '../services/google/storage';
import oauth2                from '../middlewares/oauth2';
import { applyExifRotation } from '../lib/exif';

const retreiveImage = (req) => {
  return new Promise((resolve, reject) => {
    const busboy = new Busboy({ headers: req.headers });

    const buffers = [];
    let ok = false;

    busboy.on('file', (fieldname, file) => {
      if (fieldname !== 'pic') {
        return;
      }
      ok = true;

      file.on('data', (chunk) => buffers.push(chunk));
      file.on('end', () => resolve(Buffer.concat(buffers)));
      file.on('error', reject);
    });


    busboy.on('end', () => {
      if (!ok) {
        reject(new Error('Field not found'));
      }
    });

    req.pipe(busboy);
  });
};

const uploadImage = (bucket, imageStream, path) => {
  return new Promise((resolve, reject) => {
    const file = bucket.file(path);
    const fileStream = file.createWriteStream({
      metadata: {
        contentType: 'image/jpeg'
      }
    });

    fileStream.on('error', reject);
    fileStream.on('finish', async () => {
      await file.makePublic();
      resolve();
    });

    imageStream.on('end', async () => {
      fileStream.end();
    });
    imageStream.on('data', chunk => fileStream.write(chunk));
  });
};

export const post = [
  oauth2,
  async (req, res) => {
    const { user } = req;
    const imageBuffer = await retreiveImage(req);
    const imageStream = await applyExifRotation(imageBuffer);

    const region = req.query.region || 'EU';
    const bucket = Buckets[region] || Buckets.EU;

    const dest = uuid.v4();
    const path = `profile-pictures/${dest}/original.jpg`;
    await uploadImage(bucket, imageStream, path);

    const profilePicture = `https://storage.googleapis.com/${bucket.name}/${path}`;

    user.set('profilePicture', profilePicture);
    await user.save();

    res.send({
      success: true,
      profilePicture
    });
  }
];
