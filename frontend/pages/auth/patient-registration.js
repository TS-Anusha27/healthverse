// HealthVerse â€” Patient Registration (Multi-Step Form)
import { navigate } from '../../routes/router.js';
import { store } from '../../store/store.js';
import { showToast } from '../../utils/utils.js';

const STEPS = [
  { title: 'Personal Info', subtitle: 'Tell us about yourself' },
  { title: 'Body & Health', subtitle: 'Your physical details' },
  { title: 'Medical History', subtitle: 'Help doctors understand you better' },
  { title: 'Emergency & Insurance', subtitle: 'For your safety' },
];

let currentStep = 0;
const formData = {};

export function renderPatientRegistration() {
  // Check if already registered
  const saved = localStorage.getItem('hv_patient_profile');
  if (saved) {
    store.patient = JSON.parse(saved);
    navigate('patient-home');
    return;
  }

  currentStep = 0;
  renderStep();
}

function renderStep() {
  const app = document.getElementById('app');
  const step = STEPS[currentStep];
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  app.innerHTML = `
    <div class="screen" style="background:var(--bg);min-height:100dvh;">
      <!-- Header -->
      <div style="padding:20px 20px 0;background:var(--surface);">
        <div class="flex items-center justify-between mb-4">
          ${currentStep > 0
            ? `<button class="back-btn" onclick="prevStep()">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
               </button>`
            : `<div style="width:38px;"></div>`
          }
          <div style="text-align:center;flex:1;">
            <div style="font-size:12px;font-weight:600;color:var(--text-tertiary);letter-spacing:0.5px;">STEP ${currentStep + 1} OF ${STEPS.length}</div>
            <div style="font-family:var(--font-display);font-size:18px;font-weight:700;color:var(--text-primary);margin-top:2px;">${step.title}</div>
            <div style="font-size:13px;color:var(--text-secondary);">${step.subtitle}</div>
          </div>
          <div style="width:38px;"></div>
        </div>
        <div class="progress-bar mb-4">
          <div class="progress-fill" style="width:${progress}%;"></div>
        </div>
        <div class="step-indicator" style="justify-content:center;gap:8px;padding-bottom:16px;">
          ${STEPS.map((_, i) => `<div class="step-dot ${i < currentStep ? 'done' : i === currentStep ? 'active' : ''}"></div>`).join('')}
        </div>
      </div>

      <!-- Form Content -->
      <div class="screen-content" style="padding:20px;padding-bottom:120px;">
        ${getStepContent()}
      </div>

      <!-- Bottom Action -->
      <div style="position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:430px;padding:16px 20px calc(16px + var(--safe-bottom));background:var(--surface);border-top:1px solid var(--border-light);box-shadow:0 -4px 20px rgba(26,35,50,0.08);">
        <button class="btn btn-primary btn-full btn-lg" id="step-next-btn" onclick="nextStep()">
          ${currentStep === STEPS.length - 1 ? 'Complete Setup' : 'Continue'}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
        ${currentStep === 0 ? `<div style="text-align:center;margin-top:12px;font-size:13px;color:var(--text-tertiary);">Already have a profile? <span style="color:var(--primary);font-weight:600;cursor:pointer;" onclick="skipSetup()">Skip Setup</span></div>` : ''}
      </div>
    </div>
  `;

  // Initialize dropdowns/pickers
  initStepHandlers();
}

