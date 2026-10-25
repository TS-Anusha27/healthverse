// HealthVerse — Public Landing & Role Selection Screen
import { navigate } from '../../routes/router.js';
import { store } from '../../store/store.js';
import { authService } from '../../services/auth/authService.js';
import { showToast } from '../../utils/utils.js';

export function renderUserType() {
  const app = document.getElementById('app');
  const isLoggedIn = store.isLoggedIn && store.currentUser;
  const currentRole = store.userType;
  const currentName = store.currentUser?.name || 'User';

  app.innerHTML = `
    <div class="screen landing-screen" id="landing-screen" style="min-height:100dvh;background:var(--bg);display:flex;flex-direction:column;">
      <!-- Top Brand Bar -->
      <header class="landing-header" style="padding:28px 24px 20px;text-align:center;background:var(--surface);border-bottom:1px solid var(--border-light);box-shadow:var(--shadow-xs);">
        <div style="display:inline-flex;align-items:center;gap:12px;margin-bottom:8px;">
          <div class="brand-logo-mark" style="width:48px;height:48px;border-radius:14px;background:linear-gradient(135deg,var(--primary) 0%,var(--secondary) 100%);display:flex;align-items:center;justify-content:center;box-shadow:var(--shadow-sm);flex-shrink:0;">
            <svg width="28" height="28" viewBox="0 0 52 52" fill="none">
              <path d="M26 8C26 8 14 14 14 26C14 32 17.5 37 23 40L26 42L29 40C34.5 37 38 32 38 26C38 14 26 8 26 8Z" fill="white" fill-opacity="0.95"/>
              <path d="M22 26H30M26 22V30" stroke="#4A90D9" stroke-width="2.5" stroke-linecap="round"/>
            </svg>
          </div>
          <div style="text-align:left;">
            <h1 style="font-family:var(--font-display);font-size:24px;font-weight:800;color:var(--text-primary);letter-spacing:-0.5px;line-height:1.2;">
              HealthVerse
            </h1>
            <p style="font-size:12px;font-weight:600;color:var(--text-secondary);letter-spacing:0.4px;">
              A Complete Healthcare Universe
            </p>
          </div>
        </div>

        <p style="font-size:14px;color:var(--text-secondary);max-width:380px;margin:10px auto 0;line-height:1.5;">
          A unified, AI-assisted healthcare ecosystem connecting patients, verified doctors, and emergency response services.
        </p>

        ${isLoggedIn ? `
          <div class="active-session-banner mt-3" style="background:var(--primary-light);border:1px solid rgba(74,144,217,0.3);border-radius:12px;padding:12px 16px;max-width:400px;margin:14px auto 0;display:flex;align-items:center;justify-content:space-between;text-align:left;">
            <div>
              <div style="font-size:12px;color:var(--primary);font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Active Session</div>
              <div style="font-size:14px;font-weight:700;color:var(--text-primary);">${currentName} <span style="font-weight:500;color:var(--text-secondary);">(${currentRole})</span></div>
            </div>
            <div style="display:flex;gap:8px;">
              <button class="btn btn-primary btn-xs" onclick="goToCurrentDashboard()">Dashboard</button>
              <button class="btn btn-outline btn-xs" onclick="handleLandingSignOut()">Sign Out</button>
            </div>
          </div>
        ` : ''}
      </header>

      <!-- Role Selection Section -->
      <main class="screen-content" style="padding:28px 20px 48px;max-width:480px;margin:0 auto;width:100%;flex:1;">
        <div style="text-align:center;margin-bottom:24px;">
          <h2 style="font-family:var(--font-display);font-size:20px;font-weight:700;color:var(--text-primary);">
            Choose Your Portal
          </h2>
          <p style="font-size:13px;color:var(--text-secondary);margin-top:4px;">
            Select your account category to continue to dedicated sign in or registration
          </p>
        </div>

        <div style="display:flex;flex-direction:column;gap:16px;">
          <!-- Role 1: Patient / User -->
          <div class="portal-card" id="card-patient" onclick="openRoleAuth('patient')">
            <div class="portal-icon" style="background:#EBF5FF;color:#2B6CB0;">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div class="portal-body">
              <div class="flex items-center justify-between">
                <h3 class="portal-title">Patient / User</h3>
                <span class="portal-pill" style="background:#EBF5FF;color:#2B6CB0;">Patient Portal</span>
              </div>
              <p class="portal-desc">
                Access healthcare services, manage your medical profile, and book appointments.
              </p>
              <div class="portal-action-row">
                <span class="portal-cta" style="color:#2B6CB0;">
                  Continue to Patient Portal &rarr;
                </span>
              </div>
            </div>
          </div>

          <!-- Role 2: Doctor -->
          <div class="portal-card" id="card-doctor" onclick="openRoleAuth('doctor')">
            <div class="portal-icon" style="background:#E6FFFA;color:#234E52;">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#319795" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
            </div>
            <div class="portal-body">
              <div class="flex items-center justify-between">
                <h3 class="portal-title">Doctor</h3>
                <span class="portal-pill" style="background:#E6FFFA;color:#234E52;">Medical Staff</span>
              </div>
              <p class="portal-desc">
                Access your professional workspace and manage patient care.
              </p>
              <div class="portal-action-row">
                <span class="portal-cta" style="color:#319795;">
                  Continue to Doctor Workspace &rarr;
                </span>
              </div>
            </div>
          </div>

          <!-- Role 3: Ambulance Driver -->
          <div class="portal-card" id="card-ambulance" onclick="openRoleAuth('ambulance')">
            <div class="portal-icon" style="background:#FFF5F5;color:#9B2C2C;">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#E53E3E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="1" y="3" width="15" height="13" rx="2"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
              </svg>
            </div>
            <div class="portal-body">
              <div class="flex items-center justify-between">
                <h3 class="portal-title">Ambulance Driver</h3>
                <span class="portal-pill" style="background:#FFF5F5;color:#9B2C2C;">Emergency Response</span>
              </div>
              <p class="portal-desc">
                Access your driver workspace and manage assigned emergency requests.
              </p>
              <div class="portal-action-row">
                <span class="portal-cta" style="color:#E53E3E;">
                  Continue to Driver Portal &rarr;
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer platform info -->
        <footer style="margin-top:36px;text-align:center;padding:16px 0;border-top:1px solid var(--border-light);">
          <div style="font-size:12px;color:var(--text-tertiary);">
            HealthVerse System &bull; Secure Client Verification &bull; v2.0
          </div>
        </footer>
      </main>
    </div>
  `;

  injectUserTypeStyles();
  attachHandlers();
}

