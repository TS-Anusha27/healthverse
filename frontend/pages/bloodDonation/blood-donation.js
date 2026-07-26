// HealthVerse — Blood & Organ Donation connected to Supabase DB
import { navigate, goBack } from '../../routes/router.js';
import { mockData } from '../../services/data.js';
import { showToast, showModal, closeModal } from '../../utils/utils.js';
import { getBloodDonors, getBloodBanks, registerBloodDonor, registerOrganDonor } from '../../services/supabase/db.js';
import { store } from '../../store/store.js';

export async function renderBloodDonation() {
  const donors = await getBloodDonors();
  const banks = await getBloodBanks();
  const app = document.getElementById('app');

  app.innerHTML = `
    <div class="screen" style="background:var(--bg);">
      <div class="page-header" style="background:linear-gradient(135deg,#E74C3C,#C62828);border-bottom:none;">
        <button class="back-btn" onclick="goBack()" style="background:rgba(255,255,255,0.15);border-color:rgba(255,255,255,0.2);">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div style="flex:1;">
          <div style="font-family:var(--font-display);font-size:17px;font-weight:700;color:white;">Blood Donation</div>
          <div style="font-size:12px;color:rgba(255,255,255,0.7);">Save a life today 🩸</div>
        </div>
      </div>

      <div class="screen-content" style="padding-bottom:100px;">
        <!-- Hero -->
        <div class="section mt-3">
          <div style="background:linear-gradient(135deg,#FFF0F1,#FFE0E3);border-radius:18px;padding:20px;text-align:center;">
            <div style="font-size:48px;margin-bottom:10px;">🩸</div>
            <h2 style="font-family:var(--font-display);font-size:20px;font-weight:800;color:#E74C3C;">Donate Blood, Save Lives</h2>
            <p style="font-size:13px;color:var(--text-secondary);margin-top:6px;line-height:1.5;">1 unit of blood can save up to 3 lives.<br>Your donation matters.</p>
            <button class="btn btn-emergency mt-4" onclick="registerDonorModal()">
              Register as Donor
            </button>
          </div>
        </div>

        <!-- Available Donors List -->
        <div class="section mt-4">
          <div class="section-header">
            <div class="section-title">Available Donors (${donors.length})</div>
            <span class="badge badge-success">Supabase Synced</span>
          </div>

          <div style="display:flex;flex-direction:column;gap:10px;">
            ${donors.map(d => `
              <div class="card card-sm flex items-center justify-between" style="padding:14px;">
                <div class="flex items-center gap-3">
                  <div style="width:40px;height:40px;border-radius:50%;background:#FFF0F1;color:#E74C3C;display:flex;align-items:center;justify-content:center;font-weight:800;font-family:var(--font-display);">
                    ${d.group_type || d.group || 'O+'}
                  </div>
                  <div>
                    <div style="font-size:14px;font-weight:700;">${d.name}</div>
                    <div style="font-size:12px;color:var(--text-secondary);">${d.distance || '1.0 km'} • Last: ${d.last_donated || d.lastDonated || 'Recent'}</div>
                  </div>
                </div>
                <button class="btn btn-outline btn-xs" style="border-color:#E74C3C;color:#E74C3C;" onclick="showToast('Calling donor ${d.phone}...','info')">
                  Call
                </button>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Switch to Organ Donation -->
        <div class="section mt-4">
          <button class="btn btn-outline btn-full" style="border-color:var(--accent);color:var(--accent);" onclick="renderOrganDonation()">
            View Organ Donation Registry
          </button>
        </div>
      </div>
    </div>
  `;

  initBloodHandlers();
}

export function renderOrganDonation() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="screen" style="background:var(--bg);">
      <div class="page-header" style="background:linear-gradient(135deg,#7B68EE,#5A48D8);border-bottom:none;">
        <button class="back-btn" onclick="renderBloodDonation()" style="background:rgba(255,255,255,0.15);border-color:rgba(255,255,255,0.2);">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div style="flex:1;">
          <div style="font-family:var(--font-display);font-size:17px;font-weight:700;color:white;">Organ Donation Registry</div>
          <div style="font-size:12px;color:rgba(255,255,255,0.75);">Gift of Life Registry</div>
        </div>
      </div>

      <div class="screen-content" style="padding:20px;padding-bottom:100px;">
        <div style="background:linear-gradient(135deg,#F0EEFF,#E6E0FF);border-radius:18px;padding:24px;text-align:center;">
          <div style="font-size:48px;margin-bottom:10px;">🫀</div>
          <h2 style="font-family:var(--font-display);font-size:20px;font-weight:800;color:var(--accent);">Become an Organ Donor</h2>
          <p style="font-size:13px;color:var(--text-secondary);margin-top:6px;line-height:1.5;">Pledge your organs and save up to 8 lives.<br>Secured by National Organ Registry & Supabase.</p>
          <button class="btn btn-primary mt-4" style="background:var(--accent);" onclick="registerOrganDonorModal()">
            Pledge Organs Now
          </button>
        </div>
      </div>
    </div>
  `;

  window.registerOrganDonorModal = () => {
    const content = `
      <div style="padding:16px;">
        <h3 class="text-h2 text-center" style="margin-bottom:8px;">Pledge Organ Donation</h3>
        <p class="text-caption text-center" style="margin-bottom:20px;">Saved into Supabase organ_donors table</p>
        <div class="form-group">
          <label class="form-label">Full Name</label>
          <input type="text" id="organ-name" class="form-input" value="${store.currentUser?.name || ''}" />
        </div>
        <div class="form-group mt-3">
          <label class="form-label">Phone Number</label>
          <input type="tel" id="organ-phone" class="form-input" value="${store.currentUser?.phone || ''}" />
        </div>
        <div class="form-group mt-3">
          <label class="form-label">Organs to Pledge</label>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:13px;" id="organ-checkboxes">
            <label><input type="checkbox" value="Kidneys" checked /> Kidneys</label>
            <label><input type="checkbox" value="Liver" checked /> Liver</label>
            <label><input type="checkbox" value="Heart" checked /> Heart</label>
            <label><input type="checkbox" value="Lungs" checked /> Lungs</label>
            <label><input type="checkbox" value="Corneas" checked /> Corneas</label>
            <label><input type="checkbox" value="Pancreas" checked /> Pancreas</label>
          </div>
        </div>
        <button class="btn btn-primary btn-full mt-4" style="background:var(--accent);" onclick="handleOrganSubmit()">
          Submit Pledge to Supabase
        </button>
      </div>
    `;
    showModal(content);

    window.handleOrganSubmit = async () => {
      const name = document.getElementById('organ-name').value.trim();
      const phone = document.getElementById('organ-phone').value.trim();
      const checkedBoxes = Array.from(document.querySelectorAll('#organ-checkboxes input:checked')).map(cb => cb.value);

      if (!name || !phone) { showToast('Please complete name and phone', 'error'); return; }

      await registerOrganDonor({
        user_id: store.currentUser?.id || null,
        name,
        phone,
        email: store.currentUser?.email || null,
        organs_pledged: checkedBoxes,
        status: 'registered'
      });

      showToast('🎉 Organ donor pledge saved to Supabase!', 'success', 5000);
      closeModal();
    };
  };
}