function getStepContent() {
  if (currentStep === 0) return `
    <div class="card mb-4">
      <h3 class="text-h4 mb-4">Basic Information</h3>
      <div style="display:flex;flex-direction:column;gap:16px;">
        <div class="form-group">
          <label class="form-label">Full Name *</label>
          <input type="text" class="form-input" id="f-name" value="${store.currentUser?.name || ''}" placeholder="Your full name" />
        </div>
        <div class="grid-2">
          <div class="form-group">
            <label class="form-label">Gender *</label>
            <select class="form-input form-select" id="f-gender">
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer_not">Prefer not to say</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Date of Birth *</label>
            <input type="date" class="form-input" id="f-dob" max="${new Date().toISOString().split('T')[0]}" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Blood Group *</label>
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;" id="blood-group-grid">
            ${['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(bg => `
              <button class="blood-chip" data-group="${bg}" onclick="selectBloodGroup('${bg}')">${bg}</button>
            `).join('')}
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">ABHA ID (Optional)</label>
          <input type="text" class="form-input" id="f-abha" placeholder="XX-XXXX-XXXX-XXXX" />
        </div>
      </div>
    </div>
  `;

  if (currentStep === 1) return `
    <div class="card mb-4">
      <h3 class="text-h4 mb-4">Physical Details</h3>
      <div style="display:flex;flex-direction:column;gap:16px;">
        <div class="grid-2">
          <div class="form-group">
            <label class="form-label">Height</label>
            <div class="input-group">
              <input type="number" class="form-input" id="f-height" placeholder="170" style="padding-right:44px;" />
              <span class="input-suffix" style="pointer-events:none;font-size:12px;font-weight:600;">cm</span>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Weight</label>
            <div class="input-group">
              <input type="number" class="form-input" id="f-weight" placeholder="70" style="padding-right:44px;" />
              <span class="input-suffix" style="pointer-events:none;font-size:12px;font-weight:600;">kg</span>
            </div>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Known Allergies</label>
          <input type="text" class="form-input" id="f-allergies" placeholder="e.g. Penicillin, Sulfa drugs, Peanuts" />
        </div>
        <div class="form-group">
          <label class="form-label">Current Medications</label>
          <textarea class="form-input" id="f-medications" rows="3" placeholder="List any medicines you're currently taking..." style="resize:none;"></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Chronic Diseases</label>
          <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:4px;" id="disease-chips">
            ${['Diabetes','Hypertension','Asthma','Heart Disease','Thyroid','Arthritis','COPD','None'].map(d =>
              `<div class="chip" onclick="toggleDisease(this,'${d}')">${d}</div>`
            ).join('')}
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Lifestyle</label>
          <div class="grid-2" style="gap:12px;">
            <div style="background:var(--surface-dim);border-radius:12px;padding:14px;">
              <div style="font-size:13px;font-weight:600;color:var(--text-secondary);margin-bottom:10px;">Smoking</div>
              <div style="display:flex;flex-direction:column;gap:6px;" id="smoking-opts">
                ${['Never','Former','Current'].map((o,i) =>
                  `<label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px;">
                    <input type="radio" name="smoking" value="${o.toLowerCase()}" ${i===0?'checked':''} />
                    ${o}
                  </label>`
                ).join('')}
              </div>
            </div>
            <div style="background:var(--surface-dim);border-radius:12px;padding:14px;">
              <div style="font-size:13px;font-weight:600;color:var(--text-secondary);margin-bottom:10px;">Alcohol</div>
              <div style="display:flex;flex-direction:column;gap:6px;">
                ${['Never','Occasional','Regular'].map((o,i) =>
                  `<label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px;">
                    <input type="radio" name="alcohol" value="${o.toLowerCase()}" ${i===0?'checked':''} />
                    ${o}
                  </label>`
                ).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  if (currentStep === 2) return `
    <div class="card mb-4">
      <h3 class="text-h4 mb-4">Medical History</h3>
      <div style="display:flex;flex-direction:column;gap:16px;">
        <div class="form-group">
          <label class="form-label">Past Surgeries</label>
          <textarea class="form-input" id="f-surgeries" rows="3" placeholder="Describe any past surgeries with approximate year..." style="resize:none;"></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Vaccination History</label>
          <div style="display:flex;flex-wrap:wrap;gap:8px;" id="vaccine-chips">
            ${['COVID-19','Influenza','Hepatitis B','Typhoid','MMR','Tetanus','Rabies'].map(v =>
              `<div class="chip" onclick="toggleChip(this)">${v}</div>`
            ).join('')}
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Family Medical History</label>
          <div style="display:flex;flex-wrap:wrap;gap:8px;" id="family-chips">
            ${['Diabetes','Heart Disease','Cancer','Hypertension','Alzheimer\'s','Kidney Disease','None'].map(v =>
              `<div class="chip" onclick="toggleChip(this)">${v}</div>`
            ).join('')}
          </div>
        </div>
        <div style="background:var(--primary-light);border-radius:14px;padding:16px;">
          <div style="font-family:var(--font-display);font-size:14px;font-weight:700;color:var(--primary);margin-bottom:8px;">ðŸ“ Upload Medical Reports</div>
          <div style="font-size:13px;color:var(--text-secondary);margin-bottom:12px;">Prescriptions, MRI, X-Ray, Blood reports, Discharge summaries</div>
          <div id="upload-zone" style="border:2px dashed var(--primary);border-radius:10px;padding:20px;text-align:center;cursor:pointer;background:rgba(74,144,217,0.05);" onclick="simulateUpload()">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="margin:0 auto 8px;display:block;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <div style="font-size:13px;font-weight:600;color:var(--primary);">Tap to upload files</div>
            <div style="font-size:11px;color:var(--text-tertiary);margin-top:4px;">PDF, JPG, PNG â€” up to 50 MB</div>
          </div>
          <div id="upload-list"></div>
        </div>
      </div>
    </div>
  `;

  if (currentStep === 3) return `
    <div class="card mb-4">
      <h3 class="text-h4 mb-4">Emergency & Insurance</h3>
      <div style="display:flex;flex-direction:column;gap:16px;">
        <div style="background:var(--emergency-light);border-radius:14px;padding:16px;">
          <div style="font-family:var(--font-display);font-size:14px;font-weight:700;color:var(--emergency);margin-bottom:12px;">ðŸš¨ Emergency Contact</div>
          <div style="display:flex;flex-direction:column;gap:12px;">
            <div class="form-group">
              <label class="form-label">Contact Name</label>
              <input type="text" class="form-input" id="f-emer-name" placeholder="Full name" />
            </div>
            <div class="form-group">
              <label class="form-label">Relationship</label>
              <select class="form-input form-select" id="f-emer-rel">
                <option value="">Select relationship</option>
                <option>Spouse/Partner</option>
                <option>Parent</option>
                <option>Child</option>
                <option>Sibling</option>
                <option>Friend</option>
                <option>Other</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Phone Number</label>
              <input type="tel" class="form-input" id="f-emer-phone" placeholder="+91 9876543210" />
            </div>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Address</label>
          <textarea class="form-input" id="f-address" rows="2" placeholder="Your home address" style="resize:none;"></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Health Insurance</label>
          <input type="text" class="form-input" id="f-insurance" placeholder="Insurance provider & policy number" />
        </div>
        <div class="form-group">
          <label class="form-label">Organ Donor</label>
          <div style="display:flex;align-items:center;justify-content:space-between;background:var(--surface-dim);padding:14px 16px;border-radius:12px;">
            <div>
              <div style="font-size:14px;font-weight:600;color:var(--text-primary);">Register as Organ Donor</div>
              <div style="font-size:12px;color:var(--text-secondary);margin-top:2px;">Help save lives through donation</div>
            </div>
            <label class="toggle">
              <input type="checkbox" id="f-organ-donor" />
              <div class="toggle-track"></div>
              <div class="toggle-thumb"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  `;
}

function initStepHandlers() {
  // Blood group selector
  if (!document.getElementById('blood-chip-styles')) {
    const s = document.createElement('style');
    s.id = 'blood-chip-styles';
    s.textContent = `
      .blood-chip {
        padding:10px 6px;border-radius:10px;background:var(--surface-dim);
        border:1.5px solid var(--border);font-size:13px;font-weight:700;
        color:var(--text-secondary);cursor:pointer;transition:all var(--transition-fast);
        font-family:var(--font-display);
      }
      .blood-chip.selected {
        background:var(--emergency-light);border-color:var(--emergency);color:var(--emergency);
      }
    `;
    document.head.appendChild(s);
  }

  window.selectBloodGroup = (group) => {
    document.querySelectorAll('.blood-chip').forEach(c => c.classList.remove('selected'));
    const target = document.querySelector(`[data-group="${group}"]`);
    if (target) target.classList.add('selected');
    formData.bloodGroup = group;
  };

  window.toggleDisease = (el, name) => {
    el.classList.toggle('active');
    if (!formData.diseases) formData.diseases = [];
    if (el.classList.contains('active')) formData.diseases.push(name);
    else formData.diseases = formData.diseases.filter(d => d !== name);
  };

  window.toggleChip = (el) => el.classList.toggle('active');

  window.simulateUpload = () => {
    const list = document.getElementById('upload-list');
    const files = ['Blood_Report_Jul2026.pdf', 'ECG_Report.pdf', 'Prescription_Dr_Priya.pdf'];
    const randomFile = files[Math.floor(Math.random() * files.length)];
    showToast(`Uploading ${randomFile}...`, 'info');
    setTimeout(() => {
      showToast(`${randomFile} uploaded successfully!`, 'success');
      if (list) {
        const div = document.createElement('div');
        div.style.cssText = 'display:flex;align-items:center;gap:10px;margin-top:10px;padding:10px;background:var(--success-light);border-radius:10px;';
        div.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          <span style="font-size:13px;color:var(--text-primary);flex:1;">${randomFile}</span>
          <span style="font-size:11px;color:var(--text-secondary);">âœ“ Uploaded</span>
        `;
        list.appendChild(div);
      }
    }, 1500);
  };

  window.prevStep = () => {
    if (currentStep > 0) { currentStep--; renderStep(); }
  };

  window.nextStep = () => {
    if (!validateStep()) return;
    collectStepData();

    if (currentStep < STEPS.length - 1) {
      currentStep++;
      renderStep();
    } else {
      completeRegistration();
    }
  };

  window.skipSetup = () => {
    const profile = buildDefaultProfile();
    store.patient = profile;
    localStorage.setItem('hv_patient_profile', JSON.stringify(profile));
    navigate('patient-home');
  };
}

