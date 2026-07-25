// HealthVerse — Login / Register Screen
import { navigate } from '../router.js';
import { store } from '../store.js';
import { showToast } from '../utils.js';

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
            <label class="form-label">Email or Phone</label>
            <div class="input-group">
              <span class="input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </span>
              <input type="text" class="form-input" id="login-email" placeholder="Enter email or phone number" />
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
            Sign In
          </button>

          <!-- Social Login -->
          <div class="divider-text mt-5">or continue with</div>
          <div class="social-grid mt-4">
            <button class="social-btn" onclick="socialLogin('google')">
              <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Google
            </button>
            <button class="social-btn" onclick="socialLogin('apple')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
              Apple
            </button>
            <button class="social-btn" onclick="socialLogin('phone')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
              OTP
            </button>
            <button class="social-btn" onclick="socialLogin('biometric')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"/></svg>
              Face ID
            </button>
          </div>

          <div class="login-guest mt-4">
            <button class="btn btn-ghost btn-full" onclick="continueAsGuest()" style="font-size:14px;">
              Continue as Guest
            </button>
          </div>
        </div>

        <!-- Register Form -->
        <div id="form-register" class="hidden">
          <div class="form-group mt-4">
            <label class="form-label">Full Name</label>
            <div class="input-group">
              <span class="input-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></span>
              <input type="text" class="form-input" id="reg-name" placeholder="Your full name" />
            </div>
          </div>
          <div class="form-group mt-3">
            <label class="form-label">Email Address</label>
            <div class="input-group">
              <span class="input-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></span>
              <input type="email" class="form-input" id="reg-email" placeholder="your@email.com" />
            </div>
          </div>
          <div class="form-group mt-3">
            <label class="form-label">Phone Number</label>
            <div class="input-group">
              <span class="input-icon" style="font-size:13px;font-weight:600;color:var(--text-secondary);left:12px;">+91</span>
              <input type="tel" class="form-input" id="reg-phone" placeholder="9876543210" style="padding-left:52px;" />
            </div>
          </div>
          <div class="form-group mt-3">
            <label class="form-label">Password</label>
            <div class="input-group">
              <span class="input-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span>
              <input type="password" class="form-input" id="reg-password" placeholder="Min 8 characters" />
            </div>
          </div>
          <div style="background:var(--primary-light);border-radius:10px;padding:12px 14px;margin-top:14px;font-size:12px;color:var(--primary);display:flex;align-items:flex-start;gap:8px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;margin-top:1px;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            By registering, you agree to HealthVerse's Terms of Service and Privacy Policy. Your health data is encrypted and HIPAA-compliant.
          </div>
          <button class="btn btn-primary btn-full mt-4" onclick="handleRegister()" id="register-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
            Create Account
          </button>
        </div>
      </div>
    </div>
  `;

  // Inject login-specific styles
  injectLoginStyles();
  initLoginHandlers();
}

function injectLoginStyles() {
  if (document.getElementById('login-styles')) return;
  const s = document.createElement('style');
  s.id = 'login-styles';
  s.textContent = `
    .login-hero {
      height: 260px;
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
      width:64px;height:64px;background:rgba(255,255,255,0.12);
      border-radius:18px;display:flex;align-items:center;justify-content:center;
      backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.2);
    }
    .login-brand { font-family:var(--font-display);font-size:30px;font-weight:800;color:white;letter-spacing:-0.5px; }
    .login-tagline { font-size:13px;color:rgba(255,255,255,0.65);letter-spacing:0.5px; }
    .login-panel {
      background:var(--surface);
      border-radius:28px 28px 0 0;
      margin-top:-24px;
      padding:24px 24px 40px;
      min-height:calc(100dvh - 236px);
      box-shadow:0 -8px 30px rgba(26,35,50,0.12);
    }
    .login-tabs { display:flex;background:var(--surface-dim);border-radius:14px;padding:4px;gap:4px; }
    .login-tab {
      flex:1;padding:11px;font-family:var(--font-display);font-size:14px;font-weight:600;
      border:none;background:transparent;color:var(--text-secondary);border-radius:10px;
      cursor:pointer;transition:all var(--transition-normal);
    }
    .login-tab.active { background:var(--surface);color:var(--primary);box-shadow:var(--shadow-sm); }
    .social-grid { display:grid;grid-template-columns:repeat(4,1fr);gap:10px; }
    .social-btn {
      display:flex;flex-direction:column;align-items:center;gap:6px;
      padding:12px 8px;background:var(--surface-dim);border:1.5px solid var(--border);
      border-radius:14px;cursor:pointer;font-size:11px;font-weight:600;
      color:var(--text-secondary);font-family:var(--font-display);
      transition:all var(--transition-normal);
    }
    .social-btn:hover { border-color:var(--primary);color:var(--primary);background:var(--primary-light);transform:translateY(-2px); }
    .social-btn:active { transform:scale(0.96); }
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

  window.handleLogin = () => {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const btn = document.getElementById('login-btn');

    if (!email) { showToast('Please enter your email or phone', 'error'); return; }
    if (!password) { showToast('Please enter your password', 'error'); return; }

    btn.innerHTML = '<span class="animate-spin" style="display:inline-block;width:18px;height:18px;border:2px solid rgba(255,255,255,0.3);border-top-color:white;border-radius:50%;"></span> Signing in...';
    btn.disabled = true;

    setTimeout(() => {
      const user = { name: 'Aarav Patel', email, phone: '+91 9876543210', avatar: null };
      store.setUser(user, 'patient');
      navigate('user-type');
    }, 1400);
  };

  window.handleRegister = () => {
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const phone = document.getElementById('reg-phone').value.trim();
    const password = document.getElementById('reg-password').value;
    const btn = document.getElementById('register-btn');

    if (!name) { showToast('Please enter your full name', 'error'); return; }
    if (!email || !email.includes('@')) { showToast('Please enter a valid email address', 'error'); return; }
    if (!phone || phone.length < 10) { showToast('Please enter a valid phone number', 'error'); return; }
    if (!password || password.length < 8) { showToast('Password must be at least 8 characters', 'error'); return; }

    btn.innerHTML = '<span class="animate-spin" style="display:inline-block;width:18px;height:18px;border:2px solid rgba(255,255,255,0.3);border-top-color:white;border-radius:50%;"></span> Creating account...';
    btn.disabled = true;

    setTimeout(() => {
      showToast('Account created successfully! 🎉', 'success');
      const user = { name, email, phone: '+91 ' + phone, avatar: null };
      store.setUser(user, 'patient');
      navigate('user-type');
    }, 1600);
  };

  window.socialLogin = (provider) => {
    const labels = { google: 'Google', apple: 'Apple', phone: 'OTP', biometric: 'Biometric' };
    showToast(`Connecting with ${labels[provider]}...`, 'info');
    setTimeout(() => {
      const user = { name: 'Aarav Patel', email: 'aarav@example.com', phone: '+91 9876543210', avatar: null };
      store.setUser(user, 'patient');
      navigate('user-type');
    }, 1200);
  };

  window.continueAsGuest = () => {
    const user = { name: 'Guest User', email: 'guest@healthverse.app', phone: null, avatar: null };
    store.setUser(user, 'patient');
    navigate('user-type');
  };

  window.showForgotPassword = () => {
    showToast('OTP sent to your registered email/phone', 'success');
  };
}
