// HealthVerse — Settings & Account Management
import { navigate, goBack } from '../../routes/router.js';
import { store } from '../../store/store.js';
import { showToast } from '../../utils/utils.js';

export function renderSettings() {
  const user = store.currentUser || { name: 'Aarav Patel', email: 'aarav@healthverse.com' };
  const app = document.getElementById('app');

  app.innerHTML = `
    <div class="screen" style="background:var(--bg);">
      <div class="page-header">
        <button class="back-btn" onclick="goBack()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div class="page-title">Settings & Account</div>
      </div>

      <div class="screen-content" style="padding:20px;padding-bottom:100px;max-width:560px;margin:0 auto;">
        <!-- User Profile Card -->
        <div class="card mb-4" style="padding:18px;">
          <div class="flex items-center gap-3">
            <div class="avatar avatar-lg" style="background:var(--primary);color:white;font-weight:800;">
              ${user.name?.split(' ').map(n=>n[0]).join('') || 'U'}
            </div>
            <div>
              <div style="font-family:var(--font-display);font-size:17px;font-weight:700;">${user.name}</div>
              <div style="font-size:13px;color:var(--text-secondary);">${user.email || 'user@healthverse.com'}</div>
              <div class="badge badge-primary mt-1">${store.userType?.toUpperCase() || 'PATIENT'} ACCOUNT</div>
            </div>
          </div>
        </div>

        <!-- Preferences -->
        <div class="card mb-4" style="padding:18px;">
          <div style="font-family:var(--font-display);font-size:15px;font-weight:700;margin-bottom:14px;">App Preferences</div>
          
          <div style="display:flex;flex-direction:column;gap:14px;">
            <div class="flex justify-between items-center">
              <div>
                <div style="font-size:14px;font-weight:600;">Dark Mode</div>
                <div style="font-size:12px;color:var(--text-secondary);">Switch between light and dark theme</div>
              </div>
              <label class="toggle">
                <input type="checkbox" id="theme-toggle" ${store.theme === 'dark' ? 'checked' : ''} onchange="toggleDarkTheme()" />
                <div class="toggle-track"></div>
                <div class="toggle-thumb"></div>
              </label>
            </div>

            <div class="divider"></div>

            <div class="flex justify-between items-center">
              <div>
                <div style="font-size:14px;font-weight:600;">Language</div>
                <div style="font-size:12px;color:var(--text-secondary);">App language</div>
              </div>
              <select class="form-input form-select" style="width:120px;padding:6px 12px;font-size:13px;" onchange="showToast('Language updated','info')">
                <option>English</option>
                <option>Tamil</option>
                <option>Hindi</option>
              </select>
            </div>

            <div class="divider"></div>

            <div class="flex justify-between items-center">
              <div>
                <div style="font-size:14px;font-weight:600;">Biometric Login</div>
                <div style="font-size:12px;color:var(--text-secondary);">Fast security credentials lock</div>
              </div>
              <label class="toggle">
                <input type="checkbox" checked />
                <div class="toggle-track"></div>
                <div class="toggle-thumb"></div>
              </label>
            </div>
          </div>
        </div>

        <!-- Account Actions -->
        <div class="card mb-4" style="padding:18px;">
          <div style="display:flex;flex-direction:column;gap:12px;">
            <button class="btn btn-ghost btn-full" onclick="switchRole()" style="justify-content:flex-start;font-weight:600;">
              🔄 Switch Profile (Patient / Doctor / Ambulance)
            </button>
            <button class="btn btn-ghost btn-full" onclick="showToast('Privacy Policy & HIPPA compliance active','info')" style="justify-content:flex-start;">
              🔒 Privacy Policy & Data Security
            </button>
            <button class="btn btn-ghost btn-full" onclick="handleSignOut()" style="justify-content:flex-start;color:var(--emergency);font-weight:700;">
              🚪 Log Out & Return to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  window.toggleDarkTheme = () => {
    store.toggleTheme();
    showToast(`Switched to ${store.theme} mode`, 'info');
  };

  window.switchRole = () => {
    navigate('login');
  };

  window.handleSignOut = () => {
    store.clearUser();
    showToast('Logged out 👋', 'info');
    navigate('login');
  };
}
