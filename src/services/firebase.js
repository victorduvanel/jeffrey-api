import * as admin from 'firebase-admin';
import config     from '../config';

admin.initializeApp({
  credential: admin.credential.cert(config.firebase.serviceAccount),
  databaseURL: config.firebase.databaseURL
});

export default admin;
