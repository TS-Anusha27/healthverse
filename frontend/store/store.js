// HealthVerse — Global State Store
export const store = {
  // Auth
  currentUser: null,
  userType: null, // 'patient' | 'doctor' | 'ambulance'
  isLoggedIn: false,

  // Theme
  theme: localStorage.getItem('hv_theme') || 'light',

  // Navigation history
  history: [],
  currentPage: 'splash',

  // Patient data
  patient: null,

  // Doctor data
  doctor: null,

  // Ambulance driver data
  driver: null,

  // App state
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
    localStorage.removeItem('hv_user');
  },

  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('hv_theme', this.theme);
    document.documentElement.setAttribute('data-theme', this.theme);
  },

  loadSavedUser() {
    const saved = localStorage.getItem('hv_user');
    if (saved) {
      const { user, type } = JSON.parse(saved);
      this.currentUser = user;
      this.userType = type;
      this.isLoggedIn = true;
      return true;
    }
    return false;
  }
};

// Restore theme on load
document.documentElement.setAttribute('data-theme', store.theme);