function validateStep() {
  if (currentStep === 0) {
    const name = document.getElementById('f-name')?.value?.trim();
    const gender = document.getElementById('f-gender')?.value;
    const dob = document.getElementById('f-dob')?.value;
    if (!name) { showToast('Please enter your full name', 'error'); return false; }
    if (!gender) { showToast('Please select your gender', 'error'); return false; }
    if (!dob) { showToast('Please enter your date of birth', 'error'); return false; }
  }
  return true;
}

function collectStepData() {
  if (currentStep === 0) {
    formData.name = document.getElementById('f-name')?.value?.trim();
    formData.gender = document.getElementById('f-gender')?.value;
    formData.dob = document.getElementById('f-dob')?.value;
    formData.abha = document.getElementById('f-abha')?.value?.trim();
  }
  if (currentStep === 1) {
    formData.height = document.getElementById('f-height')?.value;
    formData.weight = document.getElementById('f-weight')?.value;
    formData.allergies = document.getElementById('f-allergies')?.value;
    formData.medications = document.getElementById('f-medications')?.value;
    formData.smoking = document.querySelector('[name="smoking"]:checked')?.value;
    formData.alcohol = document.querySelector('[name="alcohol"]:checked')?.value;
  }
  if (currentStep === 2) {
    formData.surgeries = document.getElementById('f-surgeries')?.value;
  }
  if (currentStep === 3) {
    formData.emergencyName = document.getElementById('f-emer-name')?.value;
    formData.emergencyPhone = document.getElementById('f-emer-phone')?.value;
    formData.emergencyRel = document.getElementById('f-emer-rel')?.value;
    formData.address = document.getElementById('f-address')?.value;
    formData.insurance = document.getElementById('f-insurance')?.value;
    formData.organDonor = document.getElementById('f-organ-donor')?.checked;
  }
}

