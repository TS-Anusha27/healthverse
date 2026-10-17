// HealthVerse — Global State Store with Multi-Profile & Firebase Support
import { supabase } from '../services/supabase/client.js';
import { signOutFirebase, saveDoctorCredentialsFirebase, saveAmbulanceCredentialsFirebase } from '../services/firebase/auth.js';

const defaultPatient = {
  id: 'patient-001',
  name: 'Aarav Patel',
  email: 'aarav.patel@healthverse.com',
  phone: '+91 98765 43210',
  bloodGroup: 'B+',
  healthScore: 82,
  age: 28,
  gender: 'Male',
  allergies: 'None reported',
  emergencyContact: '+91 98765 00000'
};

const defaultDoctor = {
  id: 'doctor-001',
  name: 'Dr. Priya Krishnamurthy',
  email: 'priya.k@apollo.healthverse.com',
  phone: '+91 98765 43211',
  specialty: 'Senior Cardiologist & Interventional Specialist',
  hospital: 'Apollo Hospitals, Greams Road',
  regNumber: 'NMC-2024-88421',
  experience: '12+ Years',
  certificateName: 'Medical_Council_Specialist_Certificate.pdf',
  isVerified: true
};

const defaultAmbulance = {
  id: 'ambulance-001',
  name: 'Ravi Kumar',
  email: 'ravi.driver@lifeline.healthverse.com',
  phone: '+91 98765 43212',
  vehicleName: 'LifeLine Advanced Cardiac Life Support (ACLS)',
  vehicleNumber: 'TN 07 HV 2026',
  licenseNumber: 'DL-TN-07-2018-00912',
  licenseName: 'Commercial_Heavy_Emergency_Permit.pdf',
  isVerified: true,
  isOnline: true
};

export const store = {
  // Active session
  currentUser: null,
  userType: 'patient', // 'patient' | 'doctor' | 'ambulance'
  isLoggedIn: false,
  supabaseSession: null,

  // Role-Specific Profile Models (persisted in localStorage)
  patient: defaultPatient,
  doctor: defaultDoctor,
  driver: defaultAmbulance,

  // Theme & Navigation
  theme: localStorage.getItem('hv_theme') || 'light',
  history: [],
  currentPage: 'login',
  notifications: [],
  mapInstance: null,

  // -------------------------------------------------------------
  // Profile Setters & Persistence
  // -------------------------------------------------------------
  setUser(user, type = 'patient') {
    this.currentUser = user;
    this.userType = type;
    this.isLoggedIn = Boolean(user);

    // Sync role specific model with user details
    if (type === 'patient') {
      this.patient = { ...this.patient, ...user, name: user?.name || this.patient.name, email: user?.email || this.patient.email };
      localStorage.setItem('hv_patient_profile', JSON.stringify(this.patient));
    } else if (type === 'doctor') {
      this.doctor = { ...this.doctor, ...user, name: user?.name || this.doctor.name, email: user?.email || this.doctor.email };
      localStorage.setItem('hv_doctor_profile', JSON.stringify(this.doctor));
    } else if (type === 'ambulance') {
      this.driver = { ...this.driver, ...user, name: user?.name || this.driver.name, email: user?.email || this.driver.email };
      localStorage.setItem('hv_ambulance_profile', JSON.stringify(this.driver));
    }

    localStorage.setItem('hv_user', JSON.stringify({ user: this.currentUser, type: this.userType }));
  },

  updateDoctorProfile(data) {
    this.doctor = { ...this.doctor, ...data, isVerified: true };
    localStorage.setItem('hv_doctor_profile', JSON.stringify(this.doctor));
    if (this.currentUser?.uid) {
      saveDoctorCredentialsFirebase(this.currentUser.uid, this.doctor).catch(() => {});
    }
  },

  updateAmbulanceProfile(data) {
    this.driver = { ...this.driver, ...data, isVerified: true };
    localStorage.setItem('hv_ambulance_profile', JSON.stringify(this.driver));
    if (this.currentUser?.uid) {
      saveAmbulanceCredentialsFirebase(this.currentUser.uid, this.driver).catch(() => {});
    }
  },

  updatePatientProfile(data) {
    this.patient = { ...this.patient, ...data };
    localStorage.setItem('hv_patient_profile', JSON.stringify(this.patient));
  },

  // -------------------------------------------------------------
  // Remember Me / Saved Credentials for "Save this info for later"
  // -------------------------------------------------------------
  saveCredentials(role, email, password, remember = true) {
    const key = `hv_creds_${role}`;
    if (remember) {
      const data = { role, email, password, savedAt: Date.now() };
      localStorage.setItem(key, JSON.stringify(data));
      localStorage.setItem('hv_last_role', role);
    } else {
      localStorage.removeItem(key);
    }
  },

  getSavedCredentials(role) {
    const key = `hv_creds_${role}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return null;
  },

  clearUser() {
    this.currentUser = null;
    this.isLoggedIn = false;
    this.supabaseSession = null;
    localStorage.removeItem('hv_user');
    
    // Sign out from both Firebase and Supabase
    signOutFirebase().catch(() => {});
    supabase.auth.signOut().catch(() => {});
  },

  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('hv_theme', this.theme);
    document.documentElement.setAttribute('data-theme', this.theme);
  },

  // -------------------------------------------------------------
  // Load State on App Initialization
  // -------------------------------------------------------------
  loadSavedUser() {
    // 1. Restore role profiles from localStorage
    try {
      const p = localStorage.getItem('hv_patient_profile');
      if (p) this.patient = { ...defaultPatient, ...JSON.parse(p) };

      const d = localStorage.getItem('hv_doctor_profile');
      if (d) this.doctor = { ...defaultDoctor, ...JSON.parse(d) };

      const a = localStorage.getItem('hv_ambulance_profile');
      if (a) this.driver = { ...defaultAmbulance, ...JSON.parse(a) };
    } catch (e) {
      console.warn('Error restoring profiles:', e);
    }

    // 2. Restore active user if saved
    const saved = localStorage.getItem('hv_user');
    if (saved) {
      try {
        const { user, type } = JSON.parse(saved);
        if (user) {
          this.currentUser = user;
          this.userType = type || 'patient';
          this.isLoggedIn = true;
          return true;
        }
      } catch (e) {}
    }

    return false;
  },

  initSupabaseListener() {
    supabase.auth.onAuthStateChange((event, session) => {
      if (session && session.user) {
        this.supabaseSession = session;
        const metadata = session.user.user_metadata || {};
        const role = metadata.role || this.userType || 'patient';
        const user = {
          id: session.user.id,
          uid: session.user.id,
          name: metadata.full_name || session.user.email?.split('@')[0],
          email: session.user.email,
          phone: session.user.phone || metadata.phone || null,
          role
        };
        this.setUser(user, role);
      } else if (event === 'SIGNED_OUT') {
        this.currentUser = null;
        this.isLoggedIn = false;
        this.supabaseSession = null;
        localStorage.removeItem('hv_user');
      }
    });
  }
};

// Initial theme & listeners
document.documentElement.setAttribute('data-theme', store.theme);
store.initSupabaseListener();
