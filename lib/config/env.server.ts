// lib/config/env.server.ts

// This configuration is used for the Firebase Admin SDK on the server-side.
// It requires specific environment variables to be set in a `.env.local` file.

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  // The private key from the service account JSON, with escaped newlines replaced.
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

// A check to determine if all necessary parts of the service account are present.
const hasServiceAccount =
  serviceAccount.projectId &&
  serviceAccount.privateKey &&
  serviceAccount.clientEmail;

export const SERVER_ENV = {
  GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
  GCS_BUCKET_NAME: process.env.GCS_BUCKET_NAME,
};

export const FIREBASE_ADMIN_CONFIG = {
  serviceAccount: hasServiceAccount ? serviceAccount : undefined,
  // The databaseURL is often required for the Admin SDK.
  databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
};
