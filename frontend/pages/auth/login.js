// HealthVerse — Unified Multi-Profile Login & Authentication
// Supports 3 Distinct Roles: User (Patient), Doctor, Ambulance Driver
import { navigate } from '../../routes/router.js';
import { store } from '../../store/store.js';
import { showToast, showModal, closeModal } from '../../utils/utils.js';
import { signInUserFirebase, signUpUserFirebase, sendPasswordResetFirebase, isFirebaseConfigured } from '../../services/firebase/auth.js';
import { getActiveFirebaseConfig, saveFirebaseConfig } from '../../services/firebase/config.js';

let activeRole = 'patient'; // 'patient' | 'doctor' | 'ambulance'
let isRegisterMode = false;

export function renderLogin() {
  const app = document.getElementById('app');
  
  // Retrieve last selected role or saved credentials
  const lastRole = localStorage.getItem('hv_last_role') || 'patient';
  activeRole = lastRole;
  const savedCreds = store.getSavedCredentials(activeRole);

  app.innerHTML = `
    <div class="screen" id="login-screen" style="min-height:100dvh;background:var(--bg);overflow-x:hidden;">
      <!-- Hero Banner -->
      <div class="login-hero">
        <div class="login-hero-bg">
          <div class="hero-orb hero-orb-1"></div>
          <div class="hero-orb hero-orb-2"></div>
          <div class="hero-orb hero-orb-3"></div>
        </div>
        
        <div class="login-hero-content animate-slide-up">
          <div class="flex items-center justify-between w-full" style="max-width:440px;padding:0 12px;margin-bottom:8px;">
            <div class="firebase-status-pill" onclick="openFirebaseConfigModal()" title="Click to view/link Firebase setup">
              <span class="status-dot ${isFirebaseConfigured() ? 'dot-active' : 'dot-pending'}"></span>
              <span style="font-size:11px;font-weight:700;">${isFirebaseConfigured() ? '🔥 Firebase Connected' : '🔥 Firebase Ready'}</span>
            </div>
            <button class="btn btn-xs btn-ghost text-white" onclick="openFirebaseConfigModal()" style="font-size:11px;opacity:0.85;border:1px solid rgba(255,255,255,0.25);border-radius:12px;padding:4px 10px;">
              ⚙️ Firebase Setup
            </button>
          </div>

          <div class="login-logo-mark">
            <svg width="42" height="42" viewBox="0 0 52 52" fill="none">
              <path d="M26 8C26 8 14 14 14 26C14 32 17.5 37 23 40L26 42L29 40C34.5 37 38 32 38 26C38 14 26 8 26 8Z" fill="white" fill-opacity="0.95"/>
              <path d="M22 26H30M26 22V30" stroke="#4A90D9" stroke-width="2.8" stroke-linecap="round"/>
            </svg>
          </div>
          <h1 class="login-brand">HealthVerse</h1>
          <p class="login-tagline">A Complete Healthcare Universe</p>
        </div>
      </div>

      <!-- Main Login Container -->
      <div class="login-panel animate-slide-up" style="animation-delay:0.1s;">
        <!-- 3-Profile Account Type Selector -->
        <div class="profile-type-section mb-4">
          <div class="profile-type-header">
            <span class="profile-type-title">Choose Account Type</span>
            <span class="profile-type-hint" id="role-hint-badge">Patient Profile</span>
          </div>

          <div class="profile-grid">
            <!-- 1. Patient / User Profile -->
            <div class="profile-card ${activeRole === 'patient' ? 'active-patient' : ''}" id="role-card-patient" onclick="selectRole('patient')">
              <div class="profile-card-icon icon-patient">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <div class="profile-card-body">
                <div class="profile-card-name">User / Patient</div>
                <div class="profile-card-desc">Appointments & Care</div>
              </div>
              <div class="profile-card-check">✓</div>
            </div>

            <!-- 2. Doctor Profile -->
            <div class="profile-card ${activeRole === 'doctor' ? 'active-doctor' : ''}" id="role-card-doctor" onclick="selectRole('doctor')">
              <div class="profile-card-icon icon-doctor">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
              </div>
              <div class="profile-card-body">
                <div class="profile-card-name">Doctor</div>
                <div class="profile-card-desc">Triage & Verification</div>
              </div>
              <div class="profile-card-check">✓</div>
            </div>

            <!-- 3. Ambulance Driver Profile -->
            <div class="profile-card ${activeRole === 'ambulance' ? 'active-ambulance' : ''}" id="role-card-ambulance" onclick="selectRole('ambulance')">
              <div class="profile-card-icon icon-ambulance">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
                </svg>
              </div>
              <div class="profile-card-body">
                <div class="profile-card-name">Ambulance</div>
                <div class="profile-card-desc">Vehicle & Dispatch</div>
              </div>
              <div class="profile-card-check">✓</div>
            </div>
          </div>
        </div>

        <!-- Role Context Banner -->
        <div class="role-context-banner" id="role-context-banner">
          <div class="banner-icon" id="banner-icon">👤</div>
          <div class="banner-text" id="banner-text">
            <strong>Patient Access:</strong> Manage your consultations, digital health records, and AI symptom checks.
          </div>
        </div>

        <!-- Mode Toggle Tabs (Sign In / Sign Up) -->
        <div class="login-tabs mt-3">
          <button class="login-tab active" id="tab-login" onclick="switchMode(false)">Sign In</button>
          <button class="login-tab" id="tab-register" onclick="switchMode(true)">Create Account</button>
        </div>

        <!-- Dynamic Form -->
        <form id="auth-form" onsubmit="event.preventDefault(); handleAuthSubmit();">
          <!-- Full Name (Only for Registration) -->
          <div class="form-group mt-4 ${isRegisterMode ? '' : 'hidden'}" id="group-fullname">
            <label class="form-label" id="label-fullname">Full Name *</label>
            <div class="input-group">
              <span class="input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </span>
              <input type="text" class="form-input" id="auth-fullname" placeholder="Enter your legal full name" />
            </div>
          </div>

          <!-- Gmail / Email Field -->
          <div class="form-group mt-3">
            <label class="form-label" id="label-email">Gmail / Email Address *</label>
            <div class="input-group">
              <span class="input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </span>
              <input type="email" class="form-input" id="auth-email" placeholder="name@gmail.com" value="${savedCreds?.email || ''}" required autocomplete="email" />
            </div>
          </div>

          <!-- Unique Password Field -->
          <div class="form-group mt-3">
            <label class="form-label" id="label-password">Unique Password *</label>
            <div class="input-group">
              <span class="input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </span>
              <input type="password" class="form-input" id="auth-password" placeholder="Enter your unique password" value="${savedCreds?.password || ''}" required autocomplete="current-password" />
              <span class="input-suffix" id="toggle-pwd" onclick="togglePasswordVisibility()" title="Show/Hide Password">
                <svg id="eye-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </span>
            </div>
          </div>

          <!-- Save this info for later Checkbox -->
          <div class="flex items-center justify-between mt-3">
            <label class="checkbox-container">
              <input type="checkbox" id="save-info-checkbox" ${savedCreds ? 'checked' : 'checked'} />
              <span class="checkmark"></span>
              <span class="checkbox-label">Save this info for later</span>
            </label>
            <span class="section-link ${isRegisterMode ? 'hidden' : ''}" id="btn-forgot-pwd" style="font-size:12px;" onclick="showForgotPasswordModal()">Forgot Password?</span>
          </div>

          <!-- Primary Submit Button -->
          <button class="btn btn-primary btn-full mt-4" type="submit" id="auth-submit-btn">
            <span id="btn-submit-text">Sign In as Patient</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </form>

        <!-- Quick 1-Click Demo Profiles (For Instant Verification & Testing) -->
        <div class="divider-text mt-4"><span>Quick Demo 1-Click Access</span></div>
        <div class="quick-demo-grid mt-3">
          <button class="quick-demo-btn demo-btn-patient" onclick="fillDemoAndLogin('patient')">
            <span>👤</span>
            <div>
              <strong>Demo Patient</strong>
              <small>aarav@healthverse.com</small>
            </div>
          </button>
          <button class="quick-demo-btn demo-btn-doctor" onclick="fillDemoAndLogin('doctor')">
            <span>🩺</span>
            <div>
              <strong>Demo Doctor</strong>
              <small>Dr. Priya (Apollo)</small>
            </div>
          </button>
          <button class="quick-demo-btn demo-btn-ambulance" onclick="fillDemoAndLogin('ambulance')">
            <span>🚑</span>
            <div>
              <strong>Demo Ambulance</strong>
              <small>Ravi (TN 07 HV)</small>
            </div>
          </button>
        </div>

        <!-- Footer / Security Note -->
        <div class="auth-security-note mt-4">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <span>Unified HealthVerse security with Firebase Auth & Firestore sync</span>
        </div>
      </div>
    </div>
  `;

  injectLoginStyles();
  initLoginHandlers();
  updateRoleUI(activeRole);
}

