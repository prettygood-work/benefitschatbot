import { initializeApp, getApps } from 'firebase/app';
import { FIREBASE_CLIENT_CONFIG } from '@/lib/config';

if (!getApps().length) {
    initializeApp(FIREBASE_CLIENT_CONFIG);
}
