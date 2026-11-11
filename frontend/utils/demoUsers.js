// HealthVerse — Pre-seeded Demo Accounts for Trial & Quick Access
import { createDemoAccount } from '../services/auth/demoAuthAdapter.js';

const STORAGE_ACCOUNTS_KEY = 'hv_dev_accounts_v1';

export const DEMO_ACCOUNTS = {
  patient: {
    role: 'patient',
    title: 'Patient Demo User',
    email: 'patient@demo.com',
    password: 'demo123',
    profileData: {
      fullName: 'Arjun Nair',
      name: 'Arjun Nair',
      dob: '1997-05-14',
      phone: '+91 9876543210',
      bloodGroup: 'B+',
      gender: 'male',
      address: '45, Velachery Main Road, Chennai',
      emergencyName: 'Meera Nair',
      emergencyPhone: '+91 9876543200'
    }
  },
  doctor: {
    role: 'doctor',
    title: 'Doctor Demo User',
    email: 'doctor@demo.com',
    password: 'demo123',
    profileData: {
      fullName: 'Dr. Priya Krishnamurthy',
      name: 'Dr. Priya Krishnamurthy',
      phone: '+91 9876511122',
      medicalRegNo: 'NMC-2024-88421',
      qualification: 'MBBS, MD (Cardiology)',
      specialisation: 'Cardiologist',
      hospital: 'Apollo Hospitals, Greams Road',
      experience: '12 years'
    }
  },
  ambulance: {
    role: 'ambulance',
    title: 'Ambulance Demo User',
    email: 'driver@demo.com',
    password: 'demo123',
    profileData: {
      fullName: 'Ravi Kumar',
      name: 'Ravi Kumar',
      phone: '+91 9876500108',
      drivingLicenceNo: 'DL-TN-07-2018-00912',
      vehicleNumber: 'TN 07 HV 2026',
      serviceAffiliation: 'LifeLine Emergency Fleet'
    }
  }
};

let seedPromise = null;

function readExistingEmails() {
  try {
    const raw = localStorage.getItem(STORAGE_ACCOUNTS_KEY);
    const accounts = raw ? JSON.parse(raw) : {};
    return new Set(
      Object.values(accounts)
        .map(acc => acc?.email?.toLowerCase())
        .filter(Boolean)
    );
  } catch {
    return new Set();
  }
}

/**
 * Seeds one easy demo user per role (patient, doctor, ambulance) into local demo auth storage
 * without modifying any active session or backend services.
 */
export async function ensureDemoAccountsSeeded() {
  if (seedPromise) return seedPromise;

  seedPromise = (async () => {
    const existingEmails = readExistingEmails();
    for (const demo of Object.values(DEMO_ACCOUNTS)) {
      if (!existingEmails.has(demo.email.toLowerCase())) {
        await createDemoAccount({
          email: demo.email,
          password: demo.password,
          role: demo.role,
          profileData: demo.profileData
        });
      }
    }
  })();

  try {
    await seedPromise;
  } finally {
    seedPromise = null;
  }
}
