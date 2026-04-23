// ============================================================
// Firebase client — auth, firestore, storage, functions
// ============================================================
// Configured via Vite env: VITE_FIREBASE_* vars.
// All AI keys stay in Firebase Functions secrets — never here.
// ============================================================

import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { getFunctions, type Functions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Minimal guard so the app doesn't crash on unconfigured local dev.
// In production these all resolve to real values.
const isConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

export const firebaseConfigured = isConfigured;

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;
let _storage: FirebaseStorage | null = null;
let _functions: Functions | null = null;

if (isConfigured) {
  _app = initializeApp(firebaseConfig);
  _auth = getAuth(_app);
  _db = getFirestore(_app);
  _storage = getStorage(_app);
  _functions = getFunctions(_app);
}

/** Throws if Firebase isn't configured. Use inside service calls. */
function assertConfigured() {
  if (!isConfigured) {
    throw new Error(
      'Firebase not configured. Copy .env.example → .env.local and set VITE_FIREBASE_* vars.'
    );
  }
}

export function firebaseApp(): FirebaseApp { assertConfigured(); return _app!; }
export function firebaseAuth(): Auth { assertConfigured(); return _auth!; }
export function firebaseDb(): Firestore { assertConfigured(); return _db!; }
export function firebaseStorage(): FirebaseStorage { assertConfigured(); return _storage!; }
export function firebaseFunctions(): Functions { assertConfigured(); return _functions!; }

// Soft-accessors for modules that want to early-return on missing config.
export const safeAuth = () => _auth;
export const safeDb = () => _db;
