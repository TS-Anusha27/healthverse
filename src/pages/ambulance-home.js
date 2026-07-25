// HealthVerse — Ambulance Driver Navigation & Dispatch Portal
import { navigate } from '../router.js';
import { store } from '../store.js';
import { mockData } from '../data.js';
import { showToast, showModal, closeModal } from '../utils.js';

let ambMap = null;

export function renderAmbulanceHome() {
  const app = document.getElementById('app');
  const driver = mockData.ambulanceDrivers[0];
  const req = mockData.emergencyRequests[0];

  app.innerHTML = `
    <div class="screen" id="ambulance-home" style="background:#0F172A;color:white;min-height:100dvh;">
      <!-- Top Bar -->
      <div style="padding:16px 20px;display:flex;align-items:center;justify-content:space-between;background:rgba(255,255,255,0.05);border-bottom:1px solid rgba(255,255,255,0.1);">
        <div>
          <div style="font-size:11px;color:#52C99B;font-weight:700;letter-spacing:1px;text-transform:uppercase;">● ONLINE • DISPATCH READY</div>
          <div style="font-family:var(--font-display);font-size:17px;font-weight:800;">${driver.name}</div>
        </div>
        <button class="btn-icon btn-ghost" style="color:white;" onclick="signOut()" aria-label="Sign out">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </button>
      </div>

      <div class="screen-content" style="padding-bottom:100px;">
        <!-- Emergency Dispatch Alert Card -->
        <div style="padding:20px;">
          <div style="background:linear-gradient(135deg,#E74C3C,#C62828);border-radius:24px;padding:20px;box-shadow:0 12px 30px rgba(231,76,60,0.4);" class="animate-slide-up">
            <div style="display:flex;align-items:center;justify-content:space-between;">
              <span class="badge" style="background:rgba(255,255,255,0.2);color:white;">ACTIVE DISPATCH #SOS-901</span>
              <span style="font-size:13px;font-weight:700;color:white;">ETA 4 MIN</span>
            </div>

            <h2 style="font-family:var(--font-display);font-size:22px;font-weight:800;margin-top:12px;">${req.patientName}</h2>
            <p style="font-size:14px;color:rgba(255,255,255,0.9);margin-top:4px;">🚨 ${req.condition}</p>

            <div style="background:rgba(0,0,0,0.25);border-radius:14px;padding:12px;margin-top:14px;font-size:13px;">
              <div style="color:rgba(255,255,255,0.7);font-size:11px;text-transform:uppercase;">Pickup Address</div>
              <div style="font-weight:700;color:white;margin-top:2px;">${req.address}</div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:16px;">
              <button class="btn btn-sm" style="background:white;color:#C62828;font-weight:700;" onclick="showToast('Calling Patient Patient Meera...', 'info')">
                📞 Call Patient
              </button>
              <button class="btn btn-sm" style="background:rgba(255,255,255,0.2);color:white;font-weight:700;" onclick="showToast('Hospital notified of incoming trauma!', 'success')">
                🏥 Notify Hospital
              </button>
            </div>
          </div>
        </div>

        <!-- Live Navigation Map -->
        <div style="padding:0 20px;">
          <div style="font-weight:700;font-size:15px;margin-bottom:10px;color:rgba(255,255,255,0.9);">Turn-by-Turn GPS Route</div>
          <div id="amb-map" style="height:260px;width:100%;border-radius:20px;overflow:hidden;border:1px solid rgba(255,255,255,0.1);"></div>
        </div>
      </div>
    </div>
  `;

  setTimeout(() => {
    if (window.L && document.getElementById('amb-map')) {
      try {
        ambMap = L.map('amb-map').setView([13.0700, 80.2100], 14);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
        }).addTo(ambMap);

        // Add markers
        L.marker([13.0700, 80.2100]).addTo(ambMap).bindPopup('Patient Location (Meera)').openPopup();
        L.marker([13.0602, 80.2496]).addTo(ambMap).bindPopup('Apollo Trauma Center');
      } catch (e) {
        console.error('Leaflet map error:', e);
      }
    }
  }, 100);

  window.signOut = () => {
    store.clearUser();
    navigate('login');
  };
}
