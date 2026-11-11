// HealthVerse — Emergency SOS Screen with Supabase Integration & High-Precision Leaflet Map
import { navigate, goBack } from '../../routes/router.js';
import { showToast } from '../../utils/utils.js';
import { createEmergencyRequest } from '../../services/supabase/db.js';
import { store } from '../../store/store.js';

let countdown = 5;
let timer = null;
let sosMap = null;

export function renderSOS() {
  const app = document.getElementById('app');
  countdown = 5;

  app.innerHTML = `
    <div class="screen sos-screen">
      <div>
        <div class="flex items-center justify-between">
          <button class="back-btn sos-back-btn" onclick="cancelSOS()" aria-label="Cancel SOS and go back">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div class="sos-header-title">EMERGENCY SOS</div>
          <div class="header-spacer-sm"></div>
        </div>

        <div class="sos-hero">
          <h1 class="sos-hero-title">Emergency Mode</h1>
          <p class="sos-hero-sub">Tap SOS button to immediately dispatch nearest ambulance and alert family.</p>
        </div>
      </div>

      <!-- Giant SOS Button -->
      <div class="sos-center">
        <button class="sos-btn" id="main-sos-btn" onclick="triggerSOS()">
          <span>SOS</span>
          <span class="sos-press-label">PRESS NOW</span>
        </button>
        <div id="sos-countdown" class="sos-countdown-text">
          GPS Location Shared Automatically
        </div>
      </div>

      <!-- Action Footer -->
      <div class="flex-col gap-3">
        <div class="sos-location-card">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--secondary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          <div>
            <div class="sos-location-title">Current Location: Velachery Main Rd, Chennai</div>
            <div class="sos-location-coords">High Accuracy GPS: 12.9759° N, 80.2212° E</div>
          </div>
        </div>

        <button class="btn btn-ghost btn-full sos-cancel-btn" onclick="cancelSOS()">
          Cancel / Back to Dashboard
        </button>
      </div>
    </div>
  `;

  window.triggerSOS = () => {
    const btn = document.getElementById('main-sos-btn');
    const cdEl = document.getElementById('sos-countdown');
    if (btn) btn.disabled = true;

    timer = setInterval(() => {
      countdown--;
      if (cdEl) cdEl.innerHTML = `<span class="sos-countdown-urgent">Dispatching in ${countdown}s...</span>`;
      if (countdown <= 0) {
        clearInterval(timer);
        dispatchEmergency();
      }
    }, 1000);
  };

  window.cancelSOS = () => {
    if (timer) clearInterval(timer);
    goBack();
  };
}

async function dispatchEmergency() {
  const app = document.getElementById('app');

  // Create real emergency request in Supabase
  await createEmergencyRequest({
    patient_id: store.currentUser?.id || null,
    patient_name: store.currentUser?.name || 'Emergency Patient',
    condition: 'Acute Emergency SOS Call',
    address: '45, Velachery Main Road, Chennai',
    distance: '0.8 km',
    eta: '4 min',
    hospital: 'Apollo Hospitals',
    triage: 'red',
    status: 'pending'
  });

  app.innerHTML = `
    <div class="screen sos-dispatch-screen">
      <div class="text-center mt-4 animate-slide-up">
        <div class="sos-dispatch-badge">
          🚨
        </div>
        <h1 class="sos-dispatch-title" style="font-family:var(--font-display);font-size:24px;font-weight:800;color:white;">Ambulance Dispatched!</h1>
        <p class="sos-hero-sub">Emergency alert sent. Driver Ravi Kumar en route.</p>
      </div>

      <!-- High Precision Leaflet SOS Tracking Map -->
      <div id="sos-tracking-map" class="sos-dispatch-map"></div>

      <!-- Live Tracking Status Card -->
      <div class="card sos-dispatch-card">
        <div class="flex justify-between items-center mb-2">
          <span class="sos-eta-label">LIVE AMBULANCE ETA</span>
          <span class="sos-eta-value">4 MINS</span>
        </div>
        <div class="progress-bar mb-3 sos-progress-dark"><div class="progress-fill" style="width:75%;background:var(--secondary);"></div></div>
        <div class="flex-col gap-1 sos-dispatch-meta">
          <div>🚑 Driver: <strong>Ravi Kumar (+91 98765 00001)</strong></div>
          <div>🏥 Target Hospital: <strong>Apollo Hospitals, Greams Rd</strong></div>
          <div>📍 Your Address: <strong>Velachery Main Rd, Chennai</strong></div>
        </div>
      </div>

      <button class="btn btn-emergency btn-full btn-lg" onclick="navigate('patient-home')">
        Back to Dashboard
      </button>
    </div>
  `;

  setTimeout(initSOSTrackingMap, 200);
  showToast('🚨 Emergency SOS alert sent! Driver en route.', 'error', 6000);
}

function initSOSTrackingMap() {
  const mapElement = document.getElementById('sos-tracking-map');
  if (!mapElement || typeof L === 'undefined') return;

  const patientPos = [12.9759, 80.2212]; // Velachery, Chennai
  const ambPos = [12.9820, 80.2290]; // Ambulance current location
  const hospitalPos = [13.0602, 80.2496]; // Apollo Hospitals

  if (sosMap) {
    try { sosMap.remove(); } catch(e) {}
  }

  sosMap = L.map('sos-tracking-map', { zoomControl: false }).setView(patientPos, 14);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(sosMap);

  const ambIcon = L.divIcon({
    html: `<div style="background:#FF4757;color:white;width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 4px 12px rgba(255,71,87,0.6);border:2px solid white;">🚑</div>`,
    className: '',
    iconSize: [34, 34],
    iconAnchor: [17, 17]
  });

  const patientIcon = L.divIcon({
    html: `<div style="background:#FFA502;color:white;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 4px 12px rgba(255,165,2,0.6);border:2px solid white;">📍</div>`,
    className: '',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });

  L.marker(ambPos, { icon: ambIcon }).addTo(sosMap).bindPopup('<b>Ambulance En Route</b><br>ETA: 4 Mins').openPopup();
  L.marker(patientPos, { icon: patientIcon }).addTo(sosMap).bindPopup('<b>Your Current Location</b><br>Velachery, Chennai');

  const line = L.polyline([ambPos, patientPos], { color: '#FF4757', weight: 4, opacity: 0.9, dashArray: '6, 6' }).addTo(sosMap);
  sosMap.fitBounds(line.getBounds(), { padding: [30, 30] });
}
