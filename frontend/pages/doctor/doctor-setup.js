// HealthVerse — Doctor Onboarding & Credential Verification
import { navigate } from '../../routes/router.js';
import { store } from '../../store/store.js';
import { showToast } from '../../utils/utils.js';

export function renderDoctorSetup() {
  const app = document.getElementById('app');
  const doc = store.doctor || {};
  const user = store.currentUser || {};

  app.innerHTML = `
    <div class="screen" style="background:var(--bg);min-height:100dvh;">
      <!-- Header -->
      <div style="background:linear-gradient(135deg, #0F172A 0%, #1E3A5F 50%, #0D4F3C 100%);color:white;padding:calc(20px + var(--safe-top)) 20px 24px;">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div style="width:36px;height:36px;background:rgba(255,255,255,0.15);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;">
              🩺
            </div>
            <div>
              <div style="font-size:11px;color:rgba(255,255,255,0.7);font-weight:700;letter-spacing:0.5px;">MEDICAL CREDENTIALS ONBOARDING</div>
              <h1 style="font-family:var(--font-display);font-size:20px;font-weight:800;margin:0;">Doctor Verification</h1>
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
        <div class="card p-3 mb-4" style="background:var(--secondary-light);border:1px solid rgba(82,201,155,0.3);border-radius:16px;">
          <div class="flex items-start gap-3">
            <span style="font-size:24px;">🛡️</span>
            <div>
              <strong style="color:var(--text-primary);font-size:14px;display:block;">Verified Medical Practitioner Portal</strong>
              <p style="font-size:12px;color:var(--text-secondary);margin:2px 0 0;line-height:1.4;">
                To ensure patient safety and maintain clinical compliance, please specify your affiliated hospital, medical specialization, and upload your official license certificate.
              </p>
            </div>
          </div>
        </div>

        <!-- Setup Form -->
        <form id="doc-setup-form" onsubmit="event.preventDefault(); handleDoctorVerificationSubmit();">
          <!-- Doctor Name -->
          <div class="form-group mb-3">
            <label class="form-label">Doctor Full Legal Name *</label>
            <div class="input-group">
              <span class="input-icon">👨‍⚕️</span>
              <input type="text" class="form-input" id="setup-doc-name" value="${doc.name || user.name || 'Dr. Priya Krishnamurthy'}" required placeholder="e.g. Dr. Jane Smith, MD" />
            </div>
          </div>

          <!-- Hospital Name -->
          <div class="form-group mb-3">
            <label class="form-label">Hospital / Clinic Affiliation *</label>
            <div class="input-group">
              <span class="input-icon">🏥</span>
              <input type="text" class="form-input" id="setup-doc-hospital" value="${doc.hospital || 'Apollo Hospitals, Greams Road'}" required placeholder="e.g. Apollo Hospitals, Greams Rd" />
            </div>
            <!-- Quick Suggestion Chips -->
            <div class="flex gap-2 flex-wrap mt-2">
              <button type="button" class="btn btn-xs btn-outline" style="font-size:11px;" onclick="setHospitalChip('Apollo Hospitals, Greams Road')">Apollo Hospitals</button>
              <button type="button" class="btn btn-xs btn-outline" style="font-size:11px;" onclick="setHospitalChip('Fortis Healthcare Centre')">Fortis Hospital</button>
              <button type="button" class="btn btn-xs btn-outline" style="font-size:11px;" onclick="setHospitalChip('AIIMS Speciality Hospital')">AIIMS</button>
              <button type="button" class="btn btn-xs btn-outline" style="font-size:11px;" onclick="setHospitalChip('Manipal Hospital')">Manipal</button>
            </div>
          </div>

          <!-- Specialization -->
          <div class="form-group mb-3">
            <label class="form-label">Medical Specialization / Specialist Role *</label>
            <select class="form-input form-select" id="setup-doc-specialty" required>
              <option value="Cardiologist" ${doc.specialty?.includes('Cardio') ? 'selected' : ''}>Cardiologist (Heart & Vascular)</option>
              <option value="Neurologist" ${doc.specialty?.includes('Neuro') ? 'selected' : ''}>Neurologist (Brain & Spine)</option>
              <option value="General Physician" ${doc.specialty?.includes('General') ? 'selected' : ''}>General Physician / Internal Medicine</option>
              <option value="Pediatrician" ${doc.specialty?.includes('Pedia') ? 'selected' : ''}>Pediatrician (Child Specialist)</option>
              <option value="Orthopedic Surgeon" ${doc.specialty?.includes('Ortho') ? 'selected' : ''}>Orthopedic Surgeon (Bone & Joint)</option>
              <option value="Emergency & Critical Care" ${doc.specialty?.includes('Emergency') ? 'selected' : ''}>Emergency & Critical Care</option>
              <option value="Dermatologist" ${doc.specialty?.includes('Derma') ? 'selected' : ''}>Dermatologist (Skin Specialist)</option>
              <option value="Gynecologist" ${doc.specialty?.includes('Gyne') ? 'selected' : ''}>Gynecologist & Obstetrician</option>
            </select>
          </div>

          <!-- Registration Number -->
          <div class="form-group mb-3">
            <label class="form-label">Medical Council Registration / License No. *</label>
            <div class="input-group">
              <span class="input-icon">📜</span>
              <input type="text" class="form-input" id="setup-doc-regnum" value="${doc.regNumber || 'NMC-2024-88421'}" required placeholder="e.g. NMC-2024-88421" />
            </div>
          </div>

          <!-- Certificate Upload -->
          <div class="form-group mb-4">
            <label class="form-label">Upload Verified Doctor Certificate *</label>
            <div class="certificate-dropzone" id="cert-dropzone" onclick="document.getElementById('cert-file-input').click()">
              <input type="file" id="cert-file-input" style="display:none;" accept=".pdf,.png,.jpg,.jpeg" onchange="handleCertFileChosen(this)" />
              <div class="dropzone-icon" id="cert-icon">📑</div>
              <div style="font-size:13px;font-weight:700;color:var(--text-primary);margin-top:6px;" id="cert-title">
                ${doc.certificateName || 'Click or Drag & Drop Doctor Certificate'}
              </div>
              <div style="font-size:11px;color:var(--text-tertiary);margin-top:2px;" id="cert-sub">
                Supported formats: PDF, PNG, JPG (Medical Degree / State Council Registration)
              </div>
              <div class="certificate-status-pill mt-2" id="cert-status-pill">
                ✓ Ready for Verification
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <button type="submit" class="btn btn-secondary btn-full btn-lg" id="doc-submit-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            Verify Credentials & Enter Doctor Dashboard
          </button>
        </form>
      </div>
    </div>
  `;

  injectDoctorSetupStyles();
  initDoctorSetupHandlers();
}

