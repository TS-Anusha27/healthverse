// HealthVerse — Firebase Configuration Management
// Reads from Vite environment variables (VITE_FIREBASE_*) with local custom config fallback

export const defaultFirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ''
};

export function getActiveFirebaseConfig() {
  const saved = localStorage.getItem('hv_firebase_config');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.apiKey) {
        return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse saved Firebase config:', e);
    }
  }
  return defaultFirebaseConfig;
}

export function saveFirebaseConfig(config) {
  localStorage.setItem('hv_firebase_config', JSON.stringify(config));
  // Disconnect existing instance if any so it reloads
  window.__hv_firebase_initialized = false;
}

export function isFirebaseConfigured() {
  const config = getActiveFirebaseConfig();
  return Boolean(config && config.apiKey && config.apiKey.length > 5 && config.projectId);
}
