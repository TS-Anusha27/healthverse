// HealthVerse — Login / Register Screen with Real Supabase Auth (Email, Phone, OTP, Password Reset)
import { navigate } from '../../routes/router.js';
import { store } from '../../store/store.js';
import { showToast, showModal, closeModal } from '../../utils/utils.js';
import { signUpUser, signInUser, sendOtpCode, verifyOtpCode, resetPasswordForEmail } from '../../services/supabase/auth.js';

export function renderLogin() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="screen" id="login-screen" style="min-height:100dvh;background:var(--surface);overflow:hidden;">
      <!-- Hero Section -->
      <div class="login-hero">
        <div class="login-hero-bg">
          <div class="hero-orb hero-orb-1"></div>
          <div class="hero-orb hero-orb-2"></div>
          <div class="hero-orb hero-orb-3"></div>
        </div>
        <div class="login-hero-content animate-slide-up">
          <div class="login-logo-mark">
            <svg width="38" height="38" viewBox="0 0 52 52" fill="none">
              <path d="M26 8C26 8 14 14 14 26C14 32 17.5 37 23 40L26 42L29 40C34.5 37 38 32 38 26C38 14 26 8 26 8Z" fill="white" fill-opacity="0.95"/>
              <path d="M22 26H30M26 22V30" stroke="#4A90D9" stroke-width="2.5" stroke-linecap="round"/>
            </svg>
          </div>
          <h1 class="login-brand">HealthVerse</h1>
          <p class="login-tagline">A Complete Healthcare Universe</p>
        </div>
      </div>

      <!-- Card Panel -->
      <div class="login-panel animate-slide-up" style="animation-delay:0.15s;">
        <!-- Tabs -->
        <div class="login-tabs" id="login-tabs">
          <button class="login-tab active" id="tab-login" onclick="switchTab('login')">Sign In</button>
          <button class="login-tab" id="tab-register" onclick="switchTab('register')">Register</button>
        </div>

        <!-- Sign In Form -->
        <div id="form-login">
          <div class="form-group mt-4">
            <label class="form-label">Email Address</label>
            <div class="input-group">
              <span class="input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </span>
              <input type="email" class="form-input" id="login-email" placeholder="user@example.com" />
            </div>
          </div>
          <div class="form-group mt-3">
            <label class="form-label">Password</label>
            <div class="input-group">
              <span class="input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </span>
              <input type="password" class="form-input" id="login-password" placeholder="Enter your password" />
              <span class="input-suffix" id="toggle-pwd" onclick="togglePwd()">
                <svg id="eye-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </span>
            </div>
          </div>
          <div class="flex justify-end mt-2">
            <span class="section-link" style="font-size:13px;" onclick="showForgotPassword()">Forgot Password?</span>
          </div>
          <button class="btn btn-primary btn-full mt-4" onclick="handleLogin()" id="login-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
            Sign In with Supabase
          </button>

          <!-- OTP Sign In Button -->
          <div class="divider-text mt-5">or authenticate with</div>
          <div style="margin-top:16px;">
            <button class="btn btn-outline btn-full" onclick="openOtpModal()" style="display:flex;align-items:center;justify-content:center;gap:8px;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
              Sign In with OTP (Email / Phone)
            </button>
          </div>
        </div>

        <!-- Register Form -->
        <div id="form-register" class="hidden">
          <div class="form-group mt-4">
            <label class="form-label">Full Name *</label>
            <div class="input-group">
              <span class="input-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></span>
              <input type="text" class="form-input" id="reg-name" placeholder="Your full name" />
            </div>
          </div>
          <div class="form-group mt-3">
            <label class="form-label">Account Role *</label>
            <select id="reg-role" class="form-input form-select">
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
              <option value="ambulance">Ambulance Driver</option>
            </select>
          </div>
          <div class="form-group mt-3">
            <label class="form-label">Email Address *</label>
            <div class="input-group">
              <span class="input-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></span>
              <input type="email" class="form-input" id="reg-email" placeholder="your@email.com" />
            </div>
          </div>
          <div class="form-group mt-3">
            <label class="form-label">Phone Number (Optional)</label>
            <div class="input-group">
              <span class="input-icon" style="font-size:13px;font-weight:600;color:var(--text-secondary);left:12px;">+91</span>
              <input type="tel" class="form-input" id="reg-phone" placeholder="9876543210" style="padding-left:52px;" />
            </div>
          </div>
          <div class="form-group mt-3">
            <label class="form-label">Password *</label>
            <div class="input-group">
              <span class="input-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span>
              <input type="password" class="form-input" id="reg-password" placeholder="Min 6 characters" />
            </div>
          </div>
          <div style="background:var(--primary-light);border-radius:10px;padding:12px 14px;margin-top:14px;font-size:12px;color:var(--primary);display:flex;align-items:flex-start;gap:8px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;margin-top:1px;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            Registered instantly in Supabase Auth (Authentication → Users) & Database Profiles.
          </div>
          <button class="btn btn-primary btn-full mt-4" onclick="handleRegister()" id="register-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
            Create Supabase Account
          </button>
        </div>
      </div>
    </div>
  `;

  injectLoginStyles();
  initLoginHandlers();
}

function injectLoginStyles() {
  if (document.getElementById('login-styles')) return;
  const s = document.createElement('style');
  s.id = 'login-styles';
  s.textContent = `
    .login-hero {
      height: 240px;
      background: linear-gradient(160deg, #1A2332 0%, #1E3A5F 50%, #0D4F3C 100%);
      display: flex; align-items: center; justify-content: center;
      position: relative; overflow: hidden;
    }
    .login-hero-bg { position:absolute;inset:0;pointer-events:none; }
    .hero-orb { position:absolute;border-radius:50%;filter:blur(50px);opacity:0.2; }
    .hero-orb-1 { width:220px;height:220px;background:var(--primary);top:-60px;right:-40px; }
    .hero-orb-2 { width:180px;height:180px;background:var(--secondary);bottom:-40px;left:-30px; }
    .hero-orb-3 { width:140px;height:140px;background:var(--accent);top:50%;left:50%;transform:translate(-50%,-50%); }
    .login-hero-content { text-align:center;z-index:1;display:flex;flex-direction:column;align-items:center;gap:12px; }
    .login-logo-mark {
      width:60px;height:60px;background:rgba(255,255,255,0.12);
      border-radius:18px;display:flex;align-items:center;justify-content:center;
      backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.2);
    }
    .login-brand { font-family:var(--font-display);font-size:28px;font-weight:800;color:white;letter-spacing:-0.5px; }
    .login-tagline { font-size:13px;color:rgba(255,255,255,0.65);letter-spacing:0.5px; }
    .login-panel {
      background:var(--surface);
      border-radius:28px 28px 0 0;
      margin-top:-24px;
      padding:24px 24px 40px;
      min-height:calc(100dvh - 216px);
      box-shadow:0 -8px 30px rgba(26,35,50,0.12);
    }
    .login-tabs { display:flex;background:var(--surface-dim);border-radius:14px;padding:4px;gap:4px; }
    .login-tab {
      flex:1;padding:11px;font-family:var(--font-display);font-size:14px;font-weight:600;
      border:none;background:transparent;color:var(--text-secondary);border-radius:10px;
      cursor:pointer;transition:all var(--transition-normal);
    }
    .login-tab.active { background:var(--surface);color:var(--primary);box-shadow:var(--shadow-sm); }
  `;
  document.head.appendChild(s);
}

function initLoginHandlers() {
  window.switchTab = (tab) => {
    document.getElementById('form-login').classList.toggle('hidden', tab !== 'login');
    document.getElementById('form-register').classList.toggle('hidden', tab !== 'register');
    document.getElementById('tab-login').classList.toggle('active', tab === 'login');
    document.getElementById('tab-register').classList.toggle('active', tab === 'register');
  };

  window.togglePwd = () => {
    const input = document.getElementById('login-password');
    input.type = input.type === 'password' ? 'text' : 'password';
  };

  window.handleLogin = async () => {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const btn = document.getElementById('login-btn');

    if (!email || !email.includes('@')) { showToast('Please enter a valid email address', 'error'); return; }
    if (!password) { showToast('Please enter your password', 'error'); return; }

    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="animate-spin" style="display:inline-block;width:18px;height:18px;border:2px solid rgba(255,255,255,0.3);border-top-color:white;border-radius:50%;"></span> Verifying with Supabase...';
    btn.disabled = true;

    const { user, session, error } = await signInUser({ email, password });

    btn.disabled = false;
    btn.innerHTML = originalText;

    if (error) {
      showToast(error, 'error');
      return;
    }

    showToast('Signed in successfully via Supabase Auth! 👋', 'success');
    const metadata = user?.user_metadata || {};
    const role = metadata.role || 'patient';
    store.setUser({ id: user.id, name: metadata.full_name || email.split('@')[0], email: user.email, phone: user.phone }, role);

    redirectUserByRole(role);
  };

  window.handleRegister = async () => {
    const name = document.getElementById('reg-name').value.trim();
    const role = document.getElementById('reg-role').value;
    const email = document.getElementById('reg-email').value.trim();
    const phone = document.getElementById('reg-phone').value.trim();
    const password = document.getElementById('reg-password').value;
    const btn = document.getElementById('register-btn');

    if (!name) { showToast('Please enter your full name', 'error'); return; }
    if (!email || !email.includes('@')) { showToast('Please enter a valid email address', 'error'); return; }
    if (!password || password.length < 6) { showToast('Password must be at least 6 characters', 'error'); return; }

    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="animate-spin" style="display:inline-block;width:18px;height:18px;border:2px solid rgba(255,255,255,0.3);border-top-color:white;border-radius:50%;"></span> Registering in Supabase...';
    btn.disabled = true;

    const { user, error } = await signUpUser({
      email,
      password,
      fullName: name,
      phone: phone ? '+91 ' + phone : null,
      role: role
    });

    btn.disabled = false;
    btn.innerHTML = originalText;

    if (error) {
      showToast(error, 'error');
      return;
    }

    showToast('Registered in Supabase Auth! 🎉 Check Authentication → Users.', 'success', 5000);
    const newUser = { id: user?.id || Date.now().toString(), name, email, phone: phone ? '+91 ' + phone : null };
    store.setUser(newUser, role);

    redirectUserByRole(role);
  };

  window.openOtpModal = () => {
    const content = `
      <div style="padding:16px;">
        <h3 class="text-h2 text-center" style="margin-bottom:6px;">Supabase OTP Auth</h3>
        <p class="text-caption text-center" style="margin-bottom:16px;">Send verification code via Email or Phone</p>
        
        <div class="form-group mb-3">
          <label class="form-label">Role</label>
          <select id="otp-role" class="form-input form-select">
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
            <option value="ambulance">Ambulance Driver</option>
          </select>
        </div>

        <div class="form-group mb-3">
          <label class="form-label">Email or Phone Number (+91)</label>
          <input type="text" id="otp-contact" class="form-input" placeholder="e.g. user@example.com or +919876543210" />
        </div>

        <div id="otp-code-group" class="form-group mt-3 hidden">
          <label class="form-label">6-digit Verification Code</label>
          <input type="text" id="otp-token" class="form-input" placeholder="123456" maxlength="6" style="letter-spacing:4px;font-weight:700;text-align:center;" />
        </div>

        <button id="otp-send-btn" class="btn btn-primary btn-full mt-4" onclick="handleSendOtp()">
          Send OTP Code
        </button>
        <button id="otp-verify-btn" class="btn btn-success btn-full mt-4 hidden" onclick="handleVerifyOtp()">
          Verify & Log In
        </button>
      </div>
    `;

    showModal(content);

    window.handleSendOtp = async () => {
      const contact = document.getElementById('otp-contact').value.trim();
      const role = document.getElementById('otp-role').value;
      if (!contact) { showToast('Please enter email or phone number', 'error'); return; }

      const isPhone = contact.startsWith('+') || /^\d{10}$/.test(contact);
      const btn = document.getElementById('otp-send-btn');
      btn.innerHTML = '<span class="animate-spin" style="display:inline-block;width:16px;height:16px;border:2px solid white;border-top-color:transparent;border-radius:50%;"></span> Sending OTP...';
      btn.disabled = true;

      const { error } = await sendOtpCode({ contact, isPhone, role });

      btn.disabled = false;
      btn.innerHTML = 'Send OTP Code';

      if (error) {
        if (isPhone && (error.includes('provider') || error.includes('SMS'))) {
          showToast('SMS Provider not enabled in Supabase yet. Please use Email OTP for testing!', 'warning', 6000);
        } else {
          showToast(error, 'error');
        }
      } else {
        showToast('OTP sent successfully via Supabase!', 'success');
        document.getElementById('otp-code-group').classList.remove('hidden');
        document.getElementById('otp-send-btn').classList.add('hidden');
        document.getElementById('otp-verify-btn').classList.remove('hidden');
      }
    };

    window.handleVerifyOtp = async () => {
      const contact = document.getElementById('otp-contact').value.trim();
      const token = document.getElementById('otp-token').value.trim();
      const role = document.getElementById('otp-role').value;
      if (!token || token.length < 4) { showToast('Please enter the verification code', 'error'); return; }

      const isPhone = contact.startsWith('+') || /^\d{10}$/.test(contact);
      const btn = document.getElementById('otp-verify-btn');
      btn.innerHTML = '<span class="animate-spin" style="display:inline-block;width:16px;height:16px;border:2px solid white;border-top-color:transparent;border-radius:50%;"></span> Verifying...';
      btn.disabled = true;

      const { user, error } = await verifyOtpCode({ contact, token, isPhone, role });

      btn.disabled = false;
      btn.innerHTML = 'Verify & Log In';

      if (error) {
        showToast(error, 'error');
        return;
      }

      showToast('OTP Verified! Authenticated with Supabase 🎉', 'success');
      closeModal();
      store.setUser({ id: user.id, name: user.user_metadata?.full_name || contact.split('@')[0], email: user.email, phone: user.phone }, role);
      redirectUserByRole(role);
    };
  };

  window.showForgotPassword = () => {
    const content = `
      <div style="padding:16px;">
        <h3 class="text-h2 text-center" style="margin-bottom:8px;">Reset Password</h3>
        <p class="text-caption text-center" style="margin-bottom:20px;">Enter your email to receive a password reset link via Supabase</p>
        <div class="form-group">
          <label class="form-label">Email Address</label>
          <input type="email" id="reset-email" class="form-input" placeholder="user@example.com" />
        </div>
        <button class="btn btn-primary btn-full mt-4" id="reset-btn" onclick="handleResetPassword()">
          Send Password Reset Email
        </button>
      </div>
    `;
    showModal(content);

    window.handleResetPassword = async () => {
      const email = document.getElementById('reset-email').value.trim();
      if (!email || !email.includes('@')) { showToast('Please enter a valid email', 'error'); return; }
      
      const btn = document.getElementById('reset-btn');
      btn.innerHTML = '<span class="animate-spin" style="display:inline-block;width:16px;height:16px;border:2px solid white;border-top-color:transparent;border-radius:50%;"></span> Sending link...';
      btn.disabled = true;

      const { error } = await resetPasswordForEmail(email);

      btn.disabled = false;
      btn.innerHTML = 'Send Password Reset Email';

      if (error) {
        showToast(error, 'error');
      } else {
        showToast('Password reset link sent to your email address via Supabase!', 'success', 5000);
        closeModal();
      }
    };
  };
}

function redirectUserByRole(role) {
  if (role === 'doctor') navigate('doctor-home');
  else if (role === 'ambulance') navigate('ambulance-home');
  else navigate('patient-home');
}
