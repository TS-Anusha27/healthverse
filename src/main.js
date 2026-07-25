// HealthVerse — App Entry Point
import './style.css';
import { register, navigate } from './router.js';
import { store } from './store.js';
import * as utils from './utils.js';
import * as routerModule from './router.js';

// Expose utilities globally for inline onclick handlers
window._utils = utils;
window._router = routerModule;

// Import pages
import { renderSplash } from './pages/splash.js';
import { renderLogin } from './pages/login.js';
import { renderUserType } from './pages/usertype.js';
import { renderPatientRegistration } from './pages/patient-registration.js';
import { renderPatientHome } from './pages/patient-home.js';
import { renderAppointments } from './pages/appointments.js';
import { renderTriage } from './pages/triage.js';
import { renderLiveQueue } from './pages/live-queue.js';
import { renderTelemedicine } from './pages/telemedicine.js';
import { renderHealthRecords } from './pages/health-records.js';
import { renderBloodDonation, renderOrganDonation } from './pages/blood-donation.js';
import { renderMedicines } from './pages/medicines.js';
import { renderHealthInsights } from './pages/health-insights.js';
import { renderSOS } from './pages/sos.js';
import { renderDoctorDashboard } from './pages/doctor-dashboard.js';
import { renderDoctorSummary } from './pages/doctor-summary.js';
import { renderDoctorPrescription } from './pages/doctor-prescription.js';
import { renderAmbulanceDriver } from './pages/ambulance-driver.js';
import { renderSettings } from './pages/settings.js';
import { renderNotifications } from './pages/notifications.js';

// Register routes
register('splash', renderSplash);
register('login', renderLogin);
register('user-type', renderUserType);
register('patient-registration', renderPatientRegistration);
register('patient-home', renderPatientHome);
register('appointments', renderAppointments);
register('triage', renderTriage);
register('live-queue', renderLiveQueue);
register('telemedicine', renderTelemedicine);
register('health-records', renderHealthRecords);
register('blood-donation', renderBloodDonation);
register('organ-donation', renderOrganDonation);
register('medicines', renderMedicines);
register('health-insights', renderHealthInsights);
register('sos', renderSOS);
register('doctor-home', renderDoctorDashboard);
register('doctor-summary', renderDoctorSummary);
register('doctor-prescription', renderDoctorPrescription);
register('ambulance-home', renderAmbulanceDriver);
register('settings', renderSettings);
register('notifications', renderNotifications);

// Load saved user state or start splash
store.loadSavedUser();

// Initial navigation
navigate('splash');
