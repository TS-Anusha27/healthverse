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
    <div class="screen" style="background:linear-gradient(160deg,#1A0A0A 0%,#2D0B0E 50%,#1A2332 100%);color:white;min-height:100dvh;justify-content:space-between;padding:calc(20px + var(--safe-top)) 24px calc(40px + var(--safe-bottom));">
      <div>
        <div class="flex items-center justify-between">
          <button class="back-btn" onclick="cancelSOS()" style="background:rgba(255,255,255,0.1);border-color:rgba(255,255,255,0.2);">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div style="font-family:var(--font-display);font-size:16px;font-weight:700;color:var(--emergency);">EMERGENCY SOS</div>
          <div style="width:38px;"></div>
        </div>

        <div style="text-align:center;margin-top:30px;">
          <h1 style="font-family:var(--font-display);font-size:28px;font-weight:800;color:white;">Emergency Mode</h1>
          <p style="font-size:14px;color:rgba(255,255,255,0.7);margin-top:6px;">Tap SOS button to immediately dispatch nearest ambulance and alert family.</p>
        </div>
      </div>

      <!-- Giant SOS Button -->
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;">
        <button class="sos-btn" id="main-sos-btn" onclick="triggerSOS()">
          <span>SOS</span>
          <span style="font-size:11px;font-weight:600;opacity:0.8;margin-top:-2px;">PRESS NOW</span>
        </button>
        <div id="sos-countdown" style="margin-top:28px;font-size:15px;color:rgba(255,255,255,0.8);font-weight:600;">
          GPS Location Shared Automatically
        </div>
      </div>

      <!-- Action Footer -->
      <div style="display:flex;flex-direction:column;gap:12px;">
        <div style="background:rgba(255,255,255,0.08);border-radius:16px;padding:14px;display:flex;align-items:center;gap:12px;backdrop-filter:blur(10px);">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--secondary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          <div>
            <div style="font-size:13px;font-weight:600;color:white;">Current Location: Velachery Main Rd, Chennai</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.6);">High Accuracy GPS: 12.9759° N, 80.2212° E</div>
          </div>
        </div>

        <button class="btn btn-ghost btn-full" onclick="cancelSOS()" style="background:rgba(255,255,255,0.15);color:white;border:none;">
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
      if (cdEl) cdEl.innerHTML = `<span style="color:var(--emergency);font-size:20px;font-weight:800;">Dispatching in ${countdown}s...</span>`;
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
    <div class="screen" style="background:#111827;color:white;padding:20px;min-height:100dvh;display:flex;flex-direction:column;justify-content:between;">
      <div style="text-align:center;margin-top:20px;" class="animate-slide-up">
        <div style="width:70px;height:70px;border-radius:50%;background:var(--emergency);margin:0 auto 12px;display:flex;align-items:center;justify-content:center;font-size:32px;box-shadow:0 0 30px rgba(255,71,87,0.6);animation:pulse-ring 1.5s infinite;">
          🚨
        </div>
        <h1 style="font-family:var(--font-display);font-size:24px;font-weight:800;color:white;">Ambulance Dispatched!</h1>
        <p style="font-size:13px;color:rgba(255,255,255,0.7);margin-top:4px;">Saved to Supabase database. Driver Ravi Kumar en route.</p>
      </div>

      <!-- High Precision Leaflet SOS Tracking Map -->
      <div id="sos-tracking-map" style="height:240px;width:100%;border-radius:18px;margin:16px 0;box-shadow:0 8px 24px rgba(0,0,0,0.4);overflow:hidden;"></div>

      <!-- Live Tracking Status Card -->
      <div class="card" style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);color:white;padding:16px;margin-bottom:16px;">
        <div class="flex justify-between items-center mb-2">
          <span style="font-size:12px;color:rgba(255,255,255,0.7);font-weight:700;">LIVE AMBULANCE ETA</span>
          <span style="font-family:var(--font-display);font-size:22px;font-weight:800;color:var(--secondary);">4 MINS</span>
        </div>
        <div class="progress-bar mb-3" style="background:rgba(255,255,255,0.15);"><div class="progress-fill" style="width:75%;background:var(--secondary);"></div></div>
        <div style="display:flex;flex-direction:column;gap:6px;font-size:12px;color:rgba(255,255,255,0.85);">
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
  showToast('🚨 Emergency SOS recorded in Supabase! Driver en route.', 'error', 6000);
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
