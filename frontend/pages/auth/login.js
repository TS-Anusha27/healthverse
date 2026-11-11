// HealthVerse — Authentication Experience (Sign In & Dedicated Role Registration)
import { navigate } from '../../routes/router.js';
import { store } from '../../store/store.js';
import { authService } from '../../services/auth/authService.js';
import { showToast, showModal, closeModal, setFieldError, clearFieldError, clearFormErrors, evaluatePasswordStrength, escapeHtml } from '../../utils/utils.js';
import { DEMO_ACCOUNTS, ensureDemoAccountsSeeded } from '../../utils/demoUsers.js';
import { uiIcon } from '../../utils/icons.js';

let activeRole = 'patient'; // 'patient' | 'doctor' | 'ambulance'
let activeTab = 'login'; // 'login' | 'register'

export function renderLogin(params = {}) {
  // Read role and tab from query params if passed
  if (params.role && ['patient', 'doctor', 'ambulance'].includes(params.role)) {
    activeRole = params.role;
  }
  if (params.tab && ['login', 'register'].includes(params.tab)) {
    activeTab = params.tab;
  }

  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="screen screen-shell auth-screen" id="auth-screen">
      <!-- Professional Top Navigation Bar -->
      <header class="auth-header">
        <div class="auth-header-inner">
          <button class="back-link-btn" onclick="navigate('user-type')" aria-label="Back to role selection">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            <span>Role Selection</span>
          </button>
          
          <div class="brand-mini">
            <div class="brand-mini-icon">
              <svg width="18" height="18" viewBox="0 0 52 52" fill="none">
                <path d="M26 8C26 8 14 14 14 26C14 32 17.5 37 23 40L26 42L29 40C34.5 37 38 32 38 26C38 14 26 8 26 8Z" fill="white"/>
                <path d="M22 26H30M26 22V30" stroke="#4A90D9" stroke-width="3" stroke-linecap="round"/>
              </svg>
            </div>
            <span class="brand-mini-name">HealthVerse</span>
          </div>

          <div class="header-spacer-md"></div>
        </div>
      </header>

      <!-- Main Form Container -->
      <main class="screen-content auth-main">
        <!-- Role Switcher Pills -->
        <div class="role-switcher-container">
          <div class="role-switcher" role="tablist" aria-label="User Category">
            <button class="role-chip ${activeRole==='patient'?'active':''}" id="chip-patient" onclick="switchRole('patient')">
              <span class="role-chip-dot"></span>
              Patient
            </button>
            <button class="role-chip ${activeRole==='doctor'?'active':''}" id="chip-doctor" onclick="switchRole('doctor')">
              <span class="role-chip-dot"></span>
              Doctor
            </button>
            <button class="role-chip ${activeRole==='ambulance'?'active':''}" id="chip-ambulance" onclick="switchRole('ambulance')">
              <span class="role-chip-dot"></span>
              Ambulance
            </button>
          </div>
        </div>

        <!-- Role Context Banner -->
        <div class="role-banner" id="role-banner">
          ${getRoleBannerContent(activeRole)}
        </div>

        <!-- Authentication Panel Card -->
        <div class="auth-card">
          <!-- Form Tabs: Sign In vs Create Account -->
          <div class="auth-tabs" role="tablist">
            <button class="auth-tab ${activeTab==='login'?'active':''}" id="tab-login" onclick="switchAuthTab('login')">
              Sign In
            </button>
            <button class="auth-tab ${activeTab==='register'?'active':''}" id="tab-register" onclick="switchAuthTab('register')">
              Create Account
            </button>
          </div>

          <!-- TAB 1: Sign In Form -->
          <div id="form-container-login" class="${activeTab==='login'?'':'hidden'}">
            <form onsubmit="event.preventDefault(); handleSignInSubmit();" class="mt-4" id="login-form" novalidate>
              <div class="form-group">
                <label class="form-label" for="login-email">Registered Email Address</label>
                <div class="input-group">
                  <span class="input-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  </span>
                  <input type="email" class="form-input" id="login-email" placeholder="name@example.com" autocomplete="email" inputmode="email" required />
                </div>
                <div class="form-error hidden" id="err-login-email" role="alert"></div>
              </div>

              <div class="form-group mt-3">
                <label class="form-label" for="login-password">Password</label>
                <div class="input-group">
                  <span class="input-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </span>
                  <input type="password" class="form-input" id="login-password" placeholder="Enter your password" autocomplete="current-password" required style="padding-right:46px;" />
                  <button type="button" class="input-suffix-btn" onclick="togglePasswordVisibility('login-password', this)" aria-label="Show password">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  </button>
                </div>
                <div class="form-error hidden" id="err-login-password" role="alert"></div>
              </div>

              <div class="flex justify-between items-center mt-2">
                <span class="subtle-link" onclick="openForgotNotice()">Forgot Password?</span>
                <span class="subtle-link" onclick="switchAuthTab('register')">New user? Register</span>
              </div>

              <button type="submit" class="btn btn-primary btn-full mt-4" id="btn-login-submit">
                <span id="btn-login-text">Sign In as ${getRoleTitle(activeRole)}</span>
              </button>
            </form>

            <div class="demo-divider"><span>OR QUICK DEMO ACCESS</span></div>

            <div class="demo-login-box" id="demo-login-box">
              ${renderDemoBoxContent(activeRole)}
            </div>
          </div>

          <!-- TAB 2: Dynamic Role-Specific Registration Form -->
          <div id="form-container-register" class="${activeTab==='register'?'':'hidden'}">
            <div id="registration-form-content">
              ${getRegistrationFormHtml(activeRole)}
            </div>
          </div>
        </div>
      </main>
    </div>
  `;

  injectAuthStyles();
  attachAuthHandlers();
}

/**
 * Returns role header details
 */
function getRoleTitle(role) {
  if (role === 'doctor') return 'Doctor';
  if (role === 'ambulance') return 'Ambulance Driver';
  return 'Patient';
}

function renderDemoBoxContent(role) {
  const demo = DEMO_ACCOUNTS[role] || DEMO_ACCOUNTS.patient;
  return `
    <div class="demo-creds-row">
      <div class="demo-creds-text">
        <div class="demo-creds-title">${escapeHtml(demo.title)}</div>
        <div class="demo-creds-meta">
          Email: <code>${escapeHtml(demo.email)}</code> &bull; Password: <code>${escapeHtml(demo.password)}</code>
        </div>
      </div>
      <button type="button" class="demo-fill-btn" onclick="fillDemoCredentials()">Fill</button>
    </div>
    <button type="button" class="btn btn-outline btn-full mt-3 demo-continue-btn" id="btn-demo-continue" onclick="handleDemoContinue()">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>
      <span>Continue with Demo User</span>
    </button>
  `;
}

function getRoleBannerContent(role) {
  if (role === 'doctor') {
    return `
      <div class="role-badge-row">
        <div class="role-icon-box doctor-box">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2B6CB0" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
        </div>
        <div>
          <div class="role-banner-title">Doctor Workspace</div>
          <div class="role-banner-desc">Manage consultations, digital prescriptions & patient triage</div>
        </div>
      </div>
    `;
  }
  if (role === 'ambulance') {
    return `
      <div class="role-badge-row">
        <div class="role-icon-box ambulance-box">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C53030" stroke-width="2"><rect x="1" y="3" width="15" height="13" rx="2"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
        </div>
        <div>
          <div class="role-banner-title">Ambulance Driver Portal</div>
          <div class="role-banner-desc">Live dispatch, GPS emergency navigation & patient transport</div>
        </div>
      </div>
    `;
  }
  return `
    <div class="role-badge-row">
      <div class="role-icon-box patient-box">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2C7A7B" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      </div>
      <div>
        <div class="role-banner-title">Patient / User Portal</div>
        <div class="role-banner-desc">Book appointments, track medical records & consult doctors</div>
      </div>
    </div>
  `;
}

function renderPasswordPairHtml(prefix) {
  return `
    <div class="grid-2 mt-3">
      <div class="form-group">
        <label class="form-label" for="${prefix}-password">Password (min 6) *</label>
        <div class="password-field-wrap">
          <input type="password" class="form-input" id="${prefix}-password" placeholder="••••••••" autocomplete="new-password" minlength="6" oninput="updatePasswordStrengthMeter('${prefix}-password', '${prefix}-strength')" required />
          <button type="button" class="password-toggle-btn" onclick="togglePasswordVisibility('${prefix}-password', this)" aria-label="Show password">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
        </div>
        <div class="password-strength hidden" id="${prefix}-strength" aria-live="polite">
          <div class="password-strength-bars">
            <div class="password-strength-bar"></div>
            <div class="password-strength-bar"></div>
            <div class="password-strength-bar"></div>
            <div class="password-strength-bar"></div>
          </div>
          <div class="password-strength-label"></div>
        </div>
        <div class="form-error hidden" id="err-${prefix}-password" role="alert"></div>
      </div>
      <div class="form-group">
        <label class="form-label" for="${prefix}-confirm-password">Confirm Password *</label>
        <div class="password-field-wrap">
          <input type="password" class="form-input" id="${prefix}-confirm-password" placeholder="••••••••" autocomplete="new-password" required />
          <button type="button" class="password-toggle-btn" onclick="togglePasswordVisibility('${prefix}-confirm-password', this)" aria-label="Show confirm password">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
        </div>
        <div class="form-error hidden" id="err-${prefix}-confirm-password" role="alert"></div>
      </div>
    </div>
  `;
}

/**
 * Returns role-specific registration form fields
 */
function getRegistrationFormHtml(role) {
  if (role === 'doctor') {
    return `
      <form onsubmit="event.preventDefault(); handleDoctorRegisterSubmit();" class="mt-4" id="doctor-reg-form" novalidate>
        <!-- Notice of pending verification -->
        <div class="verification-notice-banner mb-3">
          <div class="notice-icon" style="display:inline-flex;color:var(--warning-dark, #B45309);">${uiIcon('clipboard', { size: 18 })}</div>
          <div class="notice-text">
            <strong>Professional Credential Verification:</strong> Doctor accounts require administrative licence verification before full platform access. Your account will be created in a <em>Pending Verification</em> state.
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="doc-fullname">Full Name (with Dr. prefix) *</label>
          <input type="text" class="form-input" id="doc-fullname" placeholder="e.g. Dr. Anusha TS" autocomplete="name" required />
        </div>

        <div class="grid-2 mt-3">
          <div class="form-group">
            <label class="form-label" for="doc-email">Registered Email *</label>
            <input type="email" class="form-input" id="doc-email" placeholder="doctor@hospital.org" autocomplete="email" inputmode="email" required />
          </div>
          <div class="form-group">
            <label class="form-label" for="doc-phone">Mobile Number *</label>
            <input type="tel" class="form-input" id="doc-phone" placeholder="+91 9876543210" autocomplete="tel" inputmode="tel" required />
          </div>
        </div>

        <div class="grid-2 mt-3">
          <div class="form-group">
            <label class="form-label" for="doc-regno">Medical Licence / Reg No. *</label>
            <input type="text" class="form-input" id="doc-regno" placeholder="MCI-12345 / SMC-889" autocomplete="off" required />
          </div>
          <div class="form-group">
            <label class="form-label" for="doc-qualification">Qualification *</label>
            <input type="text" class="form-input" id="doc-qualification" placeholder="MBBS, MD (Cardiology)" autocomplete="organization-title" required />
          </div>
        </div>

        <div class="grid-2 mt-3">
          <div class="form-group">
            <label class="form-label" for="doc-specialty">Specialisation *</label>
            <input type="text" class="form-input" id="doc-specialty" placeholder="e.g. Cardiology" required />
          </div>
          <div class="form-group">
            <label class="form-label" for="doc-hospital">Hospital Affiliation *</label>
            <input type="text" class="form-input" id="doc-hospital" placeholder="Apollo Hospitals" autocomplete="organization" required />
          </div>
        </div>

        <div class="form-group mt-3">
          <label class="form-label" for="doc-experience">Years of Clinical Experience (Optional)</label>
          <input type="text" class="form-input" id="doc-experience" placeholder="e.g. 8 years" inputmode="text" />
        </div>

        ${renderPasswordPairHtml('doc')}

        <button type="submit" class="btn btn-primary btn-full mt-4" id="btn-doc-submit">
          Create Doctor Account
        </button>

        <div class="text-center mt-3">
          <span class="subtle-link" onclick="switchAuthTab('login')">Already registered? Log in</span>
        </div>
      </form>
    `;
  }

  if (role === 'ambulance') {
    return `
      <form onsubmit="event.preventDefault(); handleAmbulanceRegisterSubmit();" class="mt-4" id="ambulance-reg-form" novalidate>
        <!-- Notice of pending verification -->
        <div class="verification-notice-banner mb-3">
          <div class="notice-icon" style="display:inline-flex;color:var(--emergency);">${uiIcon('ambulance', { size: 18 })}</div>
          <div class="notice-text">
            <strong>Emergency Driver Verification:</strong> Ambulance driver accounts are verified against active vehicle and driving licences. Newly registered accounts start with <em>Pending Verification</em> status.
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="amb-fullname">Full Name *</label>
          <input type="text" class="form-input" id="amb-fullname" placeholder="Driver Full Name" autocomplete="name" required />
        </div>

        <div class="grid-2 mt-3">
          <div class="form-group">
            <label class="form-label" for="amb-email">Email Address *</label>
            <input type="email" class="form-input" id="amb-email" placeholder="driver@emergency.org" autocomplete="email" inputmode="email" required />
          </div>
          <div class="form-group">
            <label class="form-label" for="amb-phone">Mobile Number *</label>
            <input type="tel" class="form-input" id="amb-phone" placeholder="+91 9876543210" autocomplete="tel" inputmode="tel" required />
          </div>
        </div>

        <div class="grid-2 mt-3">
          <div class="form-group">
            <label class="form-label" for="amb-licence">Driving Licence No. *</label>
            <input type="text" class="form-input" id="amb-licence" placeholder="DL-1420110012345" autocomplete="off" required />
          </div>
          <div class="form-group">
            <label class="form-label" for="amb-vehicle">Ambulance Vehicle No. *</label>
            <input type="text" class="form-input" id="amb-vehicle" placeholder="TN 07 AB 1234" autocomplete="off" required />
          </div>
        </div>

        <div class="form-group mt-3">
          <label class="form-label" for="amb-service">Ambulance Service / Hospital Affiliation *</label>
          <input type="text" class="form-input" id="amb-service" placeholder="e.g. City Emergency Care / Apollo Fleet" autocomplete="organization" required />
        </div>

        ${renderPasswordPairHtml('amb')}

        <button type="submit" class="btn btn-primary btn-full mt-4" id="btn-amb-submit">
          Create Ambulance Driver Account
        </button>

        <div class="text-center mt-3">
          <span class="subtle-link" onclick="switchAuthTab('login')">Already registered? Log in</span>
        </div>
      </form>
    `;
  }

  // Patient Registration Form
  const maxDate = new Date().toISOString().split('T')[0];
  return `
    <form onsubmit="event.preventDefault(); handlePatientRegisterSubmit();" class="mt-4" id="patient-reg-form" novalidate>
      <div class="form-group">
        <label class="form-label" for="pat-fullname">Full Name *</label>
        <input type="text" class="form-input" id="pat-fullname" placeholder="e.g. Anusha TS" autocomplete="name" required />
      </div>

      <div class="grid-2 mt-3">
        <div class="form-group">
          <label class="form-label" for="pat-dob">Date of Birth *</label>
          <input type="date" class="form-input" id="pat-dob" max="${maxDate}" autocomplete="bday" onchange="updateCalculatedAge(this.value)" required />
          <div class="calculated-age-hint" id="calculated-age-hint" style="display:none;"></div>
        </div>
        <div class="form-group">
          <label class="form-label" for="pat-gender">Gender</label>
          <select class="form-input form-select" id="pat-gender" autocomplete="sex">
            <option value="prefer_not">Prefer not to say</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div class="grid-2 mt-3">
        <div class="form-group">
          <label class="form-label" for="pat-email">Email Address *</label>
          <input type="email" class="form-input" id="pat-email" placeholder="your@email.com" autocomplete="email" inputmode="email" required />
        </div>
        <div class="form-group">
          <label class="form-label" for="pat-phone">Mobile Number</label>
          <input type="tel" class="form-input" id="pat-phone" placeholder="+91 9876543210" autocomplete="tel" inputmode="tel" />
        </div>
      </div>

      <div class="form-group mt-3">
        <label class="form-label">Blood Group</label>
        <div class="blood-group-selector">
          ${['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => `
            <button type="button" class="blood-pill" data-bg="${bg}" onclick="selectBloodGroupPill('${bg}')">${bg}</button>
          `).join('')}
        </div>
        <input type="hidden" id="pat-bloodgroup" value="" />
      </div>

      <div class="form-group mt-3">
        <label class="form-label" for="pat-address">Home Address / Location (Optional)</label>
        <input type="text" class="form-input" id="pat-address" placeholder="City, State" autocomplete="street-address" />
      </div>

      <div class="grid-2 mt-3">
        <div class="form-group">
          <label class="form-label" for="pat-emergency-name">Emergency Contact Name</label>
          <input type="text" class="form-input" id="pat-emergency-name" placeholder="Contact person" autocomplete="name" />
        </div>
        <div class="form-group">
          <label class="form-label" for="pat-emergency-phone">Emergency Phone</label>
          <input type="tel" class="form-input" id="pat-emergency-phone" placeholder="+91 9876543200" autocomplete="tel" inputmode="tel" />
        </div>
      </div>

      ${renderPasswordPairHtml('pat')}

      <!-- Privacy Notice Acknowledgement -->
      <div class="form-group mt-3">
        <div class="consent-row">
          <input type="checkbox" id="pat-privacy" class="consent-checkbox" required />
          <label for="pat-privacy" class="consent-label">
            I acknowledge HealthVerse's privacy notice and consent to storing my healthcare profile for emergency and consultation access.
          </label>
        </div>
        <div class="form-error hidden" id="err-pat-privacy" role="alert"></div>
      </div>

      <button type="submit" class="btn btn-primary btn-full mt-4" id="btn-pat-submit">
        Create Patient Account
      </button>

      <div class="text-center mt-3">
        <span class="subtle-link" onclick="switchAuthTab('login')">Already have an account? Log in</span>
      </div>
    </form>
  `;
}

function injectAuthStyles() {
  if (document.getElementById('auth-overhaul-styles')) return;
  const s = document.createElement('style');
  s.id = 'auth-overhaul-styles';
  s.textContent = `
    .auth-header {
      background: var(--surface);
      border-bottom: 1px solid var(--border-light);
      box-shadow: 0 1px 3px rgba(15,23,42,0.04);
      padding: 12px 16px;
    }
    .auth-header-inner {
      max-width: 480px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .back-link-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      font-weight: 600;
      color: var(--text-secondary);
      background: none;
      border: none;
      cursor: pointer;
      padding: 6px 8px;
      border-radius: 8px;
      transition: background 0.15s ease;
    }
    .back-link-btn:hover {
      background: var(--surface-dim);
      color: var(--primary);
    }
    .brand-mini {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .brand-mini-icon {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .brand-mini-name {
      font-family: var(--font-display);
      font-size: 16px;
      font-weight: 800;
      color: var(--text-primary);
    }
    .role-switcher-container {
      margin-top: 8px;
      margin-bottom: 16px;
    }
    .role-switcher {
      display: flex;
      background: var(--surface-dim);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 4px;
      gap: 4px;
    }
    .role-chip {
      flex: 1;
      padding: 8px 6px;
      font-family: var(--font-display);
      font-size: 13px;
      font-weight: 600;
      border: none;
      background: transparent;
      color: var(--text-secondary);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.15s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }
    .role-chip-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--text-tertiary);
    }
    .role-chip.active {
      background: var(--surface);
      color: var(--text-primary);
      box-shadow: 0 1px 4px rgba(15,23,42,0.08);
      font-weight: 700;
    }
    .role-chip.active .role-chip-dot {
      background: var(--primary);
    }
    .role-banner {
      background: var(--surface);
      border: 1px solid var(--border-light);
      border-radius: 14px;
      padding: 14px 16px;
      margin-bottom: 16px;
      box-shadow: 0 1px 3px rgba(15,23,42,0.03);
    }
    .role-badge-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .role-icon-box {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .patient-box { background: var(--secondary-light); }
    .doctor-box { background: var(--primary-light); }
    .ambulance-box { background: var(--emergency-light); }
    .role-banner-title {
      font-family: var(--font-display);
      font-size: 15px;
      font-weight: 700;
      color: var(--text-primary);
    }
    .role-banner-desc {
      font-size: 12px;
      color: var(--text-secondary);
      margin-top: 2px;
    }
    .auth-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 18px;
      padding: 20px;
      box-shadow: 0 4px 16px rgba(15,23,42,0.05);
    }
    .auth-tabs {
      display: flex;
      border-bottom: 1.5px solid var(--border-light);
      gap: 8px;
    }
    .auth-tab {
      flex: 1;
      padding: 10px;
      font-family: var(--font-display);
      font-size: 14px;
      font-weight: 600;
      border: none;
      background: transparent;
      color: var(--text-secondary);
      border-bottom: 2px solid transparent;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .auth-tab.active {
      color: var(--primary);
      border-bottom-color: var(--primary);
      font-weight: 700;
    }
    .input-suffix-btn {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      color: var(--text-tertiary);
      padding: 4px;
      display: flex;
      align-items: center;
    }
    .input-suffix-btn:hover { color: var(--text-primary); }
    .subtle-link {
      font-size: 13px;
      color: var(--primary);
      font-weight: 600;
      cursor: pointer;
    }
    .subtle-link:hover { text-decoration: underline; }
    .blood-group-selector {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 6px;
      margin-top: 4px;
    }
    .blood-pill {
      padding: 8px 4px;
      font-size: 12px;
      font-weight: 700;
      border: 1px solid var(--border);
      border-radius: 8px;
      background: var(--surface-dim);
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .blood-pill:hover { border-color: var(--primary); }
    .blood-pill.selected {
      background: var(--primary-light);
      border-color: var(--primary);
      color: var(--primary);
    }
    .verification-notice-banner {
      background: var(--warning-light);
      border: 1px solid rgba(255, 165, 2, 0.35);
      border-radius: 10px;
      padding: 10px 12px;
      display: flex;
      gap: 10px;
      align-items: flex-start;
    }
    .notice-icon { font-size: 16px; flex-shrink: 0; }
    .notice-text { font-size: 12px; color: #92400E; line-height: 1.4; }
    [data-theme="dark"] .notice-text { color: #FDE68A; }
    .calculated-age-hint {
      font-size: 12px;
      font-weight: 600;
      color: var(--secondary-dark);
      margin-top: 4px;
    }
  `;
  document.head.appendChild(s);
}

function attachAuthHandlers() {
  window.switchRole = (role) => {
    activeRole = role;
    // Update role chips
    document.querySelectorAll('.role-chip').forEach(c => c.classList.remove('active'));
    document.getElementById(`chip-${role}`)?.classList.add('active');

    // Update banner
    const banner = document.getElementById('role-banner');
    if (banner) banner.innerHTML = getRoleBannerContent(role);

    // Update login submit button text
    const btnText = document.getElementById('btn-login-text');
    if (btnText) btnText.textContent = `Sign In as ${getRoleTitle(role)}`;

    // Update demo quick access card for selected role
    const demoBox = document.getElementById('demo-login-box');
    if (demoBox) demoBox.innerHTML = renderDemoBoxContent(role);

    // Update registration fields
    const regContainer = document.getElementById('registration-form-content');
    if (regContainer) regContainer.innerHTML = getRegistrationFormHtml(role);

    // Update URL hash parameter without creating duplicate history
    const currentTab = activeTab;
    navigate('login', { role, tab: currentTab }, false);
  };

  window.switchAuthTab = (tab) => {
    activeTab = tab;
    document.getElementById('tab-login')?.classList.toggle('active', tab === 'login');
    document.getElementById('tab-register')?.classList.toggle('active', tab === 'register');
    document.getElementById('form-container-login')?.classList.toggle('hidden', tab !== 'login');
    document.getElementById('form-container-register')?.classList.toggle('hidden', tab !== 'register');

    navigate('login', { role: activeRole, tab }, false);
  };

  window.togglePasswordVisibility = (inputId, btn) => {
    const input = document.getElementById(inputId);
    if (!input) return;
    const isPwd = input.type === 'password';
    input.type = isPwd ? 'text' : 'password';
    btn.style.color = isPwd ? 'var(--primary)' : 'var(--text-tertiary)';
    btn.setAttribute('aria-label', isPwd ? 'Hide password' : 'Show password');
    btn.innerHTML = isPwd
      ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>'
      : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
  };

  window.updatePasswordStrengthMeter = (inputId, meterId) => {
    const input = document.getElementById(inputId);
    const meter = document.getElementById(meterId);
    if (!input || !meter) return;
    const result = evaluatePasswordStrength(input.value);
    if (!input.value) {
      meter.classList.add('hidden');
      return;
    }
    meter.classList.remove('hidden');
    const bars = meter.querySelectorAll('.password-strength-bar');
    bars.forEach((bar, idx) => {
      bar.className = 'password-strength-bar';
      if (idx < result.score) {
        bar.classList.add('active', result.tier);
      }
    });
    const label = meter.querySelector('.password-strength-label');
    if (label) {
      label.className = `password-strength-label ${result.tier}`;
      label.textContent = result.label;
    }
  };

  const authMain = document.querySelector('.auth-main');
  if (authMain) {
    authMain.addEventListener('input', (e) => {
      if (e.target && e.target.id) clearFieldError(e.target.id);
    });
    authMain.addEventListener('change', (e) => {
      if (e.target && e.target.id) clearFieldError(e.target.id);
    });
  }

  window.selectBloodGroupPill = (bg) => {
    document.querySelectorAll('.blood-pill').forEach(p => p.classList.remove('selected'));
    const btn = document.querySelector(`.blood-pill[data-bg="${bg}"]`);
    if (btn) btn.classList.add('selected');
    const input = document.getElementById('pat-bloodgroup');
    if (input) input.value = bg;
  };

  window.updateCalculatedAge = (dobString) => {
    const hint = document.getElementById('calculated-age-hint');
    if (!hint) return;
    const age = authService.calculateAge(dobString);
    if (age !== null && age >= 0) {
      hint.textContent = `✓ Calculated Age: ${age} years old`;
      hint.style.display = 'block';
    } else {
      hint.style.display = 'none';
    }
  };

  window.fillDemoCredentials = () => {
    const demo = DEMO_ACCOUNTS[activeRole] || DEMO_ACCOUNTS.patient;
    const emailEl = document.getElementById('login-email');
    const pwdEl = document.getElementById('login-password');
    if (emailEl) {
      emailEl.value = demo.email;
      clearFieldError('login-email');
    }
    if (pwdEl) {
      pwdEl.value = demo.password;
      clearFieldError('login-password');
    }
    showToast(`Filled ${getRoleTitle(activeRole)} demo credentials.`, 'info');
  };

  window.handleDemoContinue = async () => {
    const demo = DEMO_ACCOUNTS[activeRole] || DEMO_ACCOUNTS.patient;
    const btn = document.getElementById('btn-demo-continue');
    const originalHtml = btn ? btn.innerHTML : '';
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner-inline animate-spin"></span> Entering Demo Account...';
    }

    await ensureDemoAccountsSeeded();
    const res = await authService.login({
      email: demo.email,
      password: demo.password,
      role: activeRole
    });

    if (btn) {
      btn.disabled = false;
      btn.innerHTML = originalHtml;
    }

    if (!res.success) {
      showToast(res.error || 'Unable to enter demo account.', 'error');
      return;
    }

    showToast(`Entered ${demo.title} (${res.profile?.fullName || demo.email})`, 'success');
    if (activeRole === 'doctor') navigate('doctor-home');
    else if (activeRole === 'ambulance') navigate('ambulance-home');
    else navigate('patient-home');
  };

  window.handleSignInSubmit = async () => {
    clearFormErrors(document.getElementById('login-form'));
    const email = document.getElementById('login-email')?.value?.trim();
    const password = document.getElementById('login-password')?.value;
    const btn = document.getElementById('btn-login-submit');

    let valid = true;
    if (!email || !email.includes('@')) {
      setFieldError('login-email', 'Please enter a valid email address.');
      valid = false;
    }
    if (!password) {
      setFieldError('login-password', 'Please enter your password.');
      valid = false;
    }
    if (!valid) {
      showToast('Please fix the highlighted fields.', 'error');
      return;
    }

    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="spinner-inline animate-spin"></span> Verifying Credentials...';
    btn.disabled = true;

    const res = await authService.login({
      email,
      password,
      role: activeRole
    });

    btn.disabled = false;
    btn.innerHTML = originalText;

    if (!res.success) {
      setFieldError('login-password', res.error);
      showToast(res.error, 'error');
      return;
    }

    showToast(`Signed in successfully! Welcome back, ${res.profile?.fullName || res.user?.name} 👋`, 'success');

    // Route to appropriate dashboard
    if (activeRole === 'doctor') navigate('doctor-home');
    else if (activeRole === 'ambulance') navigate('ambulance-home');
    else navigate('patient-home');
  };

  window.handlePatientRegisterSubmit = async () => {
    clearFormErrors(document.getElementById('patient-reg-form'));
    const fullName = document.getElementById('pat-fullname')?.value?.trim();
    const dob = document.getElementById('pat-dob')?.value;
    const gender = document.getElementById('pat-gender')?.value;
    const email = document.getElementById('pat-email')?.value?.trim();
    const phone = document.getElementById('pat-phone')?.value?.trim();
    const bloodGroup = document.getElementById('pat-bloodgroup')?.value;
    const address = document.getElementById('pat-address')?.value?.trim();
    const emergencyName = document.getElementById('pat-emergency-name')?.value?.trim();
    const emergencyPhone = document.getElementById('pat-emergency-phone')?.value?.trim();
    const password = document.getElementById('pat-password')?.value;
    const confirmPassword = document.getElementById('pat-confirm-password')?.value;
    const privacyChecked = document.getElementById('pat-privacy')?.checked;
    const btn = document.getElementById('btn-pat-submit');

    let valid = true;
    if (!fullName || fullName.length < 2) { setFieldError('pat-fullname', 'Please enter your full name.'); valid = false; }
    if (!dob) { setFieldError('pat-dob', 'Date of birth is required.'); valid = false; }
    else {
      const dobDate = new Date(dob);
      if (isNaN(dobDate.getTime()) || dobDate > new Date()) {
        setFieldError('pat-dob', 'Date of birth cannot be in the future.');
        valid = false;
      }
    }
    if (!email || !email.includes('@')) { setFieldError('pat-email', 'Please enter a valid email address.'); valid = false; }
    if (!password || password.length < 6) { setFieldError('pat-password', 'Password must be at least 6 characters long.'); valid = false; }
    if (password !== confirmPassword) { setFieldError('pat-confirm-password', 'Passwords do not match.'); valid = false; }
    if (!privacyChecked) {
      setFieldError('pat-privacy', 'Please accept the privacy notice to proceed with registration.');
      valid = false;
    }
    if (!valid) {
      showToast('Please review the highlighted fields.', 'error');
      return;
    }

    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="spinner-inline animate-spin"></span> Creating Account...';
    btn.disabled = true;

    const res = await authService.registerPatient({
      fullName,
      email,
      password,
      confirmPassword,
      dob,
      phone,
      bloodGroup,
      gender,
      address,
      emergencyName,
      emergencyPhone,
      privacyConsent: true
    });

    btn.disabled = false;
    btn.innerHTML = originalText;

    if (!res.success) {
      showToast(res.error, 'error');
      return;
    }

    showToast(`Account created for ${res.profile.fullName}! Opening Patient Dashboard 🎉`, 'success');
    navigate('patient-home');
  };

  window.handleDoctorRegisterSubmit = async () => {
    clearFormErrors(document.getElementById('doctor-reg-form'));
    const fullName = document.getElementById('doc-fullname')?.value?.trim();
    const email = document.getElementById('doc-email')?.value?.trim();
    const phone = document.getElementById('doc-phone')?.value?.trim();
    const medicalRegNo = document.getElementById('doc-regno')?.value?.trim();
    const qualification = document.getElementById('doc-qualification')?.value?.trim();
    const specialisation = document.getElementById('doc-specialty')?.value?.trim();
    const hospital = document.getElementById('doc-hospital')?.value?.trim();
    const experience = document.getElementById('doc-experience')?.value?.trim();
    const password = document.getElementById('doc-password')?.value;
    const confirmPassword = document.getElementById('doc-confirm-password')?.value;
    const btn = document.getElementById('btn-doc-submit');

    let valid = true;
    if (!fullName || fullName.length < 2) { setFieldError('doc-fullname', 'Please enter your full name.'); valid = false; }
    if (!email || !email.includes('@')) { setFieldError('doc-email', 'Please enter a valid email address.'); valid = false; }
    if (!phone || phone.length < 7) { setFieldError('doc-phone', 'A valid mobile number is required.'); valid = false; }
    if (!medicalRegNo || medicalRegNo.length < 3) { setFieldError('doc-regno', 'Medical registration / licence number is required.'); valid = false; }
    if (!qualification || qualification.length < 2) { setFieldError('doc-qualification', 'Medical qualification is required.'); valid = false; }
    if (!specialisation || specialisation.length < 2) { setFieldError('doc-specialty', 'Specialisation is required.'); valid = false; }
    if (!hospital || hospital.length < 2) { setFieldError('doc-hospital', 'Hospital or clinic affiliation is required.'); valid = false; }
    if (!password || password.length < 6) { setFieldError('doc-password', 'Password must be at least 6 characters long.'); valid = false; }
    if (password !== confirmPassword) { setFieldError('doc-confirm-password', 'Passwords do not match.'); valid = false; }
    if (!valid) {
      showToast('Please review the highlighted fields.', 'error');
      return;
    }

    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="spinner-inline animate-spin"></span> Registering Doctor...';
    btn.disabled = true;

    const res = await authService.registerDoctor({
      fullName,
      email,
      password,
      confirmPassword,
      phone,
      medicalRegNo,
      qualification,
      specialisation,
      hospital,
      experience
    });

    btn.disabled = false;
    btn.innerHTML = originalText;

    if (!res.success) {
      showToast(res.error, 'error');
      return;
    }

    showToast(`Doctor account registered for ${res.profile.fullName}! Status: Pending Verification 🩺`, 'success', 5000);
    navigate('doctor-home');
  };

  window.handleAmbulanceRegisterSubmit = async () => {
    clearFormErrors(document.getElementById('ambulance-reg-form'));
    const fullName = document.getElementById('amb-fullname')?.value?.trim();
    const email = document.getElementById('amb-email')?.value?.trim();
    const phone = document.getElementById('amb-phone')?.value?.trim();
    const drivingLicenceNo = document.getElementById('amb-licence')?.value?.trim();
    const vehicleNumber = document.getElementById('amb-vehicle')?.value?.trim();
    const serviceAffiliation = document.getElementById('amb-service')?.value?.trim();
    const password = document.getElementById('amb-password')?.value;
    const confirmPassword = document.getElementById('amb-confirm-password')?.value;
    const btn = document.getElementById('btn-amb-submit');

    let valid = true;
    if (!fullName || fullName.length < 2) { setFieldError('amb-fullname', 'Please enter driver full name.'); valid = false; }
    if (!email || !email.includes('@')) { setFieldError('amb-email', 'Please enter a valid email address.'); valid = false; }
    if (!phone || phone.length < 7) { setFieldError('amb-phone', 'Mobile number is required.'); valid = false; }
    if (!drivingLicenceNo || drivingLicenceNo.length < 4) { setFieldError('amb-licence', 'Driving licence number is required.'); valid = false; }
    if (!vehicleNumber || vehicleNumber.length < 4) { setFieldError('amb-vehicle', 'Vehicle registration number is required.'); valid = false; }
    if (!serviceAffiliation || serviceAffiliation.length < 2) { setFieldError('amb-service', 'Service / hospital affiliation is required.'); valid = false; }
    if (!password || password.length < 6) { setFieldError('amb-password', 'Password must be at least 6 characters long.'); valid = false; }
    if (password !== confirmPassword) { setFieldError('amb-confirm-password', 'Passwords do not match.'); valid = false; }
    if (!valid) {
      showToast('Please review the highlighted fields.', 'error');
      return;
    }

    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="spinner-inline animate-spin"></span> Registering Driver...';
    btn.disabled = true;

    const res = await authService.registerAmbulance({
      fullName,
      email,
      password,
      confirmPassword,
      phone,
      drivingLicenceNo,
      vehicleNumber,
      serviceAffiliation
    });

    btn.disabled = false;
    btn.innerHTML = originalText;

    if (!res.success) {
      showToast(res.error, 'error');
      return;
    }

    showToast(`Ambulance driver account registered for ${res.profile.fullName}! Status: Pending Verification 🚑`, 'success', 5000);
    navigate('ambulance-home');
  };

  window.openForgotNotice = () => {
    const content = `
      <div class="forgot-modal-box">
        <div style="margin-bottom:12px;display:flex;justify-content:center;color:var(--primary);">${uiIcon('key', { size: 36, strokeWidth: 1.8 })}</div>
        <h3 class="modal-title mb-2">Account Password Reset</h3>
        <p class="forgot-modal-desc">
          In development demo mode, your account credentials are encrypted and stored in local client storage. If you forgot your password, you can register a new test account with your email or contact support.
        </p>
        <button class="btn btn-primary btn-full" onclick="closeModal()">Understood</button>
      </div>
    `;
    showModal(content);
  };
}