function initBloodHandlers() {
  window.registerDonorModal = () => {
    const content = `
      <div style="padding:16px;">
        <h3 class="text-h2 text-center" style="margin-bottom:8px;">Register as Blood Donor</h3>
        <p class="text-caption text-center" style="margin-bottom:20px;">Information saved to Supabase blood_donors table</p>
        <div class="form-group">
          <label class="form-label">Full Name</label>
          <input type="text" id="donor-name" class="form-input" value="${store.currentUser?.name || ''}" />
        </div>
        <div class="form-group mt-3">
          <label class="form-label">Blood Group</label>
          <select id="donor-group" class="form-input form-select">
            <option>A+</option><option>A-</option><option>B+</option><option>B-</option>
            <option>O+</option><option>O-</option><option>AB+</option><option>AB-</option>
          </select>
        </div>
        <div class="form-group mt-3">
          <label class="form-label">Phone Number</label>
          <input type="tel" id="donor-phone" class="form-input" value="${store.currentUser?.phone || ''}" />
        </div>
        <button class="btn btn-emergency btn-full mt-4" onclick="handleDonorSubmit()">
          Save Donor Profile to Supabase
        </button>
      </div>
    `;
    showModal(content);

    window.handleDonorSubmit = async () => {
      const name = document.getElementById('donor-name').value.trim();
      const group = document.getElementById('donor-group').value;
      const phone = document.getElementById('donor-phone').value.trim();

      if (!name || !phone) { showToast('Please enter name and phone number', 'error'); return; }

      await registerBloodDonor({
        user_id: store.currentUser?.id || null,
        name,
        group_type: group,
        phone,
        distance: '0.5 km',
        last_donated: 'Never',
        eligible: true
      });

      showToast('Blood donor registration saved to Supabase! 🩸', 'success', 5000);
      closeModal();
      renderBloodDonation();
    };
  };
}
