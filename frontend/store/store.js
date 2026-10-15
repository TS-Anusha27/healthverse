// HealthVerse — Global State Store
import { supabase } from '../services/supabase/client.js';

const defaultDemoUser = {
  id: 'demo-patient-001',
  name: 'Aarav Patel',
  email: 'aarav.patel@healthverse.com',
  phone: '+91 98765 43210',
  avatar: null
};

export const store = {
  // Auth
  currentUser: defaultDemoUser,
  userType: 'patient', // 'patient' | 'doctor' | 'ambulance'
  isLoggedIn: true,
  supabaseSession: null,

  // Theme
  theme: localStorage.getItem('hv_theme') || 'light',

  // Navigation history
  history: [],
  currentPage: 'patient-home',

  // Patient data
  patient: {
    id: 'demo-patient-001',
    name: 'Aarav Patel',
    bloodGroup: 'B+',
    healthScore: 82,
    age: 28,
    gender: 'Male'
  },
  doctor: {
    id: 'dr_001',
    name: 'Dr. Priya Krishnamurthy',
    specialty: 'Cardiologist',
    hospital: 'Apollo Hospitals'
  },
  driver: {
    id: 'amb_001',
    name: 'Emergency Driver Ramesh',
    phone: '+91 98765 43210',
    vehicleNumber: 'TN 07 HV 2026'
  },
  notifications: [],
  mapInstance: null,

  // Methods
  setUser(user, type) {
    this.currentUser = user || defaultDemoUser;
    this.userType = type || 'patient';
    this.isLoggedIn = true;
    localStorage.setItem('hv_user', JSON.stringify({ user: this.currentUser, type: this.userType }));
  },

  clearUser() {
    this.currentUser = defaultDemoUser;
    this.userType = 'patient';
    this.isLoggedIn = true;
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
      // Restore session from Supabase Auth if available
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.user) {
        this.supabaseSession = session;
        const metadata = session.user.user_metadata || {};
        const name = metadata.full_name || session.user.email?.split('@')[0] || defaultDemoUser.name;
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
      console.warn('Supabase session restore note:', e.message);
    }

    // Fallback to localStorage
    const saved = localStorage.getItem('hv_user');
    if (saved) {
      try {
        const { user, type } = JSON.parse(saved);
        this.currentUser = user || defaultDemoUser;
        this.userType = type || 'patient';
        this.isLoggedIn = true;
        return true;
      } catch (e) {}
    }

    this.currentUser = defaultDemoUser;
    this.userType = 'patient';
    this.isLoggedIn = true;
    return true;
  },

  initSupabaseListener() {
    supabase.auth.onAuthStateChange((event, session) => {
      if (session && session.user) {
        this.supabaseSession = session;
        const metadata = session.user.user_metadata || {};
        const name = metadata.full_name || session.user.email?.split('@')[0] || defaultDemoUser.name;
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
        this.currentUser = defaultDemoUser;
        this.userType = 'patient';
        this.isLoggedIn = true;
        this.supabaseSession = null;
        localStorage.removeItem('hv_user');
      }
    });
  }
};

// Restore theme on load
document.documentElement.setAttribute('data-theme', store.theme);
store.initSupabaseListener();
