// HealthVerse — Client Session Service
// =============================================================================
// Manages active authenticated session, user role, and session persistence
// =============================================================================

const SESSION_KEY = 'hv_active_session_v1';
const LEGACY_USER_KEY = 'hv_user';

export const sessionService = {
  /**
   * Save an active user session
   */
  saveSession(user, profile, role) {
    if (!user || !role) return;
    const sessionData = {
      user: {
        id: user.id,
        email: user.email,
        name: profile?.name || profile?.fullName || user.email.split('@')[0],
        phone: profile?.phone || user.phone || null,
        verificationStatus: profile?.verificationStatus || user.verificationStatus || 'verified'
      },
      profile: profile || null,
      role: role,
      token: `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      createdAt: new Date().toISOString()
    };

    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
      // Keep legacy key synced for any external utilities
      localStorage.setItem(LEGACY_USER_KEY, JSON.stringify({ user: sessionData.user, type: role }));
    } catch (e) {
      console.error('Failed to save session:', e);
    }
  },

  /**
   * Retrieve active session
   */
  getSession() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) {
        const session = JSON.parse(raw);
        if (session && session.user && session.role) {
          return session;
        }
      }

      // Check legacy key if primary missing
      const legacyRaw = localStorage.getItem(LEGACY_USER_KEY);
      if (legacyRaw) {
        const legacy = JSON.parse(legacyRaw);
        if (legacy && legacy.user && legacy.type) {
          return {
            user: legacy.user,
            profile: legacy.user,
            role: legacy.type,
            token: 'legacy_session',
            createdAt: new Date().toISOString()
          };
        }
      }
    } catch (e) {
      console.warn('Session reading error:', e);
    }
    return null;
  },

  /**
   * Update profile within current session
   */
  updateSessionProfile(profile) {
    const current = this.getSession();
    if (!current) return;
    current.profile = { ...current.profile, ...profile };
    if (profile.fullName || profile.name) {
      current.user.name = profile.fullName || profile.name;
    }
    if (profile.phone) {
      current.user.phone = profile.phone;
    }
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(current));
      localStorage.setItem(LEGACY_USER_KEY, JSON.stringify({ user: current.user, type: current.role }));
    } catch (e) {
      console.error('Failed to update session profile:', e);
    }
  },

  /**
   * Clear active session upon logout
   */
  clearSession() {
    try {
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(LEGACY_USER_KEY);
      localStorage.removeItem('hv_patient_profile');
    } catch (e) {
      console.error('Failed to clear session:', e);
    }
  },

  /**
   * Check if a session is currently active
   */
  isLoggedIn() {
    const session = this.getSession();
    return !!(session && session.user && session.role);
  },

  /**
   * Get current user role
   */
  getCurrentRole() {
    const session = this.getSession();
    return session ? session.role : null;
  }
};