function buildDefaultProfile() {
  return {
    name: store.currentUser?.name || 'Aarav Patel',
    email: store.currentUser?.email || 'aarav@example.com',
    phone: store.currentUser?.phone || '+91 9876543210',
    gender: 'male',
    dob: '1998-03-15',
    age: 28,
    bloodGroup: 'B+',
    height: '175',
    weight: '72',
    allergies: 'Penicillin, Sulfa drugs',
    medications: 'Amlodipine 5mg, Metoprolol 25mg',
    diseases: ['Hypertension'],
    smoking: 'never',
    alcohol: 'never',
    healthScore: 82,
    abha: 'AB-1234-5678-9012',
    insurance: 'Star Health â€” Policy #SH987654321',
    emergencyName: 'Meera Patel',
    emergencyPhone: '+91 9876543200',
    emergencyRel: 'Mother',
    organDonor: false,
    address: '45, Velachery Main Road, Chennai - 600042',
    ...formData
  };
}

function completeRegistration() {
  const btn = document.getElementById('step-next-btn');
  if (btn) {
    btn.innerHTML = '<span class="animate-spin" style="display:inline-block;width:18px;height:18px;border:2px solid rgba(255,255,255,0.3);border-top-color:white;border-radius:50%;"></span> Setting up your profile...';
    btn.disabled = true;
  }

  setTimeout(() => {
    const profile = buildDefaultProfile();
    store.patient = profile;
    localStorage.setItem('hv_patient_profile', JSON.stringify(profile));
    showToast('Profile setup complete! Welcome to HealthVerse ðŸŽ‰', 'success');
    navigate('patient-home');
  }, 1800);
}
