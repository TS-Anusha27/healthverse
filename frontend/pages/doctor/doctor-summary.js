// HealthVerse â€” Doctor's AI Patient Summary View
import { navigate, goBack } from '../../routes/router.js';
import { mockAISummary } from '../../services/data.js';
import { showToast, showModal } from '../../utils/utils.js';

export function renderDoctorSummary() {
  const p = mockAISummary;
  const app = document.getElementById('app');

  app.innerHTML = `
    <div class="screen" style="background:var(--bg);">
      <!-- Top Header -->
      <div class="page-header" style="background:linear-gradient(135deg,#1E3A5F,#2E74C0);color:white;border-bottom:none;">
        <button class="back-btn" onclick="goBack()" style="background:rgba(255,255,255,0.15);border-color:rgba(255,255,255,0.2);">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div style="flex:1;">
          <div style="font-family:var(--font-display);font-size:17px;font-weight:700;color:white;">AI Medical Summary</div>
          <div style="font-size:12px;color:rgba(255,255,255,0.75);">${p.name} â€¢ ${p.age} yrs (${p.gender}) â€¢ ${p.bloodGroup}</div>
        </div>
        <button class="btn btn-ghost btn-xs" onclick="viewOriginalReport()" style="background:rgba(255,255,255,0.15);color:white;border:none;">
          View Reports
        </button>
      </div>

      <div class="screen-content" style="padding:20px;padding-bottom:100px;">
        <!-- High Risk & Allergy Alert Box -->
        <div class="card mb-4" style="background:#FFF0F1;border:1.5px solid var(--emergency);padding:16px;">
          <div style="font-family:var(--font-display);font-size:14px;font-weight:800;color:var(--emergency);margin-bottom:10px;display:flex;align-items:center;gap:6px;">
            ðŸš¨ HIGH RISK ALERTS & ALLERGIES
          </div>
          <div style="display:flex;flex-direction:column;gap:8px;">
            ${p.criticalAlerts.map(a => `
              <div style="background:white;padding:10px 12px;border-radius:10px;font-size:12px;font-weight:700;color:var(--emergency);border-left:3px solid var(--emergency);">
                âš ï¸ ${a.message}
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Major Diseases & Conditions -->
        <div class="card mb-4" style="padding:18px;">
          <div style="font-family:var(--font-display);font-size:15px;font-weight:700;margin-bottom:10px;">Diagnosed Conditions</div>
          <div style="display:flex;flex-wrap:wrap;gap:8px;">
            ${p.conditions.map(c => `<span class="chip active" style="background:var(--warning-light);border-color:var(--warning);color:var(--warning);">${c}</span>`).join('')}
          </div>
        </div>

        <!-- Current Medications -->
        <div class="card mb-4" style="padding:18px;">
          <div style="font-family:var(--font-display);font-size:15px;font-weight:700;margin-bottom:12px;">Active Medications</div>
          <div style="display:flex;flex-direction:column;gap:8px;">
            ${p.currentMedications.map(m => `
              <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:var(--surface-dim);border-radius:10px;font-size:13px;">
                <span style="font-weight:600;color:var(--text-primary);">${m.name}</span>
                <span style="color:var(--text-secondary);">${m.frequency} (since ${m.since})</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Treatment Timeline -->
        <div class="card mb-4" style="padding:18px;">
          <div style="font-family:var(--font-display);font-size:15px;font-weight:700;margin-bottom:12px;">Treatment Timeline</div>
          <div style="display:flex;flex-direction:column;gap:10px;">
            ${p.timeline.map(t => `
              <div style="display:flex;align-items:center;gap:12px;font-size:13px;">
                <span style="font-size:11px;font-weight:700;color:var(--primary);min-width:60px;">${t.date}</span>
                <span style="flex:1;color:var(--text-primary);">${t.event}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Action Button -->
        <button class="btn btn-primary btn-full btn-lg" onclick="navigate('doctor-prescription')">
          âœï¸ Create Digital Prescription
        </button>
      </div>
    </div>
  `;

  window.viewOriginalReport = () => {
    showModal(`
      <h3 style="font-family:var(--font-display);font-size:18px;font-weight:700;margin-bottom:12px;">Original Uploaded Reports</h3>
      <div style="display:flex;flex-direction:column;gap:10px;">
        ${['Blood_Report_CBC_Jul2026.pdf', 'ECG_Report_Fortis.pdf', 'Chest_XRay_MIOT.pdf'].map(f => `
          <div style="display:flex;align-items:center;justify-content:space-between;padding:12px;background:var(--surface-dim);border-radius:12px;">
            <span style="font-size:13px;font-weight:600;">ðŸ“„ ${f}</span>
            <button class="btn btn-ghost btn-xs" onclick="showToast('Opening ${f}...','info')">View</button>
          </div>
        `).join('')}
      </div>
    `);
  };
}
