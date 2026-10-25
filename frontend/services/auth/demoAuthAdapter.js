// HealthVerse — Development-Only Demo Authentication Adapter
// =============================================================================
// NOTICE: This adapter is strictly for development and client-side demonstration.
// Passwords are salted and hashed using browser Web Crypto SHA-256 before storage.
// Plaintext passwords are NEVER stored in localStorage or database.
// This layer will be replaced with Firebase Authentication in Phase 2.
// =============================================================================

import { supabase } from '../supabase/client.js';

const STORAGE_ACCOUNTS_KEY = 'hv_dev_accounts_v1';
const STORAGE_PROFILES_KEY = 'hv_dev_profiles_v1';

/**
 * Native Web Crypto password hashing with unique salt
 */
export async function hashPassword(password, salt) {
  const enc = new TextEncoder();
  const data = enc.encode(`${salt}:${password}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function generateSalt() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Calculate age accurately from Date of Birth string (YYYY-MM-DD)
 */
export function calculateAge(dobString) {
  if (!dobString) return null;
  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age >= 0 ? age : 0;
}

/**
 * Local accounts repository
 */
function getStoredAccounts() {
  try {
    const raw = localStorage.getItem(STORAGE_ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.warn('Failed to read demo accounts:', e);
    return {};
  }
}

function saveStoredAccounts(accounts) {
  try {
    localStorage.setItem(STORAGE_ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch (e) {
    console.error('Failed to save demo accounts:', e);
  }
}

function getStoredProfiles() {
  try {
    const raw = localStorage.getItem(STORAGE_PROFILES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.warn('Failed to read demo profiles:', e);
    return {};
  }
}

function saveStoredProfiles(profiles) {
  try {
    localStorage.setItem(STORAGE_PROFILES_KEY, JSON.stringify(profiles));
  } catch (e) {
    console.error('Failed to save demo profiles:', e);
  }
}

/**
 * Register a new demo account with salted SHA-256 hash
 */
export async function createDemoAccount({ email, password, role, profileData }) {
  if (!email || !email.includes('@')) {
    return { error: 'Please provide a valid email address.' };
  }
  if (!password || password.length < 6) {
    return { error: 'Password must be at least 6 characters long.' };
  }
  const validRoles = ['patient', 'doctor', 'ambulance'];
  if (!validRoles.includes(role)) {
    return { error: `Invalid role '${role}'. Must be patient, doctor, or ambulance.` };
  }

  const normalizedEmail = email.trim().toLowerCase();
  const accounts = getStoredAccounts();

  // Check if email already registered
  const existingKey = Object.keys(accounts).find(
    id => accounts[id].email.toLowerCase() === normalizedEmail
  );
  if (existingKey) {
    return { error: 'An account with this email address already exists. Please sign in instead.' };
  }

  const salt = generateSalt();
  const passwordHash = await hashPassword(password, salt);
  const userId = `usr_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;

  // Verification status: Patient accounts are verified by default; Doctors and Ambulance drivers require credential verification
  const verificationStatus = role === 'patient' ? 'verified' : 'pending_verification';

  const newAccount = {
    id: userId,
    email: normalizedEmail,
    role: role,
    passwordHash: passwordHash,
    salt: salt,
    createdAt: new Date().toISOString(),
    verificationStatus: verificationStatus
  };

  accounts[userId] = newAccount;
  saveStoredAccounts(accounts);

  // Build clean profile
  const calculatedAge = profileData.dob ? calculateAge(profileData.dob) : null;
  const fullName = (profileData.fullName || profileData.name || '').trim();

  const newProfile = {
    id: userId,
    role: role,
    email: normalizedEmail,
    fullName: fullName,
    name: fullName,
    phone: (profileData.phone || '').trim(),
    verificationStatus: verificationStatus,
    updatedAt: new Date().toISOString(),

    // Patient specific fields
    dob: profileData.dob || null,
    age: calculatedAge,
    gender: profileData.gender || '',
    bloodGroup: profileData.bloodGroup || '',
    address: profileData.address || '',
    emergencyName: profileData.emergencyName || profileData.emergencyContactName || '',
    emergencyPhone: profileData.emergencyPhone || profileData.emergencyContactPhone || '',
    healthScore: 85,

    // Doctor specific fields
    medicalRegNo: profileData.medicalRegNo || profileData.medicalRegistrationNumber || '',
    qualification: profileData.qualification || '',
    specialisation: profileData.specialisation || profileData.specialty || '',
    hospital: profileData.hospital || '',
    experience: profileData.experience || '',

    // Ambulance Driver specific fields
    drivingLicenceNo: profileData.drivingLicenceNo || profileData.drivingLicenceNumber || '',
    vehicleNumber: profileData.vehicleNumber || '',
    serviceAffiliation: profileData.serviceAffiliation || profileData.hospital || '',
    dutyStatus: 'offline'
  };

  const profiles = getStoredProfiles();
  profiles[userId] = newProfile;
  saveStoredProfiles(profiles);

  // Async sync to Supabase database tables if online (does not block local demo auth)
  syncToSupabaseTables(userId, newProfile).catch(err => {
    console.warn('Optional Supabase background sync notice:', err.message);
  });

  return {
    user: sanitizeAccount(newAccount),
    profile: newProfile,
    error: null
  };
}

/**
 * Authenticate against stored demo accounts
 */
export async function authenticateDemoCredentials({ email, password, requiredRole = null }) {
  if (!email || !email.includes('@')) {
    return { error: 'Please enter a valid email address.' };
  }
  if (!password) {
    return { error: 'Please enter your password.' };
  }

  const normalizedEmail = email.trim().toLowerCase();
  const accounts = getStoredAccounts();

  const accountId = Object.keys(accounts).find(
    id => accounts[id].email.toLowerCase() === normalizedEmail
  );

  if (!accountId) {
    return { error: 'No account found with this email. Please check your credentials or create an account.' };
  }

  const account = accounts[accountId];

  // Enforce role separation
  if (requiredRole && account.role !== requiredRole) {
    const roleLabels = {
      patient: 'Patient',
      doctor: 'Doctor',
      ambulance: 'Ambulance Driver'
    };
    const registeredLabel = roleLabels[account.role] || account.role;
    const requiredLabel = roleLabels[requiredRole] || requiredRole;
    return {
      error: `This account is registered as a ${registeredLabel}. Please sign in through the ${registeredLabel} portal instead of the ${requiredLabel} portal.`
    };
  }

  // Verify salted password hash
  const computedHash = await hashPassword(password, account.salt);
  if (computedHash !== account.passwordHash) {
    return { error: 'Incorrect password. Please try again.' };
  }

  const profiles = getStoredProfiles();
  const profile = profiles[accountId] || {
    id: account.id,
    role: account.role,
    email: account.email,
    name: account.email.split('@')[0],
    fullName: account.email.split('@')[0],
    verificationStatus: account.verificationStatus
  };

  return {
    user: sanitizeAccount(account),
    profile: profile,
    error: null
  };
}

/**
 * Retrieve user profile
 */
export function getDemoProfile(userId) {
  if (!userId) return null;
  const profiles = getStoredProfiles();
  return profiles[userId] || null;
}

/**
 * Update user profile details
 * Guards against role changes or verification status tampering
 */
export function updateDemoProfile(userId, updates) {
  if (!userId) return { error: 'User ID is required' };
  const profiles = getStoredProfiles();
  const current = profiles[userId];

  if (!current) {
    return { error: 'Profile not found' };
  }

  // Sanitize updates: forbid altering id, role, email, or verificationStatus through profile editing
  const safeUpdates = { ...updates };
  delete safeUpdates.id;
  delete safeUpdates.role;
  delete safeUpdates.email;
  delete safeUpdates.verificationStatus;

  // If DOB changed, recalculate age
  if (safeUpdates.dob) {
    safeUpdates.age = calculateAge(safeUpdates.dob);
  }

  if (safeUpdates.fullName) {
    safeUpdates.name = safeUpdates.fullName;
  }

  const updatedProfile = {
    ...current,
    ...safeUpdates,
    updatedAt: new Date().toISOString()
  };

  profiles[userId] = updatedProfile;
  saveStoredProfiles(profiles);

  // Sync to Supabase in background
  syncToSupabaseTables(userId, updatedProfile).catch(e => console.warn('Supabase sync notice:', e.message));

  return { profile: updatedProfile, error: null };
}

/**
 * Strip security fields before returning account object
 */
function sanitizeAccount(account) {
  return {
    id: account.id,
    email: account.email,
    role: account.role,
    verificationStatus: account.verificationStatus,
    createdAt: account.createdAt
  };
}

/**
 * Background sync helper to Supabase (preserves existing DB schema)
 */
async function syncToSupabaseTables(userId, profile) {
  if (!supabase) return;
  try {
    // 1. Sync public.profiles
    await supabase.from('profiles').upsert({
      id: userId,
      full_name: profile.fullName || profile.name,
      email: profile.email,
      phone: profile.phone,
      role: profile.role,
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' });

    // 2. Role specific table sync
    if (profile.role === 'patient') {
      await supabase.from('patients').upsert({
        id: userId,
        dob: profile.dob,
        gender: profile.gender,
        blood_group: profile.bloodGroup,
        emergency_contact_name: profile.emergencyName,
        emergency_contact_phone: profile.emergencyPhone,
        address: profile.address
      }, { onConflict: 'id' });
    } else if (profile.role === 'doctor') {
      await supabase.from('doctors').upsert({
        id: `dr_${userId.substring(0, 8)}`,
        user_id: userId,
        name: profile.fullName || profile.name,
        specialty: profile.specialisation || 'General Medicine',
        hospital: profile.hospital,
        available: true
      }, { onConflict: 'id' });
    } else if (profile.role === 'ambulance') {
      await supabase.from('ambulance_drivers').upsert({
        id: `amb_${userId.substring(0, 8)}`,
        user_id: userId,
        name: profile.fullName || profile.name,
        phone: profile.phone,
        vehicle_number: profile.vehicleNumber || 'TN 07 HV 2026',
        status: profile.dutyStatus || 'offline'
      }, { onConflict: 'id' });
    }
  } catch (err) {
    console.warn('Supabase background table sync notice:', err.message);
  }
}
