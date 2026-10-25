// HealthVerse — App Entry Point
import './styles/style.css';
import { register, navigate, goBack, initRouter, parseHash } from './routes/router.js';
import { store } from './store/store.js';
import * as utils from './utils/utils.js';
import * as routerModule from './routes/router.js';
import { authService } from './services/auth/authService.js';

// Expose routing and utilities globally for inline onclick handlers across templates
window.navigate = navigate;
window.goBack = goBack;
window._utils = utils;
window._router = routerModule;
window._authService = authService;

// Import pages
import { renderSplash } from './pages/auth/splash.js';
import { renderLogin } from './pages/auth/login.js';
import { renderUserType } from './pages/auth/usertype.js';
import { renderPatientRegistration } from './pages/auth/patient-registration.js';
import { renderPatientHome } from './pages/patient/patient-home.js';
import { renderAppointments } from './pages/appointments/appointments.js';
import { renderTriage } from './pages/emergency/triage.js';
import { renderLiveQueue } from './pages/appointments/live-queue.js';
import { renderTelemedicine } from './pages/telemedicine/telemedicine.js';
import { renderHealthRecords } from './pages/records/health-records.js';
import { renderBloodDonation, renderOrganDonation } from './pages/bloodDonation/blood-donation.js';
import { renderMedicines } from './pages/records/medicines.js';
import { renderHealthInsights } from './pages/ai/health-insights.js';
import { renderSOS } from './pages/emergency/sos.js';
import { renderDoctorDashboard } from './pages/doctor/doctor-dashboard.js';
import { renderDoctorSummary } from './pages/doctor/doctor-summary.js';
import { renderDoctorPrescription } from './pages/doctor/doctor-prescription.js';
import { renderAmbulanceDriver } from './pages/ambulance/ambulance-driver.js';
import { renderSettings } from './pages/profile/settings.js';
import { renderNotifications } from './pages/profile/notifications.js';

// Register routes
register('splash', renderSplash);
register('login', renderLogin);
register('user-type', renderUserType);
register('landing', renderUserType);
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

// Initialize router popstate/hashchange event listeners
initRouter();

// Startup bootstrap: restore session & navigate to targeted route
async function bootstrap() {
  await store.loadSavedUser();

  const currentHash = window.location.hash.trim();
  if (currentHash && currentHash !== '#' && currentHash !== '#/') {
    // User refreshed or bookmarked a specific route
    const { page, params } = parseHash();
    navigate(page, params, false);
  } else {
    // Initial visit or clean root: show public landing / role selection
    if (store.isLoggedIn && store.userType) {
      if (store.userType === 'doctor') navigate('doctor-home', {}, false);
      else if (store.userType === 'ambulance') navigate('ambulance-home', {}, false);
      else navigate('patient-home', {}, false);
    } else {
      navigate('user-type', {}, false);
    }
  }
}

bootstrap();
