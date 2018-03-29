import Promise               from 'bluebird';
import uuid                  from 'uuid';
import Busboy                from 'busboy';
import Buckets               from '../services/google/storage';
import oauth2                from '../middlewares/oauth2';
import { applyExifRotation } from '../lib/exif';
import Canvas, { Image } from 'canvas';

const createCanvasImage = (buffer) => {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onerror = reject;
    img.onload = resolve(img);
    img.src = buffer;
  });
};

const retreiveImageFromRequest = (req) => {
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

const resizeImage = async (image, { width: dWidth, height: dHeight }) => {
  const canvas = new Canvas(dWidth, dHeight);
  const ctx = canvas.getContext('2d');

  const dx = 0;
  const dy = 0;


  if (image.height > image.width) {
    const sx = 0;
    const sWidth = image.width;
    const scale = sWidth / dWidth;

    const sHeight = Math.floor(sWidth * dHeight / dWidth);
    const sy = Math.floor((sHeight - scale * dHeight) / 2);

    ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
  } else {
    const sy = 0;
    const sHeight = image.height;
    const scale = sHeight / dHeight;

    const sWidth = Math.floor(dWidth * sHeight / dHeight);
    const sx = Math.floor((sWidth - scale * dWidth) / 2);

    ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
  }

  return createCanvasImage(canvas.toDataURL());
};

const retreiveImage = async (req) => {
  const imageBuffer = await retreiveImageFromRequest(req);
  const canvasImage = await createCanvasImage(imageBuffer);

  return applyExifRotation(imageBuffer, canvasImage);
};


const uploadImage = (bucket, image, path) => {
  return new Promise((resolve, reject) => {
    const canvas = new Canvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0)

    const imageStream = canvas.jpegStream({ progressive: true });

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
    const image = await retreiveImage(req);
    const smallImage = await resizeImage(image, { width: 50, height: 50 });
    const mediumImage = await resizeImage(image, { width: 250, height: 250 });

    const region = req.query.region || 'EU';
    const bucket = Buckets[region] || Buckets.EU;

    const dest = uuid.v4();

    await uploadImage(bucket, image, `profile-pictures/${dest}/original.jpg`);
    await uploadImage(bucket, smallImage, `profile-pictures/${dest}/small.jpg`);
    await uploadImage(bucket, mediumImage, `profile-pictures/${dest}/medium.jpg`);

    const profilePicture = `https://storage.googleapis.com/${bucket.name}/profile-pictures/${dest}/medium.jpg`;

    user.set('profilePicture', profilePicture);
    await user.save();

    res.send({
      success: true,
      profilePicture
    });
  }
];
