import Storage from '@google-cloud/storage';

// Creates a client
const storage = new Storage();

const buckets = {
  US: storage.bucket('us-jffr'),
  ASIA: storage.bucket('asia-jffr'),
  EU: storage.bucket('eu-jffr'),
  appleReceipts: storage.bucket('jffr-apple-receipts')
};

export default buckets;
