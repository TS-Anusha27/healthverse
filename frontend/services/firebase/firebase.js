// HealthVerse — Firebase Modular SDK Initialization
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getActiveFirebaseConfig, isFirebaseConfigured } from './config.js';

let app = null;
let auth = null;
let db = null;
let storage = null;

export function initFirebase() {
  if (!isFirebaseConfigured()) {
    return { app: null, auth: null, db: null, storage: null, isConfigured: false };
  }

  try {
    const config = getActiveFirebaseConfig();
    if (!getApps().length) {
      app = initializeApp(config);
    } else {
      app = getApp();
    }

    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);

    return { app, auth, db, storage, isConfigured: true };
  } catch (error) {
    console.error('Firebase initialization error:', error);
    return { app: null, auth: null, db: null, storage: null, isConfigured: false, error };
  }
}

// Auto-run init
const firebaseInstance = initFirebase();

export { app, auth, db, storage, isFirebaseConfigured };