function injectUserTypeStyles() {
  if (document.getElementById('landing-portal-styles')) return;
  const s = document.createElement('style');
  s.id = 'landing-portal-styles';
  s.textContent = `
    .portal-card {
      background: var(--surface);
      border: 1.5px solid var(--border);
      border-radius: 16px;
      padding: 18px;
      display: flex;
      align-items: flex-start;
      gap: 16px;
      box-shadow: 0 2px 6px rgba(15, 23, 42, 0.04);
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
    }
    .portal-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
      border-color: var(--primary);
    }
    .portal-icon {
      width: 52px;
      height: 52px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: transform 0.2s ease;
    }
    .portal-card:hover .portal-icon {
      transform: scale(1.05);
    }
    .portal-body {
      flex: 1;
    }
    .portal-title {
      font-family: var(--font-display);
      font-size: 16px;
      font-weight: 700;
      color: var(--text-primary);
    }
    .portal-pill {
      font-size: 11px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
      letter-spacing: 0.3px;
    }
    .portal-desc {
      font-size: 13px;
      color: var(--text-secondary);
      margin-top: 6px;
      line-height: 1.45;
    }
    .portal-action-row {
      margin-top: 12px;
      display: flex;
      align-items: center;
    }
    .portal-cta {
      font-size: 13px;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
  `;
  document.head.appendChild(s);
}

function attachHandlers() {
  // Explicitly navigate to authentication screen for chosen role without auto-login
  window.openRoleAuth = (role) => {
    navigate('login', { role });
  };

  window.goToCurrentDashboard = () => {
    if (store.userType === 'doctor') navigate('doctor-home');
    else if (store.userType === 'ambulance') navigate('ambulance-home');
    else navigate('patient-home');
  };

  window.handleLandingSignOut = () => {
    authService.logout();
    showToast('Signed out successfully', 'info');
    renderUserType();
  };
}
