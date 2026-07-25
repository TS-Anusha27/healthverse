// HealthVerse — Doctor Dashboard Portal
import { navigate } from '../router.js';
import { store } from '../store.js';
import { mockData, mockAISummary } from '../data.js';
import { showToast, showModal, closeModal } from '../utils.js';

export function renderDoctorHome() {
  const app = document.getElementById('app');
  const doctor = mockData.doctors[0]; // Dr. Priya Krishnamurthy
  const queue = mockData.doctorQueue;

  app.innerHTML = `
    <div class="screen" id="doctor-home" style="background:var(--bg);">
      <!-- Header -->
      <div style="background:linear-gradient(135deg,#1A2332,#0F172A);color:white;padding:24px 20px 20px;">
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <div>
            <span class="badge" style="background:rgba(82,201,155,0.2);color:#52C99B;border:1px solid rgba(82,201,155,0.3);margin-bottom:6px;">Doctor Portal</span>
            <h1 style="font-family:var(--font-display);font-size:22px;font-weight:800;">${doctor.name}</h1>
            <p style="font-size:13px;color:rgba(255,255,255,0.7);">${doctor.specialty} • ${doctor.hospital}</p>
          </div>
          <button class="btn-icon btn-ghost" style="color:white;background:rgba(255,255,255,0.1);" onclick="signOut()" aria-label="Sign out">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </div>

        <!-- Quick Stats Banner -->
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-top:20px;">
          <div style="background:rgba(255,255,255,0.08);border-radius:14px;padding:12px;text-align:center;">
            <div style="font-size:20px;font-weight:800;font-family:var(--font-display);color:#4A90D9;">${queue.length}</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.6);margin-top:2px;">In Queue</div>
          </div>
          <div style="background:rgba(255,255,255,0.08);border-radius:14px;padding:12px;text-align:center;">
            <div style="font-size:20px;font-weight:800;font-family:var(--font-display);color:#52C99B;">18</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.6);margin-top:2px;">Seen Today</div>
          </div>
          <div style="background:rgba(255,255,255,0.08);border-radius:14px;padding:12px;text-align:center;">
            <div style="font-size:20px;font-weight:800;font-family:var(--font-display);color:#FFA502;">4.9 ★</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.6);margin-top:2px;">Rating</div>
          </div>
        </div>
      </div>

      <div class="screen-content" style="padding-bottom:100px;">
        <!-- Currently Serving Patient -->
        <div class="section mt-3">
          <div style="background:var(--surface);border-radius:20px;padding:20px;border:2px solid var(--primary);box-shadow:var(--shadow-md);">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">
              <span class="badge badge-primary">CURRENT PATIENT</span>
              <span style="font-family:monospace;font-weight:700;color:var(--primary);font-size:14px;">TOKEN TK-047</span>
            </div>
            <div style="display:flex;align-items:center;gap:14px;">
              <div style="width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,#4A90D9,#357abd);color:white;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:18px;">
                AP
              </div>
              <div style="flex:1;">
                <div style="font-family:var(--font-display);font-size:18px;font-weight:800;">Aarav Patel</div>
                <div style="font-size:13px;color:var(--text-secondary);">28 Yrs • Male • Blood Group B+</div>
              </div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:16px;">
              <button class="btn btn-primary btn-sm" onclick="viewPatientAISummary()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                AI Health Summary
              </button>
              <button class="btn btn-outline btn-sm" onclick="writePrescriptionModal()">
                ✍️ Write Prescription
              </button>
            </div>
          </div>
        </div>

        <!-- OPD Queue List -->
        <div class="section mt-4">
          <div class="section-header">
            <div class="section-title">OPD Live Queue</div>
            <span class="badge badge-secondary">${queue.length} Waiting</span>
          </div>

          <div style="display:flex;flex-direction:column;gap:12px;">
            ${queue.map(q => `
              <div class="card" style="padding:16px;display:flex;align-items:center;justify-content:space-between;" onclick="viewPatientAISummary()">
                <div style="display:flex;align-items:center;gap:12px;">
                  <div style="width:40px;height:40px;border-radius:12px;background:var(--surface-variant);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;font-family:monospace;color:var(--primary);">
                    ${q.token}
                  </div>
                  <div>
                    <div style="font-weight:700;font-size:15px;">${q.name} <span style="font-size:12px;color:var(--text-tertiary);font-weight:400;">(${q.age}y)</span></div>
                    <div style="font-size:12px;color:var(--text-secondary);">${q.condition}</div>
                  </div>
                </div>
                <div style="text-align:right;">
                  <span class="badge" style="background:${getTriageBg(q.triage)};color:${getTriageColor(q.triage)};">${q.triage.toUpperCase()}</span>
                  <div style="font-size:11px;color:var(--text-tertiary);margin-top:4px;">Wait: ${q.wait}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;

  function getTriageBg(t) {
    if (t === 'red') return 'rgba(231,76,60,0.15)';
    if (t === 'orange') return 'rgba(230,126,34,0.15)';
    if (t === 'yellow') return 'rgba(243,156,18,0.15)';
    return 'rgba(39,174,96,0.15)';
  }
  function getTriageColor(t) {
    if (t === 'red') return '#E74C3C';
    if (t === 'orange') return '#E67E22';
    if (t === 'yellow') return '#F39C12';
    return '#27AE60';
  }

  window.viewPatientAISummary = () => {
    showModal(`
      <div style="padding:20px;max-height:80vh;overflow-y:auto;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
          <div>
            <h3 style="font-family:var(--font-display);font-weight:800;font-size:18px;">AI Executive Medical Brief</h3>
            <div style="font-size:12px;color:var(--text-secondary);">${mockAISummary.name} • ${mockAISummary.age} yrs • Blood ${mockAISummary.bloodGroup}</div>
          </div>
          <span class="badge badge-success">Health Score ${mockAISummary.healthScore}/100</span>
        </div>

        <div style="background:rgba(231,76,60,0.1);border:1px solid rgba(231,76,60,0.3);border-radius:12px;padding:12px;margin-bottom:16px;">
          <div style="font-weight:700;color:#E74C3C;font-size:13px;margin-bottom:4px;">🚨 Critical Warnings</div>
          ${mockAISummary.criticalAlerts.map(a => `<div style="font-size:12px;color:var(--text-primary);margin-top:2px;">• ${a.message}</div>`).join('')}
        </div>

        <div style="margin-bottom:16px;">
          <div style="font-weight:700;font-size:14px;margin-bottom:6px;">Current Diagnosed Conditions</div>
          <div style="display:flex;flex-wrap:wrap;gap:6px;">
            ${mockAISummary.conditions.map(c => `<span class="badge badge-secondary">${c}</span>`).join('')}
          </div>
        </div>

        <div style="margin-bottom:16px;">
          <div style="font-weight:700;font-size:14px;margin-bottom:6px;">Active Medications</div>
          <div style="display:flex;flex-direction:column;gap:6px;">
            ${mockAISummary.currentMedications.map(m => `
              <div style="font-size:13px;background:var(--surface-variant);padding:8px 12px;border-radius:8px;display:flex;justify-content:space-between;">
                <strong>${m.name}</strong>
                <span style="color:var(--text-secondary);">${m.frequency}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <button class="btn btn-primary btn-full mt-2" onclick="closeModal()">Done Reviewing</button>
      </div>
    `);
  };

  window.writePrescriptionModal = () => {
    showModal(`
      <div style="padding:20px;">
        <h3 style="font-family:var(--font-display);font-weight:800;margin-bottom:16px;">Digital Rx Generator</h3>
        <div style="display:flex;flex-direction:column;gap:12px;">
          <div>
            <label class="input-label">Medication Name</label>
            <input type="text" class="input" placeholder="e.g. Paracetamol 650mg" id="rx-name" />
          </div>
          <div>
            <label class="input-label">Dosage & Frequency</label>
            <input type="text" class="input" placeholder="1 tablet twice daily after meals for 5 days" id="rx-dosage" />
          </div>
          <div>
            <label class="input-label">Doctor Notes / Instructions</label>
            <textarea class="input" style="height:70px;" placeholder="Drink plenty of water and rest..." id="rx-notes"></textarea>
          </div>
          <button class="btn btn-primary btn-full mt-2" onclick="showToast('Prescription sent to patient app & Pharmacy!', 'success');closeModal();">
            Sign & Issue Prescription
          </button>
        </div>
      </div>
    `);
  };

  window.signOut = () => {
    store.clearUser();
    navigate('login');
  };
}
