// HealthVerse — Global State Store with Supabase Auth Session Persistence
import { supabase } from '../services/supabase/client.js';

export const store = {
  // Auth
  currentUser: null,
  userType: null, // 'patient' | 'doctor' | 'ambulance'
  isLoggedIn: false,
  supabaseSession: null,

  // Theme
  theme: localStorage.getItem('hv_theme') || 'light',

  // Navigation history
  history: [],
  currentPage: 'splash',

  // Patient data
  patient: null,
  doctor: null,
  driver: null,
  notifications: [],
  mapInstance: null,

  // Methods
  setUser(user, type) {
    this.currentUser = user;
    this.userType = type;
    this.isLoggedIn = true;
    localStorage.setItem('hv_user', JSON.stringify({ user, type }));
  },

  clearUser() {
    this.currentUser = null;
    this.userType = null;
    this.isLoggedIn = false;
    this.supabaseSession = null;
    localStorage.removeItem('hv_user');
    supabase.auth.signOut().catch(() => {});
  },

  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('hv_theme', this.theme);
    document.documentElement.setAttribute('data-theme', this.theme);
  },

  async loadSavedUser() {
    try {
      // Restore session from Supabase Auth
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.user) {
        this.supabaseSession = session;
        const metadata = session.user.user_metadata || {};
        const name = metadata.full_name || session.user.email?.split('@')[0] || 'HealthVerse User';
        const type = metadata.role || 'patient';
        
        const user = {
          id: session.user.id,
          name: name,
          email: session.user.email,
          phone: session.user.phone || metadata.phone || null,
          avatar: metadata.avatar_url || null
        };

        this.setUser(user, type);
        return true;
      }
    } catch (e) {
      console.warn('Supabase session restore error:', e.message);
    }

    // Fallback to localStorage if offline
    const saved = localStorage.getItem('hv_user');
    if (saved) {
      const { user, type } = JSON.parse(saved);
      this.currentUser = user;
      this.userType = type;
      this.isLoggedIn = true;
      return true;
    }
    return false;
  },

  initSupabaseListener() {
    supabase.auth.onAuthStateChange((event, session) => {
      if (session && session.user) {
        this.supabaseSession = session;
        const metadata = session.user.user_metadata || {};
        const name = metadata.full_name || session.user.email?.split('@')[0] || 'HealthVerse User';
        const type = metadata.role || this.userType || 'patient';

        const user = {
          id: session.user.id,
          name: name,
          email: session.user.email,
          phone: session.user.phone || metadata.phone || null,
          avatar: metadata.avatar_url || null
        };
        this.setUser(user, type);
      } else if (event === 'SIGNED_OUT') {
        this.currentUser = null;
        this.userType = null;
        this.isLoggedIn = false;
        this.supabaseSession = null;
        localStorage.removeItem('hv_user');
      }
    });
  }
};

// Restore theme on load
document.documentElement.setAttribute('data-theme', store.theme);
store.initSupabaseListener();
