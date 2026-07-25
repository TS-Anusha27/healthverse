// HealthVerse — Medicine Reminders
import { navigate, goBack } from '../router.js';
import { mockData } from '../data.js';
import { showToast, showModal, closeModal } from '../utils.js';

export function renderMedicines() {
  const app = document.getElementById('app');
  const medicines = mockData.medicines;

  app.innerHTML = `
    <div class="screen" style="background:var(--bg);">
      <div class="page-header">
        <button class="back-btn" onclick="goBack()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div class="page-title">Medicine Reminders</div>
        <button class="btn-icon-sm btn-ghost" onclick="addMedicineModal()" aria-label="Add Medicine">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
      </div>

      <div class="screen-content" style="padding:20px;padding-bottom:100px;">
        <!-- Today's Adherence -->
        <div class="card mb-4" style="background:linear-gradient(135deg,#FFF8EC,#FFF0D6);border:1px solid #FFE0B2;padding:18px;">
          <div class="flex items-center justify-between">
            <div>
              <div style="font-size:12px;font-weight:700;color:var(--warning);text-transform:uppercase;letter-spacing:0.5px;">Today's Adherence</div>
              <div style="font-family:var(--font-display);font-size:24px;font-weight:800;color:var(--text-primary);margin-top:2px;">50% Completed</div>
              <div style="font-size:12px;color:var(--text-secondary);margin-top:2px;">2 of 4 medicines taken today</div>
            </div>
            <div style="width:50px;height:50px;border-radius:50%;background:var(--warning);color:white;display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-weight:800;font-size:16px;">
              2/4
            </div>
          </div>
        </div>

        <!-- Medicine List -->
        <div class="section-title mb-3">Your Active Medications</div>
        <div style="display:flex;flex-direction:column;gap:12px;">
          ${medicines.map(med => `
            <div class="card" style="border-left:4px solid ${med.color};padding:16px;">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <div style="width:10px;height:10px;border-radius:50%;background:${med.color};"></div>
                  <div style="font-family:var(--font-display);font-size:16px;font-weight:700;color:var(--text-primary);">${med.name}</div>
                </div>
                <span class="badge badge-primary">${med.dosage}</span>
              </div>
              <div style="font-size:13px;color:var(--text-secondary);display:flex;flex-direction:column;gap:4px;">
                <div>⏰ Schedule: <strong>${med.time}</strong> (${med.frequency})</div>
                <div>🍽️ Timing: <strong>${med.meals}</strong></div>
                <div>📦 Refill: <span style="color:${med.refillDays <= 5 ? 'var(--emergency)' : 'var(--text-secondary)'};font-weight:600;">${med.refillDays} days remaining</span></div>
              </div>
              <div class="flex gap-2 mt-3">
                <button class="btn ${med.taken ? 'btn-ghost' : 'btn-secondary'} btn-xs flex-1" onclick="toggleMedState('${med.id}', this)">
                  ${med.taken ? '✓ Taken Today' : 'Mark as Taken'}
                </button>
                <button class="btn btn-ghost btn-xs" onclick="showToast('Refill request sent to local pharmacy!','success')">Refill</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  window.toggleMedState = (id, btn) => {
    const med = medicines.find(m => m.id === id);
    if (med) {
      med.taken = !med.taken;
      showToast(med.taken ? `Marked ${med.name} as taken!` : `Marked ${med.name} as pending`, med.taken ? 'success' : 'info');
      renderMedicines();
    }
  };

  window.addMedicineModal = () => {
    showModal(`
      <h3 style="font-family:var(--font-display);font-size:18px;font-weight:700;margin-bottom:16px;">Add New Reminder</h3>
      <div style="display:flex;flex-direction:column;gap:12px;">
        <div class="form-group"><label class="form-label">Medicine Name</label><input type="text" class="form-input" id="new-med-name" placeholder="e.g. Paracetamol" /></div>
        <div class="form-group"><label class="form-label">Dosage</label><input type="text" class="form-input" id="new-med-dose" placeholder="e.g. 500mg" /></div>
        <div class="form-group"><label class="form-label">Frequency</label><select class="form-input form-select"><option>Once daily</option><option>Twice daily</option><option>Thrice daily</option></select></div>
        <div class="form-group"><label class="form-label">Time</label><input type="time" class="form-input" value="09:00" /></div>
      </div>
      <button class="btn btn-primary btn-full mt-4" onclick="closeModal();showToast('New medicine reminder added!','success')">Save Reminder</button>
    `);
  };
}