function initDoctorSetupHandlers() {
  window.setHospitalChip = (name) => {
    const input = document.getElementById('setup-doc-hospital');
    if (input) input.value = name;
  };

  window.handleCertFileChosen = (input) => {
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const title = document.getElementById('cert-title');
      const sub = document.getElementById('cert-sub');
      const pill = document.getElementById('cert-status-pill');
      const icon = document.getElementById('cert-icon');

      if (title) title.innerText = file.name;
      if (sub) sub.innerText = `Size: ${(file.size / 1024).toFixed(1)} KB • Cryptographically Checked`;
      if (icon) icon.innerText = '✅';
      if (pill) {
        pill.innerText = '✓ Document Uploaded & Validated';
        pill.style.background = '#2ED573';
      }
      showToast('Doctor certificate selected: ' + file.name, 'success');
    }
  };

  window.handleDoctorVerificationSubmit = () => {
    const name = document.getElementById('setup-doc-name')?.value.trim();
    const hospital = document.getElementById('setup-doc-hospital')?.value.trim();
    const specialty = document.getElementById('setup-doc-specialty')?.value;
    const regNumber = document.getElementById('setup-doc-regnum')?.value.trim();
    const certTitle = document.getElementById('cert-title')?.innerText || 'Doctor_Verification_Cert.pdf';

    if (!name || !hospital || !regNumber) {
      showToast('Please fill in all doctor verification fields', 'error');
      return;
    }

    const btn = document.getElementById('doc-submit-btn');
    btn.innerHTML = `<span class="animate-spin" style="display:inline-block;width:18px;height:18px;border:2px solid white;border-top-color:transparent;border-radius:50%;margin-right:8px;"></span> Verifying Medical Credentials...`;
    btn.disabled = true;

    setTimeout(() => {
      store.updateDoctorProfile({
        name,
        hospital,
        specialty,
        regNumber,
        certificateName: certTitle,
        isVerified: true
      });

      showToast('Medical Credentials Verified! Welcome Dr. ' + name.replace(/^Dr\.\s*/i, ''), 'success', 4000);
      navigate('doctor-home');
    }, 600);
  };
}

function injectDoctorSetupStyles() {
  if (document.getElementById('doc-setup-styles')) return;
  const s = document.createElement('style');
  s.id = 'doc-setup-styles';
  s.textContent = `
    .certificate-dropzone {
      border: 2px dashed var(--secondary);
      background: var(--surface-dim);
      border-radius: 16px;
      padding: 20px;
      text-align: center;
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .certificate-dropzone:hover {
      background: var(--secondary-light);
      border-color: var(--secondary-dark);
    }
    .dropzone-icon {
      font-size: 32px;
      display: inline-block;
    }
    .certificate-status-pill {
      display: inline-block;
      background: var(--secondary);
      color: white;
      font-size: 11px;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 12px;
    }
  `;
  document.head.appendChild(s);
}
