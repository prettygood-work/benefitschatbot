// lib/firebase/admin.ts
import admin from 'firebase-admin';

// Check if the app is already initialized to prevent errors
if (!admin.apps.length) {
  const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT;
  const credential = serviceAccountEnv
    ? admin.credential.cert(JSON.parse(serviceAccountEnv))
    : admin.credential.applicationDefault();

  admin.initializeApp({ credential });
}

const adminAuth = admin.auth();
const adminDb = admin.firestore();
const db = adminDb; // alias for adminDb
const adminStorage = admin.storage();
const FieldValue = admin.firestore.FieldValue;

export { adminAuth, adminDb, db, adminStorage, FieldValue };