function updateRoleUI(role) {
  activeRole = role;
  localStorage.setItem('hv_last_role', role);

  // Update card highlights
  const cards = {
    patient: document.getElementById('role-card-patient'),
    doctor: document.getElementById('role-card-doctor'),
    ambulance: document.getElementById('role-card-ambulance')
  };

  Object.entries(cards).forEach(([key, el]) => {
    if (!el) return;
    el.classList.remove('active-patient', 'active-doctor', 'active-ambulance');
    if (key === role) {
      el.classList.add(`active-${role}`);
    }
  });

  // Update labels & banner
  const bannerIcon = document.getElementById('banner-icon');
  const bannerText = document.getElementById('banner-text');
  const roleHint = document.getElementById('role-hint-badge');
  const submitText = document.getElementById('btn-submit-text');
  const emailInput = document.getElementById('auth-email');
  const submitBtn = document.getElementById('auth-submit-btn');

  // Load saved credentials for this role if any
  const saved = store.getSavedCredentials(role);
  if (saved) {
    if (emailInput && !emailInput.value) emailInput.value = saved.email;
    const pwdInput = document.getElementById('auth-password');
    if (pwdInput && !pwdInput.value) pwdInput.value = saved.password;
  }

  if (role === 'patient') {
    if (roleHint) roleHint.innerText = 'Patient Profile';
    if (roleHint) roleHint.style.color = 'var(--primary)';
    if (bannerIcon) bannerIcon.innerHTML = '👤';
    if (bannerText) bannerText.innerHTML = '<strong>Patient Access:</strong> Manage consultations, digital health records, and AI symptom checks.';
    if (emailInput && !emailInput.value) emailInput.placeholder = 'patient@gmail.com';
    if (submitBtn) submitBtn.className = 'btn btn-primary btn-full mt-4';
    if (submitText) submitText.innerText = isRegisterMode ? 'Create Patient Account' : 'Sign In as Patient';
  } else if (role === 'doctor') {
    if (roleHint) roleHint.innerText = 'Doctor Profile';
    if (roleHint) roleHint.style.color = 'var(--secondary)';
    if (bannerIcon) bannerIcon.innerHTML = '🩺';
    if (bannerText) bannerText.innerHTML = '<strong>Doctor Access:</strong> Clinical triage queue, verified hospital practice & patient summary.';
    if (emailInput && !emailInput.value) emailInput.placeholder = 'doctor.work@hospital.org';
    if (submitBtn) submitBtn.className = 'btn btn-secondary btn-full mt-4';
    if (submitText) submitText.innerText = isRegisterMode ? 'Register Doctor Profile' : 'Sign In as Doctor';
  } else if (role === 'ambulance') {
    if (roleHint) roleHint.innerText = 'Ambulance Driver Profile';
    if (roleHint) roleHint.style.color = 'var(--emergency)';
    if (bannerIcon) bannerIcon.innerHTML = '🚑';
    if (bannerText) bannerText.innerHTML = '<strong>Ambulance Access:</strong> Emergency dispatch fleet, live GPS route & hospital destination.';
    if (emailInput && !emailInput.value) emailInput.placeholder = 'driver.fleet@emergency.org';
    if (submitBtn) submitBtn.className = 'btn btn-emergency btn-full mt-4';
    if (submitText) submitText.innerText = isRegisterMode ? 'Register Ambulance Driver' : 'Sign In as Ambulance Driver';
  }
}

