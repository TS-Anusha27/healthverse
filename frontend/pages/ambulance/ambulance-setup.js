// HealthVerse — Ambulance Driver Onboarding & Vehicle Verification
import { navigate } from '../../routes/router.js';
import { store } from '../../store/store.js';
import { showToast } from '../../utils/utils.js';

export function renderAmbulanceSetup() {
  const app = document.getElementById('app');
  const driver = store.driver || {};
  const user = store.currentUser || {};

  app.innerHTML = `
    <div class="screen" style="background:var(--bg);min-height:100dvh;">
      <!-- Header -->
      <div style="background:linear-gradient(135deg, #111827 0%, #1F2937 50%, #7F1D1D 100%);color:white;padding:calc(20px + var(--safe-top)) 20px 24px;">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div style="width:36px;height:36px;background:rgba(255,255,255,0.15);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;">
              🚑
            </div>
            <div>
              <div style="font-size:11px;color:rgba(255,255,255,0.7);font-weight:700;letter-spacing:0.5px;">EMERGENCY FLEET ONBOARDING</div>
              <h1 style="font-family:var(--font-display);font-size:20px;font-weight:800;margin:0;">Ambulance Verification</h1>
            </div>
          </div>
          <button class="btn btn-xs" style="background:rgba(255,255,255,0.15);color:white;border:1px solid rgba(255,255,255,0.25);" onclick="navigate('login')">
            Exit to Login
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="screen-content" style="padding:20px 20px 60px;max-width:560px;margin:0 auto;">
        <!-- Verification Info Card -->
        <div class="card p-3 mb-4" style="background:var(--emergency-light);border:1px solid rgba(255,71,87,0.3);border-radius:16px;">
          <div class="flex items-start gap-3">
            <span style="font-size:24px;">🚨</span>
            <div>
              <strong style="color:var(--text-primary);font-size:14px;display:block;">Emergency Vehicle & Commercial License Setup</strong>
              <p style="font-size:12px;color:var(--text-secondary);margin:2px 0 0;line-height:1.4;">
                Before receiving real-time SOS emergency alerts and activating GPS dispatch, register your emergency vehicle details and upload your commercial driving license.
              </p>
            </div>
          </div>
        </div>

        <!-- Setup Form -->
        <form id="amb-setup-form" onsubmit="event.preventDefault(); handleAmbulanceVerificationSubmit();">
          <!-- Driver Name -->
          <div class="form-group mb-3">
            <label class="form-label">Driver Full Name *</label>
            <div class="input-group">
              <span class="input-icon">👤</span>
              <input type="text" class="form-input" id="setup-amb-name" value="${driver.name || user.name || 'Ravi Kumar'}" required placeholder="e.g. Ravi Kumar" />
            </div>
          </div>

          <!-- Vehicle Name / Model -->
          <div class="form-group mb-3">
            <label class="form-label">Vehicle Name & Model *</label>
            <div class="input-group">
              <span class="input-icon">🚑</span>
              <input type="text" class="form-input" id="setup-amb-vehiclename" value="${driver.vehicleName || 'LifeLine Advanced Cardiac Life Support (ACLS)'}" required placeholder="e.g. Force Traveller ICU Ambulance" />
            </div>
            <!-- Quick Suggestion Chips -->
            <div class="flex gap-2 flex-wrap mt-2">
              <button type="button" class="btn btn-xs btn-outline" style="font-size:11px;" onclick="setVehicleChip('LifeLine Advanced Cardiac Life Support (ACLS)')">LifeLine ACLS</button>
              <button type="button" class="btn btn-xs btn-outline" style="font-size:11px;" onclick="setVehicleChip('Force Traveller ICU Critical Unit')">Force ICU</button>
              <button type="button" class="btn btn-xs btn-outline" style="font-size:11px;" onclick="setVehicleChip('Tata Winger Emergency Response')">Tata Winger</button>
            </div>
          </div>

          <!-- Vehicle Number -->
          <div class="form-group mb-3">
            <label class="form-label">Vehicle Registration Number *</label>
            <div class="input-group">
              <span class="input-icon">🔢</span>
              <input type="text" class="form-input" id="setup-amb-vehiclenum" value="${driver.vehicleNumber || 'TN 07 HV 2026'}" required placeholder="e.g. TN 07 HV 2026 or MH 01 AX 4892" style="font-weight:700;letter-spacing:1px;text-transform:uppercase;" />
            </div>
          </div>

          <!-- License Number -->
          <div class="form-group mb-3">
            <label class="form-label">Driving License / Commercial Permit Number *</label>
            <div class="input-group">
              <span class="input-icon">🪪</span>
              <input type="text" class="form-input" id="setup-amb-licensenum" value="${driver.licenseNumber || 'DL-TN-07-2018-00912'}" required placeholder="e.g. DL-TN-07-2018-00912" />
            </div>
          </div>

          <!-- Driving License Upload -->
          <div class="form-group mb-4">
            <label class="form-label">Upload Driving License / Commercial Permit *</label>
            <div class="amb-dropzone" id="license-dropzone" onclick="document.getElementById('license-file-input').click()">
              <input type="file" id="license-file-input" style="display:none;" accept=".pdf,.png,.jpg,.jpeg" onchange="handleLicenseFileChosen(this)" />
              <div class="dropzone-icon" id="license-icon">🪪</div>
              <div style="font-size:13px;font-weight:700;color:var(--text-primary);margin-top:6px;" id="license-title">
                ${driver.licenseName || 'Click or Drag & Drop Commercial Driving License'}
              </div>
              <div style="font-size:11px;color:var(--text-tertiary);margin-top:2px;" id="license-sub">
                Supported formats: PDF, PNG, JPG (Commercial Heavy / Emergency Badge)
              </div>
              <div class="amb-status-pill mt-2" id="license-status-pill">
                ✓ Ready for Validation
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <button type="submit" class="btn btn-emergency btn-full btn-lg" id="amb-submit-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            Validate License & Launch Ambulance Fleet Dashboard
          </button>
        </form>
      </div>
    </div>
  `;

  injectAmbulanceSetupStyles();
  initAmbulanceSetupHandlers();
}

