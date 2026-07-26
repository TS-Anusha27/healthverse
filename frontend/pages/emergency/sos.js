// HealthVerse â€” Emergency SOS Screen
import { navigate, goBack } from '../../routes/router.js';
import { showToast } from '../../utils/utils.js';

let countdown = 5;
let timer = null;

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
            <div style="font-size:13px;font-weight:600;color:white;">Current Location: Velachery, Chennai</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.6);">Accuracy: 8m â€¢ GPS Active</div>
          </div>
        </div>

        <button class="btn btn-ghost btn-full" onclick="cancelSOS()" style="background:rgba(255,255,255,0.15);color:white;border:none;">
          Cancel / Back to Home
        </button>
      </div>
    </div>
  `;

  window.triggerSOS = () => {
    const btn = document.getElementById('main-sos-btn');
    const cdEl = document.getElementById('sos-countdown');
    btn.disabled = true;

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

function dispatchEmergency() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="screen" style="background:#111827;color:white;padding:24px;min-height:100dvh;display:flex;flex-direction:column;justify-content:between;">
      <div style="text-align:center;margin-top:40px;" class="animate-slide-up">
        <div style="width:90px;height:90px;border-radius:50%;background:var(--emergency);margin:0 auto 20px;display:flex;align-items:center;justify-content:center;font-size:40px;box-shadow:0 0 40px rgba(255,71,87,0.6);animation:pulse-ring 1.5s infinite;">
          ðŸš¨
        </div>
        <h1 style="font-family:var(--font-display);font-size:26px;font-weight:800;color:white;">Ambulance Dispatched!</h1>
        <p style="font-size:14px;color:rgba(255,255,255,0.7);margin-top:6px;">Driver: Ravi Kumar (MH 01 AX 4892) is en route</p>
      </div>

      <!-- Live Tracking Card -->
      <div class="card" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15);color:white;padding:20px;margin:30px 0;">
        <div class="flex justify-between items-center mb-3">
          <span style="font-size:13px;color:rgba(255,255,255,0.7);">ESTIMATED ARRIVAL</span>
          <span style="font-family:var(--font-display);font-size:24px;font-weight:800;color:var(--secondary);">4 MINS</span>
        </div>
        <div class="progress-bar mb-3"><div class="progress-fill" style="width:75%;background:var(--secondary);"></div></div>
        <div style="display:flex;flex-direction:column;gap:8px;font-size:13px;color:rgba(255,255,255,0.8);">
          <div>ðŸ“ Destination: Apollo Hospitals Emergency Ward</div>
          <div>ðŸ“ž Emergency Contact (Mother) Notified via SMS</div>
        </div>
      </div>

      <button class="btn btn-emergency btn-full btn-lg" onclick="navigate('patient-home')">
        Back to Dashboard
      </button>
    </div>
  `;

  showToast('ðŸš¨ Emergency SOS dispatched! Hospital and family notified.', 'error', 6000);
}