function initLoginHandlers() {
  window.selectRole = (role) => {
    updateRoleUI(role);
  };

  window.switchMode = (registerMode) => {
    isRegisterMode = registerMode;
    document.getElementById('tab-login')?.classList.toggle('active', !registerMode);
    document.getElementById('tab-register')?.classList.toggle('active', registerMode);
    document.getElementById('group-fullname')?.classList.toggle('hidden', !registerMode);
    document.getElementById('btn-forgot-pwd')?.classList.toggle('hidden', registerMode);
    updateRoleUI(activeRole);
  };

  window.togglePasswordVisibility = () => {
    const input = document.getElementById('auth-password');
    if (!input) return;
    input.type = input.type === 'password' ? 'text' : 'password';
  };

  window.fillDemoAndLogin = (role) => {
    updateRoleUI(role);
    const emailInput = document.getElementById('auth-email');
    const pwdInput = document.getElementById('auth-password');
    const nameInput = document.getElementById('auth-fullname');

    if (role === 'patient') {
      emailInput.value = 'aarav.patel@healthverse.com';
      pwdInput.value = 'health@2026';
      if (nameInput) nameInput.value = 'Aarav Patel';
    } else if (role === 'doctor') {
      emailInput.value = 'priya.k@apollo.healthverse.com';
      pwdInput.value = 'doctor@2026';
      if (nameInput) nameInput.value = 'Dr. Priya Krishnamurthy';
    } else if (role === 'ambulance') {
      emailInput.value = 'ravi.driver@lifeline.healthverse.com';
      pwdInput.value = 'driver@2026';
      if (nameInput) nameInput.value = 'Ravi Kumar';
    }

    handleAuthSubmit();
  };

  window.handleAuthSubmit = async () => {
    const email = document.getElementById('auth-email')?.value.trim();
    const password = document.getElementById('auth-password')?.value;
    const fullName = document.getElementById('auth-fullname')?.value.trim();
    const saveInfo = document.getElementById('save-info-checkbox')?.checked;
    const submitBtn = document.getElementById('auth-submit-btn');
    const submitText = document.getElementById('btn-submit-text');

    if (!email || !email.includes('@')) {
      showToast('Please enter a valid Gmail / Email address', 'error');
      return;
    }

    if (!password || password.length < 4) {
      showToast('Please enter your unique password (min 4 characters)', 'error');
      return;
    }

    if (isRegisterMode && !fullName) {
      showToast('Please enter your full name to create an account', 'error');
      return;
    }

    // Button loading state
    const originalText = submitText.innerText;
    submitText.innerHTML = `<span class="animate-spin" style="display:inline-block;width:16px;height:16px;border:2px solid rgba(255,255,255,0.3);border-top-color:white;border-radius:50%;margin-right:8px;"></span> Authenticating...`;
    submitBtn.disabled = true;

    try {
      let result;
      if (isRegisterMode) {
        result = await signUpUserFirebase({
          email,
          password,
          fullName,
          role: activeRole,
          metadata: { registeredAt: new Date().toISOString() }
        });
      } else {
        result = await signInUserFirebase({ email, password, role: activeRole });
      }

      submitBtn.disabled = false;
      submitText.innerText = originalText;

      if (result.error) {
        showToast(result.error, 'error');
        return;
      }

      // Handle "Save this info for later"
      store.saveCredentials(activeRole, email, password, saveInfo);

      // Set user in global store
      const userObj = result.user || {
        uid: Date.now().toString(),
        name: fullName || email.split('@')[0],
        email: email,
        role: activeRole
      };
      store.setUser(userObj, activeRole);

      showToast(`Welcome ${userObj.displayName || userObj.name || ''}! (${activeRole.toUpperCase()} PROFILE)`, 'success');

      // Navigate to role-specific entry point
      navigateRoleEntryPoint(activeRole);
    } catch (e) {
      submitBtn.disabled = false;
      submitText.innerText = originalText;
      showToast('Authentication error: ' + e.message, 'error');
    }
  };

  window.openFirebaseConfigModal = () => {
    const currentConfig = getActiveFirebaseConfig();
    const modalHtml = `
      <div style="padding:18px;">
        <div class="flex items-center gap-2 mb-2">
          <span style="font-size:24px;">🔥</span>
          <h3 class="text-h3" style="font-size:18px;margin:0;">Firebase Setup & Connection</h3>
        </div>
        <p class="text-caption mb-3" style="line-height:1.4;">
          Your Firebase configuration is integrated. Paste your Firebase project keys from the Firebase Console (Project Settings &rarr; General &rarr; Your apps) to sync directly with your cloud project.
        </p>

        <div class="form-group mb-2">
          <label class="form-label">API Key (apiKey)</label>
          <input type="text" id="fb-api-key" class="form-input text-xs" placeholder="AIzaSy..." value="${currentConfig.apiKey || ''}" />
        </div>

        <div class="form-group mb-2">
          <label class="form-label">Auth Domain (authDomain)</label>
          <input type="text" id="fb-auth-domain" class="form-input text-xs" placeholder="your-app.firebaseapp.com" value="${currentConfig.authDomain || ''}" />
        </div>

        <div class="form-group mb-2">
          <label class="form-label">Project ID (projectId)</label>
          <input type="text" id="fb-project-id" class="form-input text-xs" placeholder="your-app-id" value="${currentConfig.projectId || ''}" />
        </div>

        <div class="form-group mb-3">
          <label class="form-label">App ID (appId)</label>
          <input type="text" id="fb-app-id" class="form-input text-xs" placeholder="1:123456789:web:abcdef" value="${currentConfig.appId || ''}" />
        </div>

        <div class="flex gap-2 mt-4">
          <button class="btn btn-outline flex-1" onclick="closeModal()">Close</button>
          <button class="btn btn-primary flex-1" onclick="handleSaveFirebaseConfig()">Save & Connect</button>
        </div>
      </div>
    `;

    showModal(modalHtml);

    window.handleSaveFirebaseConfig = () => {
      const apiKey = document.getElementById('fb-api-key')?.value.trim();
      const authDomain = document.getElementById('fb-auth-domain')?.value.trim();
      const projectId = document.getElementById('fb-project-id')?.value.trim();
      const appId = document.getElementById('fb-app-id')?.value.trim();

      const newConfig = {
        apiKey,
        authDomain,
        projectId,
        appId,
        storageBucket: projectId ? `${projectId}.appspot.com` : '',
        messagingSenderId: ''
      };

      saveFirebaseConfig(newConfig);
      closeModal();
      showToast('Firebase configuration saved successfully! 🔥', 'success');
      renderLogin();
    };
  };

  window.showForgotPasswordModal = () => {
    const modalHtml = `
      <div style="padding:18px;">
        <h3 class="text-h3 text-center mb-1">Reset Password</h3>
        <p class="text-caption text-center mb-3">Enter your Gmail / Email to receive reset instructions</p>
        <div class="form-group mb-3">
          <label class="form-label">Gmail / Email Address</label>
          <input type="email" id="reset-modal-email" class="form-input" placeholder="name@gmail.com" value="${document.getElementById('auth-email')?.value || ''}" />
        </div>
        <button class="btn btn-primary btn-full" onclick="handleSendPasswordReset()">Send Reset Email</button>
      </div>
    `;
    showModal(modalHtml);

    window.handleSendPasswordReset = async () => {
      const email = document.getElementById('reset-modal-email')?.value.trim();
      if (!email || !email.includes('@')) {
        showToast('Please enter a valid email address', 'error');
        return;
      }
      closeModal();
      const res = await sendPasswordResetFirebase(email);
      showToast(res.message || 'Password reset link sent to ' + email, 'success');
    };
  };
}