function initAmbulanceSetupHandlers() {
  window.setVehicleChip = (name) => {
    const input = document.getElementById('setup-amb-vehiclename');
    if (input) input.value = name;
  };

  window.handleLicenseFileChosen = (input) => {
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const title = document.getElementById('license-title');
      const sub = document.getElementById('license-sub');
      const pill = document.getElementById('license-status-pill');
      const icon = document.getElementById('license-icon');

      if (title) title.innerText = file.name;
      if (sub) sub.innerText = `Size: ${(file.size / 1024).toFixed(1)} KB • Commercial Validity Verified`;
      if (icon) icon.innerText = '✅';
      if (pill) {
        pill.innerText = '✓ Driving License Validated';
        pill.style.background = '#2ED573';
      }
      showToast('Driving License file selected: ' + file.name, 'success');
    }
  };

  window.handleAmbulanceVerificationSubmit = () => {
    const name = document.getElementById('setup-amb-name')?.value.trim();
    const vehicleName = document.getElementById('setup-amb-vehiclename')?.value.trim();
    const vehicleNumber = document.getElementById('setup-amb-vehiclenum')?.value.trim();
    const licenseNumber = document.getElementById('setup-amb-licensenum')?.value.trim();
    const licenseTitle = document.getElementById('license-title')?.innerText || 'Commercial_Driving_License.pdf';

    if (!name || !vehicleName || !vehicleNumber || !licenseNumber) {
      showToast('Please fill in all ambulance and vehicle verification fields', 'error');
      return;
    }

    const btn = document.getElementById('amb-submit-btn');
    btn.innerHTML = `<span class="animate-spin" style="display:inline-block;width:18px;height:18px;border:2px solid white;border-top-color:transparent;border-radius:50%;margin-right:8px;"></span> Validating Emergency Fleet Vehicle...`;
    btn.disabled = true;

    setTimeout(() => {
      store.updateAmbulanceProfile({
        name,
        vehicleName,
        vehicleNumber,
        licenseNumber,
        licenseName: licenseTitle,
        isVerified: true
      });

      showToast('Vehicle & License Validated! Emergency Dispatch Ready 🚑', 'success', 4000);
      navigate('ambulance-home');
    }, 600);
  };
}

function injectAmbulanceSetupStyles() {
  if (document.getElementById('amb-setup-styles')) return;
  const s = document.createElement('style');
  s.id = 'amb-setup-styles';
  s.textContent = `
    .amb-dropzone {
      border: 2px dashed var(--emergency);
      background: var(--surface-dim);
      border-radius: 16px;
      padding: 20px;
      text-align: center;
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .amb-dropzone:hover {
      background: var(--emergency-light);
    }
    .dropzone-icon {
      font-size: 32px;
      display: inline-block;
    }
    .amb-status-pill {
      display: inline-block;
      background: var(--emergency);
      color: white;
      font-size: 11px;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 12px;
    }
  `;
  document.head.appendChild(s);
}
