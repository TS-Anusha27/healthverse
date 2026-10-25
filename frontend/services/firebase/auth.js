// HealthVerse — Firebase Authentication & User State Service
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { initFirebase, isFirebaseConfigured } from './firebase.js';

export { isFirebaseConfigured };

/**
 * Sign in user with Firebase Auth or fallback to mock mode if Firebase keys are pending
 */
export async function signInUserFirebase({ email, password, role = 'patient' }) {
  const { auth, db } = initFirebase();

  if (!isFirebaseConfigured() || !auth) {
    // Graceful fallback for local development before Firebase keys are inserted
    console.info('Firebase keys pending: Authenticating in local verified mode');
    return {
      user: {
        uid: 'demo-' + role + '-' + Date.now().toString(36),
        email,
        displayName: email.split('@')[0],
        role
      },
      error: null,
      mode: 'local-fallback'
    };
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Retrieve user document from Firestore if available
    let firestoreData = {};
    if (db) {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          firestoreData = userDoc.data();
        }
      } catch (dbErr) {
        console.warn('Could not fetch user document from Firestore:', dbErr.message);
      }
    }

    return {
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || firestoreData.name || email.split('@')[0],
        role: firestoreData.role || role,
        ...firestoreData
      },
      error: null,
      mode: 'firebase'
    };
  } catch (error) {
    let friendlyMessage = error.message;
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
      friendlyMessage = 'Invalid email or password. Please check your credentials.';
    } else if (error.code === 'auth/invalid-email') {
      friendlyMessage = 'Please enter a valid email address.';
    } else if (error.code === 'auth/too-many-requests') {
      friendlyMessage = 'Too many attempts. Please try again in a few moments.';
    }
    return { user: null, error: friendlyMessage, code: error.code };
  }
}

/**
 * Register user in Firebase Auth and persist profile in Firestore
 */
export async function signUpUserFirebase({ email, password, fullName, role = 'patient', metadata = {} }) {
  const { auth, db } = initFirebase();

  if (!isFirebaseConfigured() || !auth) {
    console.info('Firebase keys pending: Registering in local verified mode');
    return {
      user: {
        uid: 'demo-' + role + '-' + Date.now().toString(36),
        email,
        displayName: fullName,
        role,
        ...metadata
      },
      error: null,
      mode: 'local-fallback'
    };
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update Firebase Auth profile displayName
    if (fullName) {
      try {
        await updateProfile(user, { displayName: fullName });
      } catch (e) {}
    }

    // Persist in Firestore
    const profilePayload = {
      uid: user.uid,
      name: fullName,
      email: user.email,
      role: role,
      createdAt: new Date().toISOString(),
      ...metadata
    };

    if (db) {
      try {
        await setDoc(doc(db, 'users', user.uid), profilePayload, { merge: true });
        
        // Also add to role-specific collection
        if (role === 'doctor') {
          await setDoc(doc(db, 'doctors', user.uid), profilePayload, { merge: true });
        } else if (role === 'ambulance') {
          await setDoc(doc(db, 'ambulance_drivers', user.uid), profilePayload, { merge: true });
        } else {
          await setDoc(doc(db, 'patients', user.uid), profilePayload, { merge: true });
        }
      } catch (dbErr) {
        console.warn('Failed to save user profile in Firestore:', dbErr.message);
      }
    }

    return {
      user: {
        uid: user.uid,
        email: user.email,
        displayName: fullName,
        role: role,
        ...metadata
      },
      error: null,
      mode: 'firebase'
    };
  } catch (error) {
    let friendlyMessage = error.message;
    if (error.code === 'auth/email-already-in-use') {
      friendlyMessage = 'An account with this email already exists. Try signing in.';
    } else if (error.code === 'auth/weak-password') {
      friendlyMessage = 'Password should be at least 6 characters.';
    } else if (error.code === 'auth/invalid-email') {
      friendlyMessage = 'Please enter a valid email address.';
    }
    return { user: null, error: friendlyMessage, code: error.code };
  }
}

/**
 * Sign out of Firebase Auth
 */
export async function signOutFirebase() {
  const { auth } = initFirebase();
  if (auth) {
    try {
      await signOut(auth);
    } catch (e) {}
  }
}

/**
 * Send password reset email via Firebase
 */
export async function sendPasswordResetFirebase(email) {
  const { auth } = initFirebase();
  if (!isFirebaseConfigured() || !auth) {
    return { success: true, message: 'Password reset link sent to ' + email + ' (Local mode)' };
  }

  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true, message: 'Password reset email sent via Firebase!' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Save doctor verification credentials to Firebase Firestore
 */
export async function saveDoctorCredentialsFirebase(uid, doctorData) {
  const { db } = initFirebase();
  if (!isFirebaseConfigured() || !db) return { success: true };

  try {
    await setDoc(doc(db, 'doctors', uid), {
      ...doctorData,
      isVerified: true,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return { success: true };
  } catch (e) {
    console.warn('Firebase save doctor failed:', e);
    return { success: false, error: e.message };
  }
}

/**
 * Save ambulance driver credentials to Firebase Firestore
 */
export async function saveAmbulanceCredentialsFirebase(uid, ambulanceData) {
  const { db } = initFirebase();
  if (!isFirebaseConfigured() || !db) return { success: true };

  try {
    await setDoc(doc(db, 'ambulance_drivers', uid), {
      ...ambulanceData,
      isVerified: true,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return { success: true };
  } catch (e) {
    console.warn('Firebase save ambulance failed:', e);
    return { success: false, error: e.message };
  }
}
