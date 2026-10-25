// HealthVerse — Global State Store with Local Session Persistence
import { sessionService } from '../services/auth/sessionService.js';

export const store = {
  // Auth
  currentUser: null,
  userType: null, // 'patient' | 'doctor' | 'ambulance'
  isLoggedIn: false,

  // Theme: strictly default to 'light'
  theme: localStorage.getItem('hv_theme') || 'light',

  // Navigation history & current page
  history: [],
  currentPage: 'user-type',

  // Role profiles
  patient: null,
  doctor: null,
  driver: null,
  notifications: [],
  mapInstance: null,

  // Methods
  setUser(user, type, profile = null) {
    this.currentUser = user;
    this.userType = type;
    this.isLoggedIn = true;

    if (type === 'patient') {
      this.patient = profile || this.patient;
    } else if (type === 'doctor') {
      this.doctor = profile || this.doctor;
    } else if (type === 'ambulance') {
      this.driver = profile || this.driver;
    }

    sessionService.saveSession(user, profile, type);
  },

  clearUser() {
    this.currentUser = null;
    this.userType = null;
    this.isLoggedIn = false;
    this.patient = null;
    this.doctor = null;
    this.driver = null;
    sessionService.clearSession();
  },

  setTheme(theme) {
    this.theme = theme === 'dark' ? 'dark' : 'light';
    localStorage.setItem('hv_theme', this.theme);
    document.documentElement.setAttribute('data-theme', this.theme);
  },

  toggleTheme() {
    this.setTheme(this.theme === 'light' ? 'dark' : 'light');
  },

  async loadSavedUser() {
    try {
      const session = sessionService.getSession();
      if (session && session.user && session.role) {
        this.currentUser = session.user;
        this.userType = session.role;
        this.isLoggedIn = true;

        if (session.role === 'patient') {
          this.patient = session.profile;
        } else if (session.role === 'doctor') {
          this.doctor = session.profile;
        } else if (session.role === 'ambulance') {
          this.driver = session.profile;
        }
        return true;
      }
    } catch (e) {
      console.warn('Session restore notice:', e.message);
    }

    this.clearUser();
    return false;
  }
};

// Initialize theme on script load (ensures light theme is applied immediately)
if (!localStorage.getItem('hv_theme')) {
  localStorage.setItem('hv_theme', 'light');
}
document.documentElement.setAttribute('data-theme', store.theme);
