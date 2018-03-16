import Promise           from 'bluebird';
import { ExifImage }     from 'exif';
import Canvas, { Image } from 'canvas';

const createCanvasImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onerror = reject;
    img.onload = resolve(img);
    img.src = src;
  });
};

const getTransformations = async (imageBuffer, img) => {
  return new Promise((resolve, reject) => {
    new ExifImage(imageBuffer, (err, exifData) => {
      if (err) {
        reject(err);
        return;
      }

      let
        dX = 0, dY = 0,
        canvasWidth = img.width,
        canvasHeight = img.height,
        rotation = 0,
        scaleX = 1, scaleY = 1;

      switch (exifData.image.Orientation) {
        case 1: // nothing to do
        default:
          break;

        case 2:
          scaleX = -1;
          dX = -1 * img.width;
          break;

        case 3:
          rotation = Math.PI;
          dX = -1 * img.width;
          dY = -1 * img.height;
          break;

        case 4:
          scaleX = -1;
          rotation = Math.PI;
          dY = -1 * img.height;
          break;

        case 5:
          scaleY = -1;
          rotation = Math.PI / 2;
          canvasWidth = img.height;
          canvasHeight = img.width;
          break;

        case 6:
          rotation = Math.PI / 2;
          dY = -1 * img.height;
          canvasWidth = img.height;
          canvasHeight = img.width;
          break;

        case 7:
          scaleY = -1;
          rotation = -1 * Math.PI / 2;
          dX = -1 * img.width;
          dY = -1 * img.height;
          canvasWidth = img.height;
          canvasHeight = img.width;
          break;

        case 8:
          rotation = -1 * Math.PI / 2;
          dX = -1 * img.width;
          canvasWidth = img.height;
          canvasHeight = img.width;
          break;
      }

      resolve({
        dX, dY,
        canvasWidth,
        canvasHeight,
        rotation,
        scaleX, scaleY
      });
    });
  });
};

export const applyExifRotation = async (imageBuffer, image) => {
  const transfo = await getTransformations(imageBuffer, image);

  const {
    dX, dY,
    canvasWidth,
    canvasHeight,
    rotation,
    scaleX, scaleY
  } = transfo;

  const canvas = new Canvas(canvasWidth, canvasHeight);
  const ctx = canvas.getContext('2d');
  ctx.rotate(rotation);
  ctx.scale(scaleX, scaleY);
  ctx.drawImage(image, dX, dY);

  return createCanvasImage(canvas.toDataURL());
};
