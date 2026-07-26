// HealthVerse — Supabase Auth Service
import { supabase } from './client.js';

/**
 * Sign up user with Email & Password
 */
export async function signUpWithEmail({ email, password, fullName, phone, role = 'patient' }) {
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

    // If user is created, try creating/updating their profile in public.profiles table
    if (data.user) {
      await syncUserProfile(data.user.id, {
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
export async function signInWithEmail({ email, password }) {
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
 * Send OTP (Phone or Email)
 */
export async function sendOtp({ contact, isPhone = false }) {
  try {
    if (isPhone) {
      const { data, error } = await supabase.auth.signInWithOtp({
        phone: contact
      });
      if (error) throw error;
      return { data, error: null };
    } else {
      const { data, error } = await supabase.auth.signInWithOtp({
        email: contact
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
 * Verify OTP
 */
export async function verifyOtp({ contact, token, isPhone = false, type = 'sms' }) {
  try {
    const verificationParams = isPhone 
      ? { phone: contact, token, type: type || 'sms' }
      : { email: contact, token, type: 'email' };

    const { data, error } = await supabase.auth.verifyOtp(verificationParams);
    if (error) throw error;
    return { user: data.user, session: data.session, error: null };
  } catch (err) {
    console.warn('Supabase Verify OTP Error:', err.message);
    return { user: null, session: null, error: err.message };
  }
}

/**
 * Update User Role in metadata and profile table
 */
export async function updateUserRole(role) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'No authenticated user' };

    // Update Auth Metadata
    const { data, error } = await supabase.auth.updateUser({
      data: { role }
    });

    if (error) console.warn('Metadata update error:', error.message);

    // Sync to profiles table
    await syncUserProfile(user.id, { role });

    return { user: data?.user || user, error: null };
  } catch (err) {
    console.warn('Update User Role Error:', err.message);
    return { error: err.message };
  }
}

/**
 * Sync user profile to public.profiles table
 */
export async function syncUserProfile(userId, profileData) {
  try {
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        ...profileData,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (error) {
      console.warn('Profile sync warning (table might not exist yet):', error.message);
    }
  } catch (err) {
    console.warn('Profile sync exception:', err.message);
  }
}

/**
 * Get current active session & user
 */
export async function getCurrentUserSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    if (!session) return { user: null, session: null };
    return { user: session.user, session };
  } catch (err) {
    console.warn('Get Session Error:', err.message);
    return { user: null, session: null };
  }
}

/**
 * Sign Out
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
