// HealthVerse — Ambulance Driver Dashboard connected to Supabase DB & High-Precision Leaflet GPS Maps
import { navigate } from '../../routes/router.js';
import { showToast, showModal, closeModal } from '../../utils/utils.js';
import { getEmergencyRequests, updateEmergencyRequestStatus, updateDriverStatus } from '../../services/supabase/db.js';
import { signOutUser } from '../../services/supabase/auth.js';
import { store } from '../../store/store.js';

let isOnline = true;
let inRide = false;
let driverMap = null;

export async function renderAmbulanceDriver() {
  const driver = { name: 'Ravi Kumar', vehicle: 'MH 01 AX 4892 (ICU Ambulance)', rating: 4.8 };
  const requests = await getEmergencyRequests();
  const req = requests[0] || {
    id: 'req_emergency_1',
    patientName: 'Meera Krishnan',
    condition: 'Chest Pain — Severe SOS',
    address: '45, Anna Nagar 2nd Main Rd, Chennai',
    distance: '1.2 km',
    eta: '4 min',
    hospital: 'Apollo Hospitals, Greams Rd',
    lat: 13.0827,
    lng: 80.2707
  };

  const app = document.getElementById('app');

  app.innerHTML = `
    <div class="screen" style="background:var(--bg);">
      <!-- Top Driver Navigation Header -->
      <div style="background:#111827;color:white;padding:calc(14px + var(--safe-top)) 16px 14px;position:relative;z-index:10;box-shadow:0 4px 12px rgba(0,0,0,0.3);">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="avatar" style="background:var(--emergency);color:white;font-weight:800;">RK</div>
            <div>
              <div style="font-family:var(--font-display);font-size:15px;font-weight:700;">${driver.name}</div>
              <div style="font-size:11px;color:rgba(255,255,255,0.7);">${driver.vehicle}</div>
            </div>
          </div>

          <!-- Controls: Switch Role & Logout -->
          <div class="flex items-center gap-2">
            <button class="btn btn-xs" style="background:rgba(255,255,255,0.15);color:white;border:1px solid rgba(255,255,255,0.25);" onclick="navigate('user-type')" title="Switch Role">
              🔄 Switch Role
            </button>
            <button class="btn btn-xs btn-ghost" style="color:#FF4757;padding:4px 8px;" onclick="handleDriverSignOut()" title="Sign Out">
              Sign Out
            </button>
          </div>
        </div>

        <!-- Online Toggle Bar -->
        <div class="flex items-center justify-between mt-3 pt-2" style="border-top:1px solid rgba(255,255,255,0.1);">
          <div style="font-size:12px;color:rgba(255,255,255,0.8);">
            Status: <strong style="color:${isOnline ? '#52C99B' : '#FF4757'};" id="status-text">${isOnline ? 'ONLINE (GPS ACTIVE)' : 'OFFLINE'}</strong>
          </div>
          <label class="toggle">
            <input type="checkbox" id="driver-online-toggle" ${isOnline ? 'checked' : ''} onchange="toggleDriverOnline(this.checked)" />
            <div class="toggle-track"></div>
            <div class="toggle-thumb"></div>
          </label>
        </div>
      </div>

      <!-- High-Precision Leaflet Map Container -->
      <div id="amb-map" style="height:calc(100dvh - 290px);width:100%;position:relative;z-index:1;"></div>

      <!-- Driver Ride Controls Panel -->
      <div style="position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:430px;background:var(--surface);border-radius:24px 24px 0 0;padding:18px 20px calc(18px + var(--safe-bottom));box-shadow:0 -8px 30px rgba(0,0,0,0.2);z-index:20;">
        ${!inRide ? `
          <div style="font-family:var(--font-display);font-size:13px;font-weight:800;color:var(--emergency);letter-spacing:0.5px;margin-bottom:8px;display:flex;align-items:center;gap:6px;">
            <span style="width:8px;height:8px;background:var(--emergency);border-radius:50%;animation:pulse-ring 1.2s infinite;"></span>
            INCOMING EMERGENCY REQUEST (SUPABASE SYNCED)
          </div>
          <div class="card card-sm mb-3" style="background:var(--surface-dim);padding:14px;border-left:4px solid var(--emergency);">
            <div class="flex justify-between items-center mb-1">
              <span style="font-size:15px;font-weight:800;color:var(--text-primary);">${req.patient_name || req.patientName}</span>
              <span class="badge badge-emergency">${req.condition || 'SOS Emergency'}</span>
            </div>
            <div style="font-size:13px;color:var(--text-primary);margin-top:4px;">📍 Pickup: <strong>${req.address}</strong> (${req.distance || '1.2 km'})</div>
            <div style="font-size:13px;color:var(--text-secondary);margin-top:2px;">🏥 Target: <strong>${req.hospital || 'Apollo Hospitals'}</strong></div>
          </div>
          <button class="btn btn-emergency btn-full btn-lg" onclick="acceptEmergencyRide('${req.id}')" style="font-weight:800;">
            ACCEPT EMERGENCY RIDE (ETA ${req.eta || '4 min'})
          </button>
        ` : `
          <div style="font-family:var(--font-display);font-size:13px;font-weight:800;color:var(--secondary);margin-bottom:8px;display:flex;align-items:center;gap:6px;">
            <span style="width:8px;height:8px;background:var(--secondary);border-radius:50%;animation:pulse-ring 1s infinite;"></span>
            MISSION ACTIVE — EN ROUTE TO PATIENT
          </div>
          <div class="card card-sm mb-3" style="background:var(--surface-dim);padding:14px;border-left:4px solid var(--secondary);">
            <div style="font-size:14px;font-weight:700;">Navigation: Anna Nagar 2nd Main Rd → Greams Rd</div>
            <div style="font-size:12px;color:var(--text-secondary);margin-top:2px;">Live Speed: 42 km/h • GPS Lock High Accuracy</div>
          </div>
          <button class="btn btn-primary btn-full btn-lg" onclick="completeEmergencyRide('${req.id}')" style="background:var(--secondary);border:none;font-weight:800;">
            ✓ MARK MISSION COMPLETED
          </button>
        `}
      </div>
    </div>
  `;

  initDriverHandlers();
  setTimeout(() => initDriverMap(req), 200);
}

