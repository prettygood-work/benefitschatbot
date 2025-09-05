// lib/firebase/client.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { FIREBASE_CLIENT_CONFIG } from '@/lib/config';

// Initialize Firebase using config layer
const app = !getApps().length ? initializeApp(FIREBASE_CLIENT_CONFIG) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// In development, connect to the Firebase Emulators
if (process.env.NODE_ENV === 'development') {
  // Check if the emulators are running by seeing if the host variables are set
  if (process.env.FIREBASE_AUTH_EMULATOR_HOST) {
    connectAuthEmulator(auth, `http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}`);
  }
  if (process.env.FIRESTORE_EMULATOR_HOST) {
    connectFirestoreEmulator(db, process.env.FIRESTORE_EMULATOR_HOST.split(':')[0], parseInt(process.env.FIRESTORE_EMULATOR_HOST.split(':')[1]));
  }
  if (process.env.FIREBASE_STORAGE_EMULATOR_HOST) {
    const host = process.env.FIREBASE_STORAGE_EMULATOR_HOST.split(':')[0];
    const port = parseInt(process.env.FIREBASE_STORAGE_EMULATOR_HOST.split(':')[1]);
    connectStorageEmulator(storage, host, port);
  }
}

export { app, auth, db, storage };
