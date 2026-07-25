// HealthVerse — Live Queue Tracker
import { navigate, goBack } from '../router.js';
import { mockData } from '../data.js';
import { showToast } from '../utils.js';

let queueInterval = null;

export function renderLiveQueue() {
  const appt = mockData.appointments[0];
  const app = document.getElementById('app');

  app.innerHTML = `
    <div class="screen" id="queue-screen" style="background:var(--bg);">
      <div class="page-header" style="background:white;">
        <button class="back-btn" onclick="goBack()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div class="page-title">Live Queue</div>
        <div style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--secondary);font-weight:600;">
          <div style="width:7px;height:7px;background:var(--success);border-radius:50%;animation:pulse-ring 1.5s infinite;"></div>
          LIVE
        </div>
      </div>

      <div class="screen-content" style="padding:20px;padding-bottom:100px;">
        <!-- Doctor Status -->
        <div class="card" style="background:linear-gradient(135deg,#1E3A5F,#1A4F6E);padding:20px;margin-bottom:20px;">
          <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px;">
            <div style="width:56px;height:56px;border-radius:50%;background:rgba(255,255,255,0.15);border:2px solid rgba(255,255,255,0.3);display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-size:22px;font-weight:700;color:white;">P</div>
            <div>
              <div style="font-family:var(--font-display);font-size:17px;font-weight:700;color:white;">${appt.doctorName}</div>
              <div style="font-size:13px;color:rgba(255,255,255,0.7);">${appt.specialty}</div>
              <div style="display:flex;align-items:center;gap:6px;margin-top:4px;">
                <div style="width:8px;height:8px;border-radius:50%;background:var(--success);animation:pulse-ring 1.5s infinite;"></div>
                <span style="font-size:12px;color:var(--success);font-weight:600;" id="doctor-status">In Consultation</span>
              </div>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1px 1fr 1px 1fr;gap:0;">
            <div style="text-align:center;">
              <div style="font-size:28px;font-weight:800;color:white;font-family:var(--font-display);" id="current-token">TK-041</div>
              <div style="font-size:11px;color:rgba(255,255,255,0.6);margin-top:2px;">CURRENT</div>
            </div>
            <div style="background:rgba(255,255,255,0.15);"></div>
            <div style="text-align:center;">
              <div style="font-size:28px;font-weight:800;color:var(--warning);font-family:var(--font-display);">TK-047</div>
              <div style="font-size:11px;color:rgba(255,255,255,0.6);margin-top:2px;">YOUR TOKEN</div>
            </div>
            <div style="background:rgba(255,255,255,0.15);"></div>
            <div style="text-align:center;">
              <div style="font-size:28px;font-weight:800;color:var(--secondary);font-family:var(--font-display);" id="wait-time">45</div>
              <div style="font-size:11px;color:rgba(255,255,255,0.6);margin-top:2px;">MINS WAIT</div>
            </div>
          </div>
        </div>

        <!-- Queue Position -->
        <div class="card mb-4" style="padding:20px;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
            <div style="font-family:var(--font-display);font-size:16px;font-weight:700;">Queue Position</div>
            <div class="badge badge-warning">6 ahead of you</div>
          </div>

          <!-- Queue visual -->
          <div style="display:flex;flex-direction:column;gap:8px;" id="queue-list">
            ${mockData.doctorQueue.map((q, i) => `
              <div class="queue-item ${q.token === 'TK-047' ? 'my-token' : i === 0 ? 'current' : ''}" id="queue-${q.id}">
                <div class="queue-pos">${i + 1}</div>
                <div class="queue-token">${q.token}</div>
                <div style="flex:1;">
                  <div class="queue-name">${q.token === 'TK-047' ? `${q.name} (You)` : q.name}</div>
                  <div class="queue-cond">${q.condition}</div>
                </div>
                <div class="flex items-center gap-8px">
                  <div class="badge badge-triage-${q.triage}" style="font-size:9px;">${q.triage.toUpperCase()}</div>
                  <div class="queue-wait">${q.wait}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Appointment Details -->
        <div class="card mb-4" style="padding:18px;">
          <div style="font-family:var(--font-display);font-size:15px;font-weight:700;margin-bottom:14px;">Your Appointment</div>
          <div style="display:flex;flex-direction:column;gap:10px;font-size:14px;">
            <div class="flex items-center gap-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <span style="color:var(--text-secondary);">Date & Time</span>
              <span style="font-weight:600;margin-left:auto;">${appt.date}, ${appt.time}</span>
            </div>
            <div class="flex items-center gap-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <span style="color:var(--text-secondary);">Room</span>
              <span style="font-weight:600;margin-left:auto;">${appt.room}</span>
            </div>
            <div class="flex items-center gap-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span style="color:var(--text-secondary);">Type</span>
              <span style="font-weight:600;margin-left:auto;">${appt.type}</span>
            </div>
          </div>
        </div>

        <!-- Notification Settings -->
        <div class="card" style="padding:18px;">
          <div style="font-family:var(--font-display);font-size:15px;font-weight:700;margin-bottom:14px;">Queue Alerts</div>
          ${[
            { label: 'Alert when 3 patients ahead', enabled: true },
            { label: 'Alert when it\'s your turn', enabled: true },
            { label: 'Doctor running late alert', enabled: false },
          ].map((n, i) => `
            <div class="flex items-center justify-between" style="padding:10px 0;border-bottom:${i < 2 ? '1px solid var(--divider)' : 'none'};">
              <span style="font-size:14px;color:var(--text-primary);">${n.label}</span>
              <label class="toggle">
                <input type="checkbox" ${n.enabled ? 'checked' : ''} />
                <div class="toggle-track"></div>
                <div class="toggle-thumb"></div>
              </label>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Action Button -->
      <div style="position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:430px;padding:16px 20px;background:var(--surface);border-top:1px solid var(--border-light);">
        <button class="btn btn-primary btn-full" onclick="checkInNow()">
          Check In at Counter
        </button>
      </div>
    </div>
  `;

  injectQueueStyles();
  startQueueSimulation();

  window.checkInNow = () => showToast('✅ Checked in! Please proceed to Room 204, 2nd Floor', 'success', 4000);

  return () => clearInterval(queueInterval);
}

function startQueueSimulation() {
  let waitMins = 45;
  let currentTokenNum = 41;

  queueInterval = setInterval(() => {
    waitMins = Math.max(0, waitMins - 1);
    const waitEl = document.getElementById('wait-time');
    if (waitEl) waitEl.textContent = waitMins;

    if (waitMins % 5 === 0 && waitMins > 0) {
      showToast(`⏰ ${waitMins} minutes remaining for your turn`, 'info');
    }
    if (waitMins === 0) {
      showToast('🏥 It\'s your turn! Please proceed to Room 204', 'success', 5000);
      clearInterval(queueInterval);
    }
  }, 8000);
}

function injectQueueStyles() {
  if (document.getElementById('queue-styles')) return;
  const s = document.createElement('style');
  s.id = 'queue-styles';
  s.textContent = `
    .queue-item { display:flex;align-items:center;gap:10px;padding:12px;border-radius:12px;background:var(--surface-dim);transition:all var(--transition-fast); }
    .queue-item.current { background:var(--primary-light);border:1.5px solid var(--primary); }
    .queue-item.my-token { background:var(--warning-light);border:1.5px solid var(--warning); }
    .queue-pos { width:24px;height:24px;border-radius:50%;background:var(--border);color:var(--text-tertiary);font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
    .queue-item.current .queue-pos { background:var(--primary);color:white; }
    .queue-item.my-token .queue-pos { background:var(--warning);color:white; }
    .queue-token { font-size:12px;font-weight:700;color:var(--text-secondary);min-width:50px;font-family:var(--font-display); }
    .queue-item.current .queue-token { color:var(--primary); }
    .queue-name { font-size:13px;font-weight:600;color:var(--text-primary); }
    .queue-cond { font-size:11px;color:var(--text-secondary);margin-top:2px; }
    .queue-wait { font-size:11px;color:var(--text-tertiary); }
  `;
  document.head.appendChild(s);
}
