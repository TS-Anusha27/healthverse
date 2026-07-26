// HealthVerse — Full Supabase Authentication Service
import { supabase } from './client.js';

/**
 * Sign up user with Email & Password
 */
export async function signUpUser({ email, password, fullName, phone, role = 'patient' }) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone,
          role: role
        }
      }
    });

    if (error) throw error;

    if (data.user) {
      await createOrSyncProfile(data.user.id, {
        full_name: fullName,
        email: email,
        phone: phone,
        role: role
      });
    }

    return { user: data.user, session: data.session, error: null };
  } catch (err) {
    console.warn('Supabase SignUp Error:', err.message);
    return { user: null, session: null, error: err.message };
  }
}

/**
 * Sign in user with Email & Password
 */
export async function signInUser({ email, password }) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return { user: data.user, session: data.session, error: null };
  } catch (err) {
    console.warn('Supabase SignIn Error:', err.message);
    return { user: null, session: null, error: err.message };
  }
}

/**
 * Send OTP (Email or Phone)
 */
export async function sendOtpCode({ contact, isPhone = false, role = 'patient' }) {
  try {
    if (isPhone) {
      const { data, error } = await supabase.auth.signInWithOtp({
        phone: contact,
        options: {
          data: { role }
        }
      });
      if (error) throw error;
      return { data, error: null };
    } else {
      const { data, error } = await supabase.auth.signInWithOtp({
        email: contact,
        options: {
          data: { role }
        }
      });
      if (error) throw error;
      return { data, error: null };
    }
  } catch (err) {
    console.warn('Supabase Send OTP Error:', err.message);
    return { data: null, error: err.message };
  }
}

/**
 * Verify OTP (Email or Phone)
 */
export async function verifyOtpCode({ contact, token, isPhone = false, role = 'patient' }) {
  try {
    const params = isPhone
      ? { phone: contact, token, type: 'sms' }
      : { email: contact, token, type: 'email' };

    const { data, error } = await supabase.auth.verifyOtp(params);
    if (error) throw error;

    if (data.user) {
      await createOrSyncProfile(data.user.id, {
        full_name: data.user.user_metadata?.full_name || contact.split('@')[0],
        email: data.user.email || (isPhone ? null : contact),
        phone: data.user.phone || (isPhone ? contact : null),
        role: role
      });
    }

    return { user: data.user, session: data.session, error: null };
  } catch (err) {
    console.warn('Supabase Verify OTP Error:', err.message);
    return { user: null, session: null, error: err.message };
  }
}

/**
 * Reset password via Email link
 */
export async function resetPasswordForEmail(email) {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin
    });
    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.warn('Reset Password Error:', err.message);
    return { data: null, error: err.message };
  }
}

/**
 * Create or Sync User Profile in Database Tables
 */
export async function createOrSyncProfile(userId, profileData) {
  try {
    // 1. Sync public.profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        full_name: profileData.full_name,
        email: profileData.email,
        phone: profileData.phone,
        role: profileData.role || 'patient',
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (profileError) console.warn('Profiles table sync warning:', profileError.message);

    // 2. Sync role-specific table
    const role = profileData.role || 'patient';
    if (role === 'patient') {
      await supabase.from('patients').upsert({ id: userId }, { onConflict: 'id' });
    } else if (role === 'doctor') {
      await supabase.from('doctors').upsert({
        id: `dr_${userId.substring(0, 8)}`,
        user_id: userId,
        name: profileData.full_name || 'Dr. Medical Specialist',
        specialty: 'General Medicine',
        available: true
      }, { onConflict: 'id' });
    } else if (role === 'ambulance') {
      await supabase.from('ambulance_drivers').upsert({
        id: `amb_${userId.substring(0, 8)}`,
        user_id: userId,
        name: profileData.full_name || 'Emergency Driver',
        phone: profileData.phone || '+91 9876543210',
        vehicle_number: 'TN 07 HV 2026',
        status: 'available'
      }, { onConflict: 'id' });
    }
  } catch (err) {
    console.warn('Profile sync exception:', err.message);
  }
}

/**
 * Update active User Role
 */
export async function updateUserRole(role) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'No authenticated user' };

    const { data, error } = await supabase.auth.updateUser({
      data: { role }
    });

    if (error) console.warn('Metadata role update error:', error.message);

    await createOrSyncProfile(user.id, { role });
    return { user: data?.user || user, error: null };
  } catch (err) {
    console.warn('Update User Role Error:', err.message);
    return { error: err.message };
  }
}

/**
 * Get active session
 */
export async function getCurrentUserSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return { user: session?.user || null, session };
  } catch (err) {
    console.warn('Get Session Error:', err.message);
    return { user: null, session: null };
  }
}

/**
 * Sign out of Supabase Auth
 */
export async function signOutUser() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (err) {
    console.warn('Sign Out Error:', err.message);
    return { error: err.message };
  }
}
