// HealthVerse — Ambulance Driver Dashboard connected to Supabase DB
import { navigate } from '../../routes/router.js';
import { showToast, showModal, closeModal } from '../../utils/utils.js';
import { getEmergencyRequests, updateEmergencyRequestStatus, updateDriverStatus } from '../../services/supabase/db.js';

let isOnline = true;
let inRide = false;

export async function renderAmbulanceDriver() {
  const driver = { name: 'Ravi Kumar', vehicle: 'MH 01 AX 4892 (ICU Ambulance)', rating: 4.8 };
  const requests = await getEmergencyRequests();
  const req = requests[0] || { patientName: 'Meera Krishnan', condition: 'Chest Pain — Urgent', address: '45, Anna Nagar, Chennai', distance: '1.2 km', eta: '4 min', hospital: 'Apollo Hospitals' };
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
      <div style="height:calc(100dvh - 280px);width:100%;position:relative;display:flex;align-items:center;justify-content:center;background:var(--surface-dim);" id="amb-map-container">
        <div style="text-align:center;padding:20px;">
          <div style="font-size:40px;margin-bottom:8px;">🚑</div>
          <div style="font-family:var(--font-display);font-size:16px;font-weight:700;">Live Dispatch Radar</div>
          <div style="font-size:12px;color:var(--text-secondary);margin-top:4px;">Connected to Supabase Real-time Emergency Feed</div>
        </div>
      </div>

      <!-- Driver Sheet / Ride Panel -->
      <div style="position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:430px;background:var(--surface);border-radius:24px 24px 0 0;padding:20px calc(20px + var(--safe-bottom));box-shadow:0 -8px 30px rgba(0,0,0,0.15);z-index:20;">
        ${!inRide ? `
          <div style="font-family:var(--font-display);font-size:14px;font-weight:700;color:var(--emergency);letter-spacing:0.5px;margin-bottom:8px;">
            🚨 INCOMING EMERGENCY REQUEST
          </div>
          <div class="card card-sm mb-3" style="background:var(--surface-dim);padding:14px;">
            <div class="flex justify-between items-center mb-1">
              <span style="font-size:15px;font-weight:700;color:var(--text-primary);">${req.patient_name || req.patientName}</span>
              <span class="badge badge-emergency">${req.condition || 'SOS Emergency'}</span>
            </div>
            <div style="font-size:13px;color:var(--text-secondary);">📍 Pickup: ${req.address} (${req.distance || '1.0 km'})</div>
            <div style="font-size:13px;color:var(--text-secondary);margin-top:2px;">🏥 Destination: ${req.hospital || 'Apollo Hospitals'}</div>
          </div>
          <button class="btn btn-emergency btn-full btn-lg" onclick="acceptEmergencyRide('${req.id}')">
            ACCEPT EMERGENCY RIDE (ETA ${req.eta || '4 min'})
          </button>
        ` : `
          <div style="font-family:var(--font-display);font-size:14px;font-weight:700;color:var(--secondary);margin-bottom:8px;">
            ⚡ ACTIVE EMERGENCY MISSION
          </div>
          <div class="card card-sm mb-3" style="background:var(--surface-dim);padding:14px;">
            <div style="font-size:14px;font-weight:700;">En Route to Patient</div>
            <div style="font-size:12px;color:var(--text-secondary);margin-top:2px;">Patient Status: Stable • GPS Tracking Active</div>
          </div>
          <button class="btn btn-primary btn-full btn-lg" onclick="completeEmergencyRide('${req.id}')">
            MARK MISSION COMPLETED
          </button>
        `}
      </div>
    </div>
  `;

  initDriverHandlers();
}

function initDriverHandlers() {
  window.toggleDriverOnline = async (val) => {
    isOnline = val;
    document.getElementById('status-text').innerText = isOnline ? 'ONLINE' : 'OFFLINE';
    document.getElementById('status-text').style.color = isOnline ? 'var(--secondary)' : 'var(--text-tertiary)';
    await updateDriverStatus('amb1', isOnline ? 'available' : 'offline');
    showToast(isOnline ? 'You are ONLINE — listening for Supabase emergency calls' : 'You are OFFLINE', isOnline ? 'success' : 'info');
  };

  window.acceptEmergencyRide = async (id) => {
    inRide = true;
    await updateEmergencyRequestStatus(id, 'accepted', 'amb1');
    showToast('Emergency ride accepted in Supabase database! GPS navigation started.', 'success', 5000);
    renderAmbulanceDriver();
  };

  window.completeEmergencyRide = async (id) => {
    inRide = false;
    await updateEmergencyRequestStatus(id, 'completed', 'amb1');
    showToast('Mission completed! Patient safely transported to hospital.', 'success', 5000);
    renderAmbulanceDriver();
  };
}
