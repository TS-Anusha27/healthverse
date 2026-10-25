// HealthVerse — Authentication Adapter (Bridged to AuthService)
// =============================================================================
// Keeps backward compatibility with existing component imports while routing
// all authentication and profile operations through the AuthService abstraction.
// =============================================================================

import { authService } from '../auth/authService.js';
import { supabase } from './client.js';

/**
 * Sign up user with Email & Password
 */
export async function signUpUser({ email, password, fullName, phone, role = 'patient', ...extra }) {
  if (role === 'doctor') {
    const res = await authService.registerDoctor({
      fullName,
      email,
      password,
      confirmPassword: password,
      phone: phone || '',
      medicalRegNo: extra.medicalRegNo || 'REG-PENDING',
      qualification: extra.qualification || 'MBBS',
      specialisation: extra.specialisation || 'General Medicine',
      hospital: extra.hospital || 'Affiliated Hospital',
      experience: extra.experience || ''
    });
    return { user: res.user, error: res.error };
  } else if (role === 'ambulance') {
    const res = await authService.registerAmbulance({
      fullName,
      email,
      password,
      confirmPassword: password,
      phone: phone || '',
      drivingLicenceNo: extra.drivingLicenceNo || 'DL-PENDING',
      vehicleNumber: extra.vehicleNumber || 'TN-07-HV-100',
      serviceAffiliation: extra.serviceAffiliation || 'Emergency Ambulance Service'
    });
    return { user: res.user, error: res.error };
  } else {
    const res = await authService.registerPatient({
      fullName,
      email,
      password,
      confirmPassword: password,
      dob: extra.dob || '2000-01-01',
      phone: phone || '',
      bloodGroup: extra.bloodGroup || 'O+',
      gender: extra.gender || 'prefer_not'
    });
    return { user: res.user, error: res.error };
  }
}

/**
 * Sign in user with Email & Password and role validation
 */
export async function signInUser({ email, password, role = null }) {
  const res = await authService.login({ email, password, role });
  if (!res.success) {
    return { user: null, session: null, error: res.error };
  }
  return { user: res.user, session: { token: 'active' }, error: null };
}

/**
 * Demo OTP verification
 */
export async function sendOtpCode({ contact, isPhone = false, role = 'patient' }) {
  return { data: { message: 'Demo verification code is 123456' }, error: null };
}

export async function verifyOtpCode({ contact, token, isPhone = false, role = 'patient' }) {
  if (token !== '123456' && token.length < 4) {
    return { user: null, session: null, error: 'Invalid verification code. Enter 123456 in demo mode.' };
  }
  const email = contact.includes('@') ? contact : `${contact}@healthverse.demo`;
  // Check if account exists or create a demo entry
  let res = await authService.login({ email, password: 'password123', role });
  if (!res.success) {
    res = await signUpUser({
      email,
      password: 'password123',
      fullName: contact.split('@')[0],
      phone: isPhone ? contact : null,
      role
    });
  }
  return { user: res.user, session: null, error: res.error };
}

/**
 * Demo password reset
 */
export async function resetPasswordForEmail(email) {
  return { data: { message: 'Password reset link sent to ' + email }, error: null };
}

/**
 * Sync user profile to Supabase database tables
 */
export async function createOrSyncProfile(userId, profileData) {
  if (!supabase) return;
  try {
    await supabase.from('profiles').upsert({
      id: userId,
      full_name: profileData.full_name || profileData.fullName,
      email: profileData.email,
      phone: profileData.phone,
      role: profileData.role || 'patient',
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' });
  } catch (e) {
    console.warn('createOrSyncProfile notice:', e.message);
  }
}

/**
 * Update active User Role
 */
export async function updateUserRole(role, user = null) {
  return { user, error: null };
}

/**
 * Get active session
 */
export async function getCurrentUserSession() {
  const user = authService.getCurrentUser();
  return { user, session: user ? { user } : null };
}

/**
 * Sign out user
 */
export async function signOutUser() {
  authService.logout();
  return { error: null };
}