function navigateRoleEntryPoint(role) {
  if (role === 'doctor') {
    // If doctor profile is not yet completed/verified, open doctor-setup, otherwise doctor-home
    const docProfile = store.doctor;
    if (!docProfile || !docProfile.hospital || !docProfile.isVerified) {
      navigate('doctor-setup');
    } else {
      navigate('doctor-home');
    }
  } else if (role === 'ambulance') {
    // If ambulance driver vehicle not registered, open ambulance-setup, otherwise ambulance-home
    const driverProfile = store.driver;
    if (!driverProfile || !driverProfile.vehicleNumber || !driverProfile.isVerified) {
      navigate('ambulance-setup');
    } else {
      navigate('ambulance-home');
    }
  } else {
    // Patient profile
    navigate('patient-home');
  }
}

function injectLoginStyles() {
  if (document.getElementById('hv-login-styles')) return;
  const s = document.createElement('style');
  s.id = 'hv-login-styles';
  s.textContent = `
    .login-hero {
      height: 240px;
      background: linear-gradient(160deg, #0F172A 0%, #1E3A5F 55%, #0D4F3C 100%);
      display: flex; align-items: center; justify-content: center;
      position: relative; overflow: hidden;
    }
    .login-hero-bg { position:absolute;inset:0;pointer-events:none; }
    .hero-orb { position:absolute;border-radius:50%;filter:blur(60px);opacity:0.25; }
    .hero-orb-1 { width:220px;height:220px;background:var(--primary);top:-50px;right:-30px; }
    .hero-orb-2 { width:200px;height:200px;background:var(--secondary);bottom:-40px;left:-40px; }
    .hero-orb-3 { width:150px;height:150px;background:var(--emergency);top:40%;left:45%;transform:translate(-50%,-50%);opacity:0.18; }
    .login-hero-content { width:100%;text-align:center;z-index:2;display:flex;flex-direction:column;align-items:center;gap:8px;padding-top:12px; }
    .firebase-status-pill {
      background:rgba(255,255,255,0.14);backdrop-filter:blur(8px);
      border:1px solid rgba(255,255,255,0.2);border-radius:20px;
      padding:4px 12px;display:flex;align-items:center;gap:6px;color:white;cursor:pointer;
      transition:all var(--transition-fast);
    }
    .firebase-status-pill:hover { background:rgba(255,255,255,0.22); }
    .status-dot { width:8px;height:8px;border-radius:50%; }
    .dot-active { background:#2ED573;box-shadow:0 0 8px #2ED573; }
    .dot-pending { background:#FFA502;box-shadow:0 0 8px #FFA502; }
    .login-logo-mark {
      width:64px;height:64px;background:rgba(255,255,255,0.12);
      border-radius:20px;display:flex;align-items:center;justify-content:center;
      backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.25);
      box-shadow:0 8px 24px rgba(0,0,0,0.2);
    }
    .login-brand { font-family:var(--font-display);font-size:28px;font-weight:800;color:white;letter-spacing:-0.5px;margin:2px 0 0; }
    .login-tagline { font-size:12px;color:rgba(255,255,255,0.7);letter-spacing:0.5px;margin:0; }
    
    .login-panel {
      background:var(--surface);
      border-radius:28px 28px 0 0;
      margin-top:-24px;
      padding:24px 20px 48px;
      min-height:calc(100dvh - 216px);
      box-shadow:0 -8px 32px rgba(15,23,42,0.15);
      max-width:540px;margin-left:auto;margin-right:auto;
    }

    /* 3-Profile Selector */
    .profile-type-header { display:flex;justify-content:space-between;align-items:center;margin-bottom:12px; }
    .profile-type-title { font-family:var(--font-display);font-size:14px;font-weight:700;color:var(--text-primary); }
    .profile-type-hint { font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px; }

    .profile-grid { display:grid;grid-template-columns:repeat(3, 1fr);gap:10px; }
    .profile-card {
      background:var(--surface-dim);border:2px solid var(--border);border-radius:16px;
      padding:12px 8px;text-align:center;cursor:pointer;position:relative;
      display:flex;flex-direction:column;align-items:center;gap:6px;
      transition:all var(--transition-normal);
    }
    .profile-card:hover { transform:translateY(-2px);box-shadow:var(--shadow-sm); }
    .profile-card-icon {
      width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;
      transition:all var(--transition-fast);
    }
    .icon-patient { background:var(--primary-light);color:var(--primary); }
    .icon-doctor { background:var(--secondary-light);color:var(--secondary); }
    .icon-ambulance { background:var(--emergency-light);color:var(--emergency); }

    .profile-card-name { font-family:var(--font-display);font-size:12px;font-weight:700;color:var(--text-primary);line-height:1.2; }
    .profile-card-desc { font-size:10px;color:var(--text-tertiary);line-height:1.2; }
    .profile-card-check {
      position:absolute;top:6px;right:6px;width:16px;height:16px;border-radius:50%;
      background:var(--primary);color:white;font-size:10px;font-weight:800;
      display:none;align-items:center;justify-content:center;
    }

    /* Active Role Highlights */
    .profile-card.active-patient {
      border-color:var(--primary);background:var(--primary-light);box-shadow:var(--shadow-primary);
    }
    .profile-card.active-patient .profile-card-check { display:flex;background:var(--primary); }
    
    .profile-card.active-doctor {
      border-color:var(--secondary);background:var(--secondary-light);box-shadow:var(--shadow-secondary);
    }
    .profile-card.active-doctor .profile-card-check { display:flex;background:var(--secondary); }
    
    .profile-card.active-ambulance {
      border-color:var(--emergency);background:var(--emergency-light);box-shadow:var(--shadow-emergency);
    }
    .profile-card.active-ambulance .profile-card-check { display:flex;background:var(--emergency); }

    /* Role Context Banner */
    .role-context-banner {
      background:var(--surface-dim);border:1px solid var(--border);border-radius:12px;
      padding:10px 14px;display:flex;align-items:center;gap:12px;margin-top:10px;
    }
    .banner-icon { font-size:22px;flex-shrink:0; }
    .banner-text { font-size:12px;color:var(--text-secondary);line-height:1.4; }

    /* Mode Tabs */
    .login-tabs { display:flex;background:var(--surface-dim);border-radius:12px;padding:3px;gap:4px; }
    .login-tab {
      flex:1;padding:10px;font-family:var(--font-display);font-size:13px;font-weight:700;
      border:none;background:transparent;color:var(--text-secondary);border-radius:10px;
      cursor:pointer;transition:all var(--transition-fast);
    }
    .login-tab.active { background:var(--surface);color:var(--text-primary);box-shadow:var(--shadow-xs); }

    /* Custom Checkbox */
    .checkbox-container {
      display:inline-flex;align-items:center;position:relative;cursor:pointer;
      user-select:none;font-size:13px;color:var(--text-secondary);font-weight:500;
    }
    .checkbox-container input { position:absolute;opacity:0;cursor:pointer;height:0;width:0; }
    .checkmark {
      width:18px;height:18px;border:2px solid var(--border);border-radius:5px;
      background:var(--surface);margin-right:8px;display:inline-block;position:relative;
      transition:all var(--transition-fast);
    }
    .checkbox-container input:checked ~ .checkmark { background:var(--primary);border-color:var(--primary); }
    .checkmark:after {
      content:'';position:absolute;display:none;left:5px;top:2px;width:4px;height:8px;
      border:solid white;border-width:0 2px 2px 0;transform:rotate(45deg);
    }
    .checkbox-container input:checked ~ .checkmark:after { display:block; }

    /* Quick Demo Buttons */
    .quick-demo-grid { display:grid;grid-template-columns:repeat(3, 1fr);gap:8px; }
    .quick-demo-btn {
      background:var(--surface-dim);border:1px solid var(--border);border-radius:12px;
      padding:10px 6px;display:flex;align-items:center;gap:6px;cursor:pointer;
      text-align:left;transition:all var(--transition-fast);
    }
    .quick-demo-btn:hover { background:var(--surface);border-color:var(--text-secondary);transform:translateY(-1px); }
    .quick-demo-btn span { font-size:18px; }
    .quick-demo-btn strong { display:block;font-size:11px;color:var(--text-primary); }
    .quick-demo-btn small { display:block;font-size:9px;color:var(--text-tertiary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }

    .auth-security-note {
      display:flex;align-items:center;justify-content:center;gap:6px;
      font-size:11px;color:var(--text-tertiary);text-align:center;
    }
  `;
  document.head.appendChild(s);
}
