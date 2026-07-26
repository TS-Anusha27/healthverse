// HealthVerse â€” Digital Prescription with AI Drug Conflict Warnings
import { navigate, goBack } from '../../routes/router.js';
import { mockAISummary } from '../../services/data.js';
import { showToast } from '../../utils/utils.js';

let selectedMeds = [];

export function renderDoctorPrescription() {
  const app = document.getElementById('app');
  selectedMeds = [];

  app.innerHTML = `
    <div class="screen" style="background:var(--bg);">
      <div class="page-header">
        <button class="back-btn" onclick="goBack()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div class="page-title">Digital Prescription</div>
      </div>

      <div class="screen-content" style="padding:20px;padding-bottom:120px;">
        <!-- Patient Header -->
        <div class="card mb-4" style="background:var(--primary-light);border-color:var(--primary);padding:14px;">
          <div style="font-size:12px;font-weight:700;color:var(--primary);letter-spacing:0.5px;">PATIENT</div>
          <div style="font-family:var(--font-display);font-size:16px;font-weight:700;color:var(--text-primary);margin-top:2px;">Aarav Patel (28y, M)</div>
          <div style="font-size:12px;color:var(--emergency);font-weight:600;margin-top:4px;">âš ï¸ Known Allergy: Penicillin, Sulfa drugs</div>
        </div>

        <!-- Add Medicines -->
        <div class="card mb-4" style="padding:18px;">
          <div style="font-family:var(--font-display);font-size:15px;font-weight:700;margin-bottom:14px;">Select Medicines</div>

          <div style="display:flex;flex-direction:column;gap:10px;">
            ${[
              { name: 'Amoxicillin 500mg', type: 'Antibiotic (Penicillin class)', isAllergic: true },
              { name: 'Telmisartan 40mg', type: 'Antihypertensive', isAllergic: false },
              { name: 'Metformin 500mg', type: 'Antidiabetic', isAllergic: false },
              { name: 'Ibuprofen 400mg', type: 'NSAID (Kidney/GI caution)', isWarning: true }
            ].map(m => `
              <div style="display:flex;align-items:center;justify-content:space-between;padding:12px;background:var(--surface-dim);border-radius:12px;">
                <div>
                  <div style="font-size:14px;font-weight:600;">${m.name}</div>
                  <div style="font-size:11px;color:${m.isAllergic ? 'var(--emergency)' : m.isWarning ? 'var(--warning)' : 'var(--text-secondary)'};">${m.type}</div>
                </div>
                <button class="btn btn-outline btn-xs" onclick="addMedToScript('${m.name}', ${m.isAllergic}, ${m.isWarning || false})">
                  + Add
                </button>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Active Prescribed List & AI Warnings Container -->
        <div class="card mb-4" style="padding:18px;">
          <div style="font-family:var(--font-display);font-size:15px;font-weight:700;margin-bottom:12px;">Prescription Cart</div>
          <div id="rx-list" style="display:flex;flex-direction:column;gap:8px;">
            <div style="font-size:13px;color:var(--text-tertiary);text-align:center;padding:20px;">No medicines added yet</div>
          </div>

          <!-- AI Warning Box -->
          <div id="ai-rx-warning" style="display:none;margin-top:16px;padding:14px;background:#FFF0F1;border:1.5px solid var(--emergency);border-radius:12px;"></div>
        </div>

        <button class="btn btn-primary btn-full btn-lg" onclick="signAndSendRx()">
          Confirm & Send Digital Prescription
        </button>
      </div>
    </div>
  `;

  window.addMedToScript = (name, isAllergic, isWarning) => {
    selectedMeds.push({ name, isAllergic, isWarning });
    updateRxList();
  };

  function updateRxList() {
    const listEl = document.getElementById('rx-list');
    const warnEl = document.getElementById('ai-rx-warning');

    if (!listEl) return;

    listEl.innerHTML = selectedMeds.map((m, i) => `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:10px;background:var(--surface-dim);border-radius:10px;font-size:13px;">
        <span style="font-weight:600;">${m.name}</span>
        <button style="border:none;background:none;color:var(--emergency);cursor:pointer;font-weight:700;" onclick="removeMed(${i})">âœ•</button>
      </div>
    `).join('');

    const hasAllergy = selectedMeds.some(m => m.isAllergic);

    if (hasAllergy && warnEl) {
      warnEl.style.display = 'block';
      warnEl.innerHTML = `
        <div style="font-family:var(--font-display);font-size:13px;font-weight:800;color:var(--emergency);">
          ðŸ¤– AI SAFETY WARNING DETECTED!
        </div>
        <div style="font-size:12px;color:var(--text-primary);margin-top:4px;">
          Patient has documented <strong>PENICILLIN ALLERGY</strong>. Amoxicillin is contraindicated and may cause anaphylaxis.
        </div>
      `;
      showToast('âš ï¸ AI Warning: Allergy conflict detected!', 'error', 5000);
    } else if (warnEl) {
      warnEl.style.display = 'none';
    }
  }

  window.removeMed = (idx) => {
    selectedMeds.splice(idx, 1);
    updateRxList();
  };

  window.signAndSendRx = () => {
    if (selectedMeds.some(m => m.isAllergic)) {
      showToast('Cannot issue prescription with severe allergy conflict! Remove Amoxicillin first.', 'error', 5000);
      return;
    }
    showToast('Prescription digitally signed & sent to patient!', 'success', 5000);
    setTimeout(() => navigate('doctor-home'), 1500);
  };
}
