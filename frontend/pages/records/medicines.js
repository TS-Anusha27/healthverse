// HealthVerse — Medicine Reminders & Pharmacy Orders connected to Supabase DB
import { navigate, goBack } from '../../routes/router.js';
import { showToast, showModal, closeModal } from '../../utils/utils.js';
import { getMedicines, createMedicine, createMedicineOrder } from '../../services/supabase/db.js';
import { store } from '../../store/store.js';

let currentMeds = [];

export async function renderMedicines() {
  currentMeds = await getMedicines();
  const app = document.getElementById('app');
  const takenCount = currentMeds.filter(m => m.taken).length;
  const totalCount = currentMeds.length || 1;

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
              <div style="font-family:var(--font-display);font-size:24px;font-weight:800;color:var(--text-primary);margin-top:2px;">${Math.round((takenCount/totalCount)*100)}% Completed</div>
              <div style="font-size:12px;color:var(--text-secondary);margin-top:2px;">${takenCount} of ${totalCount} medicines taken today</div>
            </div>
            <div style="width:50px;height:50px;border-radius:50%;background:var(--warning);color:white;display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-weight:800;font-size:16px;">
              ${takenCount}/${totalCount}
            </div>
          </div>
        </div>

        <!-- Medicine List -->
        <div class="section-title mb-3">Your Active Medications (Supabase Synced)</div>
        <div style="display:flex;flex-direction:column;gap:12px;">
          ${currentMeds.map(med => `
            <div class="card" style="border-left:4px solid ${med.color || '#4A90D9'};padding:16px;">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <div style="width:10px;height:10px;border-radius:50%;background:${med.color || '#4A90D9'};"></div>
                  <div style="font-family:var(--font-display);font-size:16px;font-weight:700;color:var(--text-primary);">${med.name}</div>
                </div>
                <span class="badge badge-primary">${med.dosage || '5mg'}</span>
              </div>
              <div style="font-size:13px;color:var(--text-secondary);display:flex;flex-direction:column;gap:4px;">
                <div>⏰ Schedule: <strong>${med.time || '8:00 AM'}</strong> (${med.frequency || 'Once daily'})</div>
                <div>🍽️ Timing: <strong>${med.meals || 'After meals'}</strong></div>
                <div>📦 Refill: <span style="color:${(med.refill_days || med.refillDays) <= 5 ? 'var(--emergency)' : 'var(--text-secondary)'};font-weight:600;">${med.refill_days || med.refillDays || 10} days remaining</span></div>
              </div>
              <div class="flex gap-2 mt-3">
                <button class="btn ${med.taken ? 'btn-ghost' : 'btn-secondary'} btn-xs flex-1" onclick="toggleMedState('${med.id}', this)">
                  ${med.taken ? '✓ Taken Today' : 'Mark as Taken'}
                </button>
                <button class="btn btn-ghost btn-xs" onclick="orderRefillModal('${med.name}')">Refill</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  initMedicineHandlers();
}

function initMedicineHandlers() {
  window.toggleMedState = (id, btn) => {
    const med = currentMeds.find(m => m.id === id);
    if (med) {
      med.taken = !med.taken;
      btn.innerHTML = med.taken ? '✓ Taken Today' : 'Mark as Taken';
      btn.className = `btn ${med.taken ? 'btn-ghost' : 'btn-secondary'} btn-xs flex-1`;
      showToast(med.taken ? 'Marked as taken for today!' : 'Marked as pending', 'info');
    }
  };

  window.addMedicineModal = () => {
    const content = `
      <div style="padding:16px;">
        <h3 class="text-h2 text-center" style="margin-bottom:8px;">Add New Medicine</h3>
        <p class="text-caption text-center" style="margin-bottom:20px;">Saves to Supabase medicines table</p>
        <div class="form-group">
          <label class="form-label">Medicine Name</label>
          <input type="text" id="med-name" class="form-input" placeholder="e.g. Paracetamol" />
        </div>
        <div class="grid-2 mt-3">
          <div class="form-group">
            <label class="form-label">Dosage</label>
            <input type="text" id="med-dosage" class="form-input" placeholder="500mg" />
          </div>
          <div class="form-group">
            <label class="form-label">Time</label>
            <input type="text" id="med-time" class="form-input" placeholder="8:00 AM" />
          </div>
        </div>
        <div class="form-group mt-3">
          <label class="form-label">Frequency</label>
          <input type="text" id="med-freq" class="form-input" placeholder="Once daily" />
        </div>
        <button class="btn btn-primary btn-full mt-4" onclick="handleAddMedSubmit()">
          Add Medicine to Supabase
        </button>
      </div>
    `;
    showModal(content);

    window.handleAddMedSubmit = async () => {
      const name = document.getElementById('med-name').value.trim();
      const dosage = document.getElementById('med-dosage').value.trim();
      const time = document.getElementById('med-time').value.trim();
      const frequency = document.getElementById('med-freq').value.trim();

      if (!name) { showToast('Please enter medicine name', 'error'); return; }

      const newMed = {
        patient_id: store.currentUser?.id || null,
        name,
        dosage: dosage || '500mg',
        time: time || '8:00 AM',
        frequency: frequency || 'Once daily',
        meals: 'After meals',
        refill_days: 30,
        taken: false,
        color: '#4A90D9'
      };

      await createMedicine(newMed);
      showToast('Medicine added to Supabase database! 💊', 'success');
      closeModal();
      renderMedicines();
    };
  };

  window.orderRefillModal = (medName) => {
    showModal(`
      <div style="padding:16px;">
        <h3 class="text-h2 text-center" style="margin-bottom:8px;">Order Pharmacy Refill</h3>
        <p class="text-caption text-center" style="margin-bottom:20px;">Saved to Supabase medicine_orders table</p>
        <div class="card card-sm mb-3" style="background:var(--surface-dim);padding:12px;">
          <div style="font-size:14px;font-weight:700;">Refill: ${medName}</div>
          <div style="font-size:12px;color:var(--text-secondary);margin-top:2px;">30 days supply • ₹249</div>
        </div>
        <div class="form-group">
          <label class="form-label">Delivery Address</label>
          <textarea id="refill-address" class="form-input" rows="2">45, Velachery Main Road, Chennai</textarea>
        </div>
        <button class="btn btn-primary btn-full mt-4" onclick="handleRefillOrder('${medName}')">
          Place Refill Order (₹249)
        </button>
      </div>
    `);

    window.handleRefillOrder = async (name) => {
      const addr = document.getElementById('refill-address').value.trim();
      await createMedicineOrder({
        patient_id: store.currentUser?.id || null,
        items: [{ medicine: name, days: 30, price: 249 }],
        total_amount: 249,
        delivery_address: addr,
        status: 'processing'
      });

      showToast('Refill order placed & saved to Supabase! 📦', 'success', 5000);
      closeModal();
    };
  };
}