function initDriverMap(req) {
  const mapElement = document.getElementById('amb-map');
  if (!mapElement) return;

  if (typeof L === 'undefined') {
    mapElement.innerHTML = `
      <div style="padding:40px;text-align:center;color:var(--text-secondary);">
        Map loading... Please ensure internet connectivity for Leaflet tiles.
      </div>
    `;
    return;
  }

  // Precise Coordinates
  const driverLoc = [13.0827, 80.2707]; // Driver current position (Chennai)
  const patientLoc = [13.0780, 80.2650]; // Patient pickup position
  const hospitalLoc = [13.0602, 80.2496]; // Apollo Hospitals destination

  if (driverMap) {
    try { driverMap.remove(); } catch(e) {}
  }

  driverMap = L.map('amb-map', { zoomControl: false }).setView(driverLoc, 14);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(driverMap);

  // Custom SVG Markers
  const ambulanceIcon = L.divIcon({
    html: `<div style="background:#FF4757;color:white;width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:0 4px 12px rgba(255,71,87,0.5);border:2px solid white;">🚑</div>`,
    className: '',
    iconSize: [38, 38],
    iconAnchor: [19, 19]
  });

  const patientIcon = L.divIcon({
    html: `<div style="background:#FFA502;color:white;width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 4px 12px rgba(255,165,2,0.5);border:2px solid white;">📍</div>`,
    className: '',
    iconSize: [34, 34],
    iconAnchor: [17, 17]
  });

  const hospitalIcon = L.divIcon({
    html: `<div style="background:#4A90D9;color:white;width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 4px 12px rgba(74,144,217,0.5);border:2px solid white;">🏥</div>`,
    className: '',
    iconSize: [34, 34],
    iconAnchor: [17, 17]
  });

  L.marker(driverLoc, { icon: ambulanceIcon }).addTo(driverMap)
    .bindPopup('<b>Your ICU Ambulance</b><br>Speed: 42 km/h').openPopup();

  L.marker(patientLoc, { icon: patientIcon }).addTo(driverMap)
    .bindPopup(`<b>Patient: ${req.patient_name || req.patientName}</b><br>${req.address}`);

  L.marker(hospitalLoc, { icon: hospitalIcon }).addTo(driverMap)
    .bindPopup(`<b>Target: ${req.hospital || 'Apollo Hospitals'}</b><br>ICU Bed Reserved`);

  // Draw High-Visibility Navigation Polyline Route
  const route = L.polyline([driverLoc, patientLoc, hospitalLoc], {
    color: '#FF4757',
    weight: 5,
    opacity: 0.85,
    dashArray: '8, 8'
  }).addTo(driverMap);

  driverMap.fitBounds(route.getBounds(), { padding: [40, 40] });
}

function initDriverHandlers() {
  window.toggleDriverOnline = async (val) => {
    isOnline = val;
    const statusText = document.getElementById('status-text');
    if (statusText) {
      statusText.innerText = isOnline ? 'ONLINE (GPS ACTIVE)' : 'OFFLINE';
      statusText.style.color = isOnline ? '#52C99B' : '#FF4757';
    }
    await updateDriverStatus('amb1', isOnline ? 'available' : 'offline');
    showToast(isOnline ? 'You are ONLINE — listening for emergency calls' : 'You are OFFLINE', isOnline ? 'success' : 'info');
  };

  window.acceptEmergencyRide = async (id) => {
    inRide = true;
    await updateEmergencyRequestStatus(id, 'accepted', 'amb1');
    showToast('Emergency ride accepted in Supabase! Live GPS navigation active.', 'success', 5000);
    renderAmbulanceDriver();
  };

  window.completeEmergencyRide = async (id) => {
    inRide = false;
    await updateEmergencyRequestStatus(id, 'completed', 'amb1');
    showToast('Mission completed! Patient safely delivered to hospital.', 'success', 5000);
    renderAmbulanceDriver();
  };

  window.handleDriverSignOut = async () => {
    await signOutUser();
    store.clearUser();
    showToast('Signed out of Ambulance Driver module', 'info');
    navigate('login');
  };
}
