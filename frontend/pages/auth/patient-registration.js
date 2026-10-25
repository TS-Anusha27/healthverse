// HealthVerse — Patient Registration connected to Supabase Database
import { navigate } from '../../routes/router.js';
import { store } from '../../store/store.js';
import { showToast } from '../../utils/utils.js';
import { createPatientProfile } from '../../services/supabase/db.js';

const STEPS = [
  { title: 'Personal Info', subtitle: 'Tell us about yourself' },
  { title: 'Body & Health', subtitle: 'Your physical details' },
  { title: 'Medical History', subtitle: 'Help doctors understand you better' },
  { title: 'Emergency & Insurance', subtitle: 'For your safety' },
];

let currentStep = 0;
const formData = {};

export function renderPatientRegistration() {
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
      </div>
    </div>
  `;

  if (currentStep === 3) return `
    <div class="card mb-4">
      <h3 class="text-h4 mb-4">Emergency & Insurance</h3>
      <div style="display:flex;flex-direction:column;gap:16px;">
        <div style="background:var(--emergency-light);border-radius:14px;padding:16px;">
          <div style="font-family:var(--font-display);font-size:14px;font-weight:700;color:var(--emergency);margin-bottom:12px;">🚨 Emergency Contact</div>
          <div style="display:flex;flex-direction:column;gap:12px;">
            <div class="form-group">
              <label class="form-label">Contact Name</label>
              <input type="text" class="form-input" id="f-emer-name" placeholder="Full name" />
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
      </div>
    </div>
  `;
}

function initStepHandlers() {
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

  window.skipSetup = async () => {
    const profile = buildDefaultProfile();
    store.patient = profile;
    if (store.currentUser?.id) {
      await createPatientProfile({
        id: store.currentUser.id,
        dob: profile.dob,
        gender: profile.gender,
        blood_group: profile.bloodGroup,
        emergency_contact_name: profile.emergencyName,
        emergency_contact_phone: profile.emergencyPhone,
        address: profile.address
      });
    }
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
  }
  if (currentStep === 2) {
    formData.surgeries = document.getElementById('f-surgeries')?.value;
  }
  if (currentStep === 3) {
    formData.emergencyName = document.getElementById('f-emer-name')?.value;
    formData.emergencyPhone = document.getElementById('f-emer-phone')?.value;
    formData.address = document.getElementById('f-address')?.value;
  }
}

function buildDefaultProfile() {
  const current = store.patient || {};
  return {
    name: store.currentUser?.name || current.fullName || current.name || 'Patient',
    email: store.currentUser?.email || current.email || '',
    phone: store.currentUser?.phone || current.phone || '',
    gender: current.gender || 'prefer_not',
    dob: current.dob || '',
    bloodGroup: current.bloodGroup || '',
    height: '170',
    weight: '68',
    healthScore: 85,
    emergencyName: current.emergencyName || '',
    emergencyPhone: current.emergencyPhone || '',
    address: current.address || '',
    ...formData
  };
}

async function completeRegistration() {
  const btn = document.getElementById('step-next-btn');
  if (btn) {
    btn.innerHTML = '<span class="animate-spin" style="display:inline-block;width:18px;height:18px;border:2px solid rgba(255,255,255,0.3);border-top-color:white;border-radius:50%;"></span> Saving to Supabase...';
    btn.disabled = true;
  }

  const profile = buildDefaultProfile();
  store.patient = profile;

  if (store.currentUser?.id) {
    await createPatientProfile({
      id: store.currentUser.id,
      dob: profile.dob,
      gender: profile.gender,
      blood_group: profile.bloodGroup,
      height: parseFloat(profile.height) || 175,
      weight: parseFloat(profile.weight) || 72,
      emergency_contact_name: profile.emergencyName,
      emergency_contact_phone: profile.emergencyPhone,
      address: profile.address
    });
  }

  showToast('Profile setup complete! Welcome to HealthVerse 🎉', 'success');
  navigate('patient-home');
}
