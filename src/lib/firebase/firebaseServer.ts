import * as admin from 'firebase-admin';

const serviceAccount = require('../firebase/firebaseadmin.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
   
  });
}

export { admin };