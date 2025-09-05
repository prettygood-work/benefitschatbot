import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { FIREBASE_CLIENT_CONFIG } from '@/lib/config';

// Initialize Firebase using config layer
const app = !getApps().length ? initializeApp(FIREBASE_CLIENT_CONFIG) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
