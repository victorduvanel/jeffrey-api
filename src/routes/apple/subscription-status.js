import uuid            from 'uuid/v4';
import bodyParser      from 'body-parser';
import config          from '../../config';
import Buckets         from '../../services/google/storage';
import AppleIosReceipt from '../../models/apple-ios-receipt';

export const post = [
  bodyParser.json(),

  async (req, res) => {
    const { body } = req;

    if (body.password === config.apple.sharedSecret) {
      const receiptFileId = uuid();
      const bucket = Buckets.appleReceipts;
      const file = bucket.file(`receipts/${receiptFileId}.json`);
      const fileStream = file.createWriteStream({
        metadata: {
          contentType: 'application/json'
        }
      });
      fileStream.end(JSON.stringify(body, null, 2));

      const latestReceiptInfo = body.latest_receipt_info;

      await AppleIosReceipt.createFromNotification(receiptFileId, latestReceiptInfo);
    }

    res.send({ success: true });
  }
];
