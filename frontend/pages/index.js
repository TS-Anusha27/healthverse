// HealthVerse — Pages Barrel File
// Re-exports all page render functions for clean imports

// Auth
export { renderSplash } from './auth/splash.js';
export { renderLogin } from './auth/login.js';
export { renderUserType } from './auth/usertype.js';
export { renderPatientRegistration } from './auth/patient-registration.js';

// Patient
export { renderPatientHome } from './patient/patient-home.js';

// Doctor
export { renderDoctorDashboard } from './doctor/doctor-dashboard.js';
export { renderDoctorSummary } from './doctor/doctor-summary.js';
export { renderDoctorPrescription } from './doctor/doctor-prescription.js';

// Ambulance
export { renderAmbulanceDriver } from './ambulance/ambulance-driver.js';

// Appointments
export { renderAppointments } from './appointments/appointments.js';
export { renderLiveQueue } from './appointments/live-queue.js';

// Telemedicine
export { renderTelemedicine } from './telemedicine/telemedicine.js';

// Emergency
export { renderSOS } from './emergency/sos.js';
export { renderTriage } from './emergency/triage.js';

// Blood & Organ Donation
export { renderBloodDonation, renderOrganDonation } from './bloodDonation/blood-donation.js';

// AI
export { renderHealthInsights } from './ai/health-insights.js';

// Records
export { renderHealthRecords } from './records/health-records.js';
export { renderMedicines } from './records/medicines.js';

// Profile
export { renderSettings } from './profile/settings.js';
export { renderNotifications } from './profile/notifications.js';
