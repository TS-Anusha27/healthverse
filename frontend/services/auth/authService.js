// HealthVerse — Authentication Service Facade
// =============================================================================
// UI components interact with this service rather than direct storage.
// This design makes replacing the demo adapter with Firebase Authentication trivial.
// =============================================================================

import {
  createDemoAccount,
  authenticateDemoCredentials,
  getDemoProfile,
  updateDemoProfile,
  calculateAge
} from './demoAuthAdapter.js';
import { sessionService } from './sessionService.js';
import { store } from '../../store/store.js';

export const authService = {
  /**
   * Log in user with email, password, and required role
   */
  async login({ email, password, role }) {
    const result = await authenticateDemoCredentials({
      email,
      password,
      requiredRole: role
    });

    if (result.error) {
      return { success: false, error: result.error, user: null };
    }

    // Persist session
    sessionService.saveSession(result.user, result.profile, result.user.role);

    // Sync global store
    store.currentUser = result.user;
    store.userType = result.user.role;
    store.isLoggedIn = true;

    if (result.user.role === 'patient') {
      store.patient = result.profile;
      localStorage.setItem('hv_patient_profile', JSON.stringify(result.profile));
    } else if (result.user.role === 'doctor') {
      store.doctor = result.profile;
    } else if (result.user.role === 'ambulance') {
      store.driver = result.profile;
    }

    return {
      success: true,
      error: null,
      user: result.user,
      profile: result.profile,
      role: result.user.role
    };
  },

  /**
   * Register a new Patient
   */
  async registerPatient({ fullName, email, password, confirmPassword, dob, phone, bloodGroup, gender, address, emergencyName, emergencyPhone, privacyConsent }) {
    if (!fullName || fullName.trim().length < 2) {
      return { success: false, error: 'Please enter your full name.' };
    }
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }
    if (password !== confirmPassword) {
      return { success: false, error: 'Passwords do not match.' };
    }
    if (!dob) {
      return { success: false, error: 'Date of birth is required.' };
    }
    const dobDate = new Date(dob);
    if (isNaN(dobDate.getTime()) || dobDate > new Date()) {
      return { success: false, error: 'Date of birth cannot be in the future.' };
    }
    if (privacyConsent !== undefined && !privacyConsent) {
      return { success: false, error: 'You must acknowledge the privacy notice to create an account.' };
    }

    const result = await createDemoAccount({
      email,
      password,
      role: 'patient',
      profileData: {
        fullName: fullName.trim(),
        name: fullName.trim(),
        dob,
        phone: phone ? phone.trim() : '',
        bloodGroup: bloodGroup || '',
        gender: gender || '',
        address: address ? address.trim() : '',
        emergencyName: emergencyName ? emergencyName.trim() : '',
        emergencyPhone: emergencyPhone ? emergencyPhone.trim() : ''
      }
    });

    if (result.error) {
      return { success: false, error: result.error };
    }

    // Auto-login upon registration
    sessionService.saveSession(result.user, result.profile, 'patient');
    store.currentUser = result.user;
    store.userType = 'patient';
    store.isLoggedIn = true;
    store.patient = result.profile;
    localStorage.setItem('hv_patient_profile', JSON.stringify(result.profile));

    return { success: true, user: result.user, profile: result.profile, role: 'patient' };
  },

  /**
   * Register a new Doctor
   */
  async registerDoctor({ fullName, email, password, confirmPassword, phone, medicalRegNo, qualification, specialisation, hospital, experience }) {
    if (!fullName || fullName.trim().length < 2) {
      return { success: false, error: 'Please enter your full name.' };
    }
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }
    if (password !== confirmPassword) {
      return { success: false, error: 'Passwords do not match.' };
    }
    if (!phone || phone.trim().length < 7) {
      return { success: false, error: 'A valid mobile number is required.' };
    }
    if (!medicalRegNo || medicalRegNo.trim().length < 3) {
      return { success: false, error: 'Medical registration / licence number is required.' };
    }
    if (!qualification || qualification.trim().length < 2) {
      return { success: false, error: 'Medical qualification is required (e.g., MBBS, MD).' };
    }
    if (!specialisation || specialisation.trim().length < 2) {
      return { success: false, error: 'Specialisation is required (e.g., Cardiology, General Medicine).' };
    }
    if (!hospital || hospital.trim().length < 2) {
      return { success: false, error: 'Hospital or clinic affiliation is required.' };
    }

    const result = await createDemoAccount({
      email,
      password,
      role: 'doctor',
      profileData: {
        fullName: fullName.trim(),
        name: fullName.trim().startsWith('Dr.') ? fullName.trim() : `Dr. ${fullName.trim()}`,
        phone: phone.trim(),
        medicalRegNo: medicalRegNo.trim(),
        qualification: qualification.trim(),
        specialisation: specialisation.trim(),
        hospital: hospital.trim(),
        experience: experience ? experience.trim() : ''
      }
    });

    if (result.error) {
      return { success: false, error: result.error };
    }

    sessionService.saveSession(result.user, result.profile, 'doctor');
    store.currentUser = result.user;
    store.userType = 'doctor';
    store.isLoggedIn = true;
    store.doctor = result.profile;

    return { success: true, user: result.user, profile: result.profile, role: 'doctor' };
  },

  /**
   * Register a new Ambulance Driver
   */
  async registerAmbulance({ fullName, email, password, confirmPassword, phone, drivingLicenceNo, vehicleNumber, serviceAffiliation, emergencyContact }) {
    if (!fullName || fullName.trim().length < 2) {
      return { success: false, error: 'Please enter driver full name.' };
    }
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }
    if (password !== confirmPassword) {
      return { success: false, error: 'Passwords do not match.' };
    }
    if (!phone || phone.trim().length < 7) {
      return { success: false, error: 'Mobile number is required.' };
    }
    if (!drivingLicenceNo || drivingLicenceNo.trim().length < 4) {
      return { success: false, error: 'Driving licence number is required.' };
    }
    if (!vehicleNumber || vehicleNumber.trim().length < 4) {
      return { success: false, error: 'Ambulance or vehicle registration number is required.' };
    }
    if (!serviceAffiliation || serviceAffiliation.trim().length < 2) {
      return { success: false, error: 'Ambulance service or hospital affiliation is required.' };
    }

    const result = await createDemoAccount({
      email,
      password,
      role: 'ambulance',
      profileData: {
        fullName: fullName.trim(),
        name: fullName.trim(),
        phone: phone.trim(),
        drivingLicenceNo: drivingLicenceNo.trim(),
        vehicleNumber: vehicleNumber.trim().toUpperCase(),
        serviceAffiliation: serviceAffiliation.trim(),
        emergencyContact: emergencyContact ? emergencyContact.trim() : ''
      }
    });

    if (result.error) {
      return { success: false, error: result.error };
    }

    sessionService.saveSession(result.user, result.profile, 'ambulance');
    store.currentUser = result.user;
    store.userType = 'ambulance';
    store.isLoggedIn = true;
    store.driver = result.profile;

    return { success: true, user: result.user, profile: result.profile, role: 'ambulance' };
  },

  /**
   * Update authenticated profile
   */
  async updateProfile(updates) {
    const session = sessionService.getSession();
    if (!session || !session.user) {
      return { success: false, error: 'No authenticated user session.' };
    }

    const result = updateDemoProfile(session.user.id, updates);
    if (result.error) {
      return { success: false, error: result.error };
    }

    sessionService.updateSessionProfile(result.profile);

    // Update store references
    if (session.role === 'patient') {
      store.patient = result.profile;
      localStorage.setItem('hv_patient_profile', JSON.stringify(result.profile));
    } else if (session.role === 'doctor') {
      store.doctor = result.profile;
    } else if (session.role === 'ambulance') {
      store.driver = result.profile;
    }

    store.currentUser.name = result.profile.fullName || result.profile.name;
    if (result.profile.phone) store.currentUser.phone = result.profile.phone;

    return { success: true, profile: result.profile };
  },

  /**
   * Log out active user
   */
  logout() {
    sessionService.clearSession();
    store.clearUser();
    return { success: true };
  },

  /**
   * Get current session info
   */
  getCurrentUser() {
    const session = sessionService.getSession();
    return session ? session.user : null;
  },

  getCurrentProfile() {
    const session = sessionService.getSession();
    if (!session) return null;
    return session.profile || getDemoProfile(session.user?.id);
  },

  isLoggedIn() {
    return sessionService.isLoggedIn();
  },

  getCurrentRole() {
    return sessionService.getCurrentRole();
  },

  calculateAge(dob) {
    return calculateAge(dob);
  }
};
