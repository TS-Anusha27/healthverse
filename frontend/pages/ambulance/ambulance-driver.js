// HealthVerse â€” Ambulance Driver Dashboard (Uber/Rapido Style UI)
import { navigate } from '../../routes/router.js';
import { mockData } from '../../services/data.js';
import { showToast, showModal, closeModal } from '../../utils/utils.js';

let isOnline = true;
let inRide = false;
let mapInstance = null;

export function renderAmbulanceDriver() {
  const driver = { name: 'Ravi Kumar', vehicle: 'MH 01 AX 4892 (ICU Ambulance)', rating: 4.8 };
  const req = mockData.emergencyRequests[0];
  const app = document.getElementById('app');

  app.innerHTML = `
    <div class="screen" style="background:var(--bg);">
      <!-- Top Driver Header -->
      <div style="background:#111827;color:white;padding:calc(16px + var(--safe-top)) 20px 16px;position:relative;z-index:10;">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="avatar" style="background:var(--emergency);color:white;">RK</div>
            <div>
              <div style="font-family:var(--font-display);font-size:16px;font-weight:700;">${driver.name}</div>
              <div style="font-size:12px;color:rgba(255,255,255,0.7);">${driver.vehicle}</div>
            </div>
          </div>

          <!-- Online Toggle -->
          <div class="flex items-center gap-2">
            <span style="font-size:12px;font-weight:700;color:${isOnline ? 'var(--secondary)' : 'var(--text-tertiary)'};" id="status-text">${isOnline ? 'ONLINE' : 'OFFLINE'}</span>
            <label class="toggle">
              <input type="checkbox" id="driver-online-toggle" ${isOnline ? 'checked' : ''} onchange="toggleDriverOnline(this.checked)" />
              <div class="toggle-track"></div>
              <div class="toggle-thumb"></div>
            </label>
          </div>
        </div>
      </div>

      <!-- Map Container -->
      <div style="height:calc(100dvh - 280px);width:100%;position:relative;" id="amb-map-container">
        <div id="amb-map" style="width:100%;height:100%;"></div>
      </div>

      <!-- Driver Sheet / Ride Panel -->
      <div style="position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:430px;background:var(--surface);border-radius:24px 24px 0 0;padding:20px calc(20px + var(--safe-bottom));box-shadow:0 -8px 30px rgba(0,0,0,0.15);z-index:20;">
        ${!inRide ? `
          <div style="font-family:var(--font-display);font-size:14px;font-weight:700;color:var(--emergency);letter-spacing:0.5px;margin-bottom:8px;">
            ðŸš¨ INCOMING EMERGENCY REQUEST
          </div>
          <div class="card card-sm mb-3" style="background:var(--surface-dim);padding:14px;">
            <div class="flex justify-between items-center mb-1">
              <span style="font-size:15px;font-weight:700;color:var(--text-primary);">${req.patientName}</span>
              <span class="badge badge-emergency">${req.condition}</span>
            </div>
            <div style="font-size:13px;color:var(--text-secondary);">ðŸ“ Pickup: ${req.address} (${req.distance})</div>
            <div style="font-size:13px;color:var(--text-secondary);margin-top:2px;">ðŸ¥ Destination: ${req.hospital}</div>
          </div>
          <button class="btn btn-emergency btn-full btn-lg" onclick="acceptEmergencyRide()">
            ACCEPT EMERGENCY RIDE (ETA ${req.eta})
          </button>
        ` : `
          <div style="font-family:var(--font-display);font-size:14px;font-weight:700;color:var(--secondary);margin-bottom:8px;">
            ðŸš‘ TRIP IN PROGRESS â€” ETA 4 MINS
          </div>
          <div class="card card-sm mb-3" style="background:var(--surface-dim);padding:14px;">
            <div style="font-size:14px;font-weight:700;color:var(--text-primary);">${req.patientName}</div>
            <div style="font-size:13px;color:var(--text-secondary);margin-top:4px;">Navigating to Apollo Emergency Ward...</div>
          </div>
          <div class="flex gap-2">
            <button class="btn btn-primary flex-1" onclick="showToast('Calling patient family...','info')">ðŸ“ž Call Family</button>
            <button class="btn btn-secondary flex-1" onclick="completeEmergencyRide()">Complete Ride</button>
          </div>
        `}
      </div>
    </div>
  `;

  initAmbMap(req);

  window.toggleDriverOnline = (val) => {
    isOnline = val;
    const txt = document.getElementById('status-text');
    if (txt) txt.textContent = isOnline ? 'ONLINE' : 'OFFLINE';
    showToast(isOnline ? 'You are now Online to receive emergencies' : 'You are now Offline', isOnline ? 'success' : 'info');
  };

  window.acceptEmergencyRide = () => {
    inRide = true;
    showToast('Ride Accepted! Turn-by-turn navigation started.', 'success');
    renderAmbulanceDriver();
  };

  window.completeEmergencyRide = () => {
    inRide = false;
    showToast('Emergency ride completed safely! Patient handed to trauma care.', 'success', 5000);
    renderAmbulanceDriver();
  };
}

function initAmbMap(req) {
  setTimeout(() => {
    const el = document.getElementById('amb-map');
    if (!el || typeof L === 'undefined') return;

    const map = L.map('amb-map', { zoomControl: false, attributionControl: false }).setView([req.lat, req.lng], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    const ambIcon = L.divIcon({
      className: '',
      html: `<div style="font-size:24px;">ðŸš‘</div>`,
      iconSize: [30, 30]
    });
    L.marker([req.lat, req.lng], { icon: ambIcon }).addTo(map).bindPopup('<b>Ambulance</b>');

    setTimeout(() => map.invalidateSize(), 300);
  }, 200);
}
