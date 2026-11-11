// HealthVerse — Patient Home Dashboard
import { navigate } from '../../routes/router.js';
import { store } from '../../store/store.js';
import { mockData } from '../../services/data.js';
import { authService } from '../../services/auth/authService.js';
import { showToast, getInitials, avatarColor, escapeHtml } from '../../utils/utils.js';
import { uiIcon } from '../../utils/icons.js';

export function renderPatientHome() {
  const patient = store.patient || JSON.parse(localStorage.getItem('hv_patient_profile') || 'null') || (store.currentUser ? { name: store.currentUser.name, email: store.currentUser.email, bloodGroup: 'Not set', healthScore: 85 } : { name: 'Patient', bloodGroup: 'Not set', healthScore: 85 });
  store.patient = patient;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const displayName = patient.fullName || patient.name || store.currentUser?.name || 'Patient';
  const firstName = displayName.split(' ')[0] || 'Patient';

  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="screen" id="patient-home">
      <!-- Fixed Top Header -->
      <div class="home-header">
        <div class="home-header-bg"></div>
        <div class="home-header-content">
          <div class="flex items-center justify-between">
            <div>
              <div class="home-greeting">${greeting} 👋</div>
              <div class="home-name">${escapeHtml(firstName)}</div>
            </div>
            <div class="flex items-center gap-2">
              <button class="header-icon-btn" onclick="navigate('notifications')" id="notif-btn" aria-label="Notifications">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                <span class="notif-dot"></span>
              </button>
              <div class="account-menu-wrap" id="account-menu-wrap">
                <button type="button" class="avatar account-avatar-btn" style="background:${avatarColor(displayName)};color:white;" onclick="toggleAccountMenu(event)" id="profile-avatar" aria-label="Account menu" aria-haspopup="menu" aria-expanded="false">
                  ${getInitials(displayName)}
                </button>
                <div class="account-menu hidden" id="patient-account-menu" role="menu" aria-labelledby="profile-avatar">
                  <div class="account-menu-header">
                    <div class="account-menu-name">${escapeHtml(displayName)}</div>
                    <div class="account-menu-meta">${escapeHtml(store.currentUser?.email || patient.email || 'Patient Portal')}</div>
                  </div>
                  <div class="account-menu-divider" role="separator"></div>
                  <button type="button" class="account-menu-item" role="menuitem" onclick="closeAccountMenu(); navigate('settings')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                    <span>Profile and Settings</span>
                  </button>
                  <button type="button" class="account-menu-item" role="menuitem" onclick="closeAccountMenu(); navigate('login')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>
                    <span>Switch role</span>
                  </button>
                  <div class="account-menu-divider" role="separator"></div>
                  <button type="button" class="account-menu-item account-menu-item--danger" role="menuitem" onclick="handleHomeSignOut()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Health Score Card -->
          <div class="health-score-card">
            <div class="health-score-left">
              <div class="score-label">Health Score</div>
              <div class="score-value"><span data-countup="${patient.healthScore || 82}">${patient.healthScore || 82}</span><span class="score-unit">/100</span></div>
              <div class="score-status">
                <div class="score-dot score-dot--active"></div>
                <span>Good — Keep it up!</span>
              </div>
            </div>
            <div class="health-score-right">
              <svg width="90" height="90" viewBox="0 0 90 90">
                <circle cx="45" cy="45" r="36" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="8"/>
                <circle cx="45" cy="45" r="36" fill="none" stroke="white" stroke-width="8"
                  stroke-dasharray="${2 * Math.PI * 36}" 
                  stroke-dashoffset="${2 * Math.PI * 36 * (1 - (patient.healthScore || 82) / 100)}"
                  stroke-linecap="round" transform="rotate(-90 45 45)"
                  style="transition:stroke-dashoffset 1.2s ease;" />
              </svg>
              <div class="score-ring-overlay">
                <div class="score-ring-num" data-countup="${patient.healthScore || 82}">${patient.healthScore || 82}</div>
                <div class="score-ring-caption">score</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Scrollable Content -->
      <div class="screen-content">

        <!-- Quick Actions Grid -->
        <div class="section mt-4">
          <div class="section-header">
            <div class="section-title">Quick Actions</div>
          </div>
          <div class="grid-4">
            ${quickAction('Appointment', 'calendar', '#4A90D9', 'var(--primary-light)', 'appointments')}
            ${quickAction('Triage AI', 'stethoscope', '#7B68EE', 'var(--accent-light)', 'triage')}
            ${quickAction('Records', 'folder', '#52C99B', 'var(--secondary-light)', 'health-records')}
            ${quickAction('Video Call', 'video', '#FF6B6B', 'var(--emergency-light)', 'telemedicine')}
            ${quickAction('Medicine', 'pill', '#FFA502', 'var(--warning-light)', 'medicines')}
            ${quickAction('Blood', 'droplets', '#E74C3C', 'var(--emergency-light)', 'blood-donation')}
            ${quickAction('Insights', 'trending-up', '#17A589', 'var(--secondary-light)', 'health-insights')}
            ${quickAction('Organ', 'heart', '#EC407A', 'var(--emergency-light)', 'organ-donation')}
            ${quickAction('Payments', 'credit-card', '#4A90D9', 'var(--primary-light)', 'payments')}
          </div>
        </div>

        <!-- Upcoming Appointment -->
        ${mockData.appointments.length > 0 ? `
        <div class="section mt-5">
          <div class="section-header">
            <div class="section-title">Upcoming Appointment</div>
            <span class="section-link" onclick="navigate('appointments')">View All</span>
          </div>
          <div class="appointment-card" onclick="navigate('live-queue')">
            <div class="appt-header">
              <div class="icon-box icon-box-primary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <div style="flex:1;">
                <div class="appt-doctor">${mockData.appointments[0].doctorName}</div>
                <div class="appt-spec">${mockData.appointments[0].specialty} • ${mockData.appointments[0].hospital}</div>
              </div>
              <div class="badge badge-success">Confirmed</div>
            </div>
            <div class="appt-details">
              <div class="appt-detail-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                ${mockData.appointments[0].date} • ${mockData.appointments[0].time}
              </div>
              <div class="appt-detail-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                Token: ${mockData.appointments[0].token} • ${mockData.appointments[0].room}
              </div>
            </div>
            <div class="modal-cta-row">
              <button class="btn btn-primary btn-sm flex-1" onclick="event.stopPropagation();navigate('live-queue')">View Queue</button>
              <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();showQR()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h.01M14 17h.01M17 14h.01M21 14h.01M17 17h3v4M14 21h.01"/></svg>
                QR Code
              </button>
            </div>
          </div>
        </div>
        ` : ''}

        <!-- Today's Medicines -->
        <div class="section mt-5">
          <div class="section-header">
            <div class="section-title">Today's Medicines</div>
            <span class="section-link" onclick="navigate('medicines')">All Meds</span>
          </div>
          <div class="flex-col gap-2">
            ${mockData.medicines.slice(0, 3).map(med => `
              <div class="med-card" style="border-left:3px solid ${med.color};" onclick="navigate('medicines')">
                <div class="med-dot" style="background:${med.color};"></div>
                <div class="flex-1">
                  <div class="med-name">${med.name} <span class="med-dosage">${med.dosage}</span></div>
                  <div class="med-time">${med.time} • ${med.meals}</div>
                </div>
                <div class="med-status ${med.taken ? 'taken' : 'pending'}" onclick="event.stopPropagation();toggleMed(this,'${med.id}')">
                  ${med.taken ? '✓' : '○'}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Nearby Hospitals -->
        <div class="section mt-5">
          <div class="section-header">
            <div class="section-title">Nearby Hospitals</div>
            <span class="section-link" onclick="navigate('appointments')">See Map</span>
          </div>
          <div class="scroll-x">
            ${mockData.hospitals.map(h => `
              <div class="hospital-mini-card" onclick="navigate('appointments')">
                <div class="hospital-mini-avatar">${h.name.charAt(0)}</div>
                <div class="hospital-mini-name">${h.name}</div>
                <div class="hospital-mini-dist">${h.distance}</div>
                <div class="flex items-center gap-1 hospital-mini-rating-row">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="#FFA502" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  <span class="hospital-mini-rating-val">${h.rating}</span>
                </div>
                ${h.emergency ? `<div class="hospital-mini-emerg inline-icon-text">${uiIcon('siren', { size: 11 })} Emergency</div>` : ''}
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Blood Donation CTA -->
        <div class="section mt-5 mb-4">
          <div class="card-gradient blood-cta-card" onclick="navigate('blood-donation')">
            <div class="flex items-center justify-between">
              <div>
                <div class="blood-cta-eyebrow inline-icon-text">${uiIcon('droplet', { size: 12, fill: 'currentColor' })} Save Lives</div>
                <div class="blood-cta-title">Donate Blood</div>
                <div class="blood-cta-sub">3 nearby requests • B+ needed</div>
              </div>
              <div class="blood-cta-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/></svg>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Bottom Navigation -->
      ${renderBottomNav('home')}
    </div>
  `;

  injectHomeStyles();
  initHomeHandlers();
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function quickAction(label, icon, color, bg, page) {
  return `
    <div class="quick-action" role="button" tabindex="0" onclick="navigate('${page}')" id="qa-${page}" aria-label="${label}">
      <div class="quick-action-icon" style="background:${bg};">
        <i data-lucide="${icon}" style="width:22px;height:22px;color:${color};stroke-width:2;"></i>
      </div>
      <div class="quick-action-label">${label}</div>
    </div>
  `;
}

function renderBottomNav(active, options = {}) {
  const { desktopOnly = false } = options;
  const items = [
    { id: 'home', icon: 'home', label: 'Home', page: 'patient-home' },
    { id: 'appointments', icon: 'calendar', label: 'Book', page: 'appointments' },
    { id: 'sos', icon: 'alert-triangle', label: 'SOS', page: 'sos', isCenter: true },
    { id: 'records', icon: 'folder-open', label: 'Records', page: 'health-records' },
    { id: 'settings', icon: 'settings', label: 'Settings', page: 'settings' },
  ];

  return `
    <nav class="bottom-nav ${desktopOnly ? 'bottom-nav--desktop-only' : ''}" id="bottom-nav" aria-label="Patient navigation">
      <div class="sidebar-brand" aria-hidden="true">
        <div class="sidebar-brand-mark">
          <svg width="20" height="20" viewBox="0 0 52 52" fill="none">
            <path d="M26 8C26 8 14 14 14 26C14 32 17.5 37 23 40L26 42L29 40C34.5 37 38 32 38 26C38 14 26 8 26 8Z" fill="white" fill-opacity="0.95"/>
            <path d="M22 26H30M26 22V30" stroke="#4A90D9" stroke-width="3" stroke-linecap="round"/>
          </svg>
        </div>
        <div>
          <div class="sidebar-brand-title">HealthVerse</div>
          <div class="sidebar-brand-sub">Patient Portal</div>
        </div>
      </div>
      ${items.map(item => item.isCenter ? `
        <div class="nav-center-btn" role="button" tabindex="0" onclick="navigate('sos')" id="nav-sos" aria-label="Emergency SOS">
          <i data-lucide="alert-triangle" style="width:24px;height:24px;color:white;"></i>
          <span class="sidebar-sos-label">Emergency SOS</span>
        </div>
      ` : `
        <a class="nav-item ${item.id === active ? 'active' : ''}" role="button" tabindex="0" onclick="navigate('${item.page}')" id="nav-${item.id}" aria-label="${item.label}">
          ${item.id === active ? '<div class="nav-dot"></div>' : ''}
          <i data-lucide="${item.icon}" style="width:22px;height:22px;stroke-width:${item.id === active ? '2.5' : '2'};"></i>
          <span class="nav-label">${item.label}</span>
        </a>
      `).join('')}
    </nav>
  `;
}

// Export for reuse in other patient pages
export { renderBottomNav };

function injectHomeStyles() {
  if (document.getElementById('home-styles')) return;
  const s = document.createElement('style');
  s.id = 'home-styles';
  s.textContent = `
    .home-header {
      position:relative;
      background:linear-gradient(135deg,#1E3A5F 0%,#1A4F6E 50%,#0D4F3C 100%);
      padding:calc(20px + var(--safe-top)) 20px 0;
      overflow:visible;
    }
    .home-header-bg {
      position:absolute;inset:0;overflow:hidden;pointer-events:none;
      background:radial-gradient(circle at 80% 20%,rgba(74,144,217,0.3) 0%,transparent 60%),
                 radial-gradient(circle at 20% 80%,rgba(82,201,155,0.2) 0%,transparent 60%);
    }
    .home-header-content { position:relative;z-index:3; }
    .home-greeting { font-size:13px;color:rgba(255,255,255,0.7);font-weight:500; }
    .home-name { font-family:var(--font-display);font-size:24px;font-weight:800;color:white;margin-top:2px; }
    .header-icon-btn {
      width:44px;height:44px;min-width:44px;min-height:44px;border-radius:12px;
      background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.2);
      display:flex;align-items:center;justify-content:center;cursor:pointer;
      color:white;position:relative;
    }
    .notif-dot {
      position:absolute;top:8px;right:8px;width:8px;height:8px;
      background:var(--emergency);border-radius:50%;border:2px solid #1E3A5F;
    }
    .health-score-card {
      margin-top:16px;
      background:rgba(255,255,255,0.1);
      backdrop-filter:blur(20px);
      border-radius:20px 20px 0 0;
      padding:20px;
      display:flex;align-items:center;justify-content:space-between;
      border:1px solid rgba(255,255,255,0.15);
      border-bottom:none;
    }
    .score-label { font-size:12px;color:rgba(255,255,255,0.7);font-weight:500;text-transform:uppercase;letter-spacing:0.5px; }
    .score-value { font-family:var(--font-display);font-size:40px;font-weight:800;color:white;line-height:1;margin-top:4px; }
    .score-status { display:flex;align-items:center;gap:6px;margin-top:8px;font-size:13px;color:rgba(255,255,255,0.8); }
    .score-dot { width:8px;height:8px;border-radius:50%;animation:pulse-ring 2s infinite; }
    .health-score-right { position:relative;flex-shrink:0; }
    .quick-action {
      display:flex;flex-direction:column;align-items:center;gap:6px;
      cursor:pointer;transition:transform var(--transition-spring);
    }
    .quick-action:active { transform:scale(0.92); }
    .quick-action-icon {
      width:54px;height:54px;border-radius:16px;
      display:flex;align-items:center;justify-content:center;
      box-shadow:var(--shadow-sm);
      transition:all var(--transition-normal);
    }
    .quick-action:hover .quick-action-icon { transform:translateY(-3px);box-shadow:var(--shadow-md); }
    .quick-action-label { font-size:11px;font-weight:600;color:var(--text-secondary);text-align:center;font-family:var(--font-display); }
    .appointment-card {
      background:var(--surface);border-radius:18px;padding:18px;
      box-shadow:var(--shadow-md);border:1px solid var(--border-light);
      cursor:pointer;transition:all var(--transition-normal);
    }
    .appointment-card:hover { box-shadow:var(--shadow-lg);transform:translateY(-2px); }
    .appt-header { display:flex;align-items:center;gap:12px;margin-bottom:14px; }
    .appt-doctor { font-family:var(--font-display);font-size:15px;font-weight:700;color:var(--text-primary); }
    .appt-spec { font-size:12px;color:var(--text-secondary);margin-top:2px; }
    .appt-details { display:flex;flex-direction:column;gap:6px; }
    .appt-detail-item { display:flex;align-items:center;gap:8px;font-size:13px;color:var(--text-secondary); }
    .med-card {
      background:var(--surface);border-radius:14px;padding:14px 16px;
      display:flex;align-items:center;gap:12px;box-shadow:var(--shadow-xs);
      cursor:pointer;transition:all var(--transition-fast);
    }
    .med-dot { width:10px;height:10px;border-radius:50%;flex-shrink:0; }
    .med-name { font-size:14px;font-weight:600;color:var(--text-primary);font-family:var(--font-display); }
    .med-dosage { font-size:13px;font-weight:400;color:var(--text-secondary); }
    .med-time { font-size:12px;color:var(--text-tertiary);margin-top:2px; }
    .med-status {
      width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;
      font-size:14px;font-weight:700;cursor:pointer;transition:all var(--transition-fast);flex-shrink:0;
    }
    .med-status.taken { background:var(--success-light);color:var(--success); }
    .med-status.pending { background:var(--border);color:var(--text-tertiary); }
    .hospital-mini-card {
      flex-shrink:0;width:110px;background:var(--surface);border-radius:16px;
      padding:14px 12px;box-shadow:var(--shadow-sm);border:1px solid var(--border-light);
      cursor:pointer;transition:all var(--transition-normal);
    }
    .hospital-mini-card:hover { transform:translateY(-3px);box-shadow:var(--shadow-md); }
    .hospital-mini-avatar {
      width:40px;height:40px;border-radius:12px;
      background:var(--primary-light);color:var(--primary);
      font-family:var(--font-display);font-size:18px;font-weight:700;
      display:flex;align-items:center;justify-content:center;margin-bottom:8px;
    }
    .hospital-mini-name { font-size:12px;font-weight:700;color:var(--text-primary);font-family:var(--font-display);line-height:1.3; }
    .hospital-mini-dist { font-size:11px;color:var(--text-secondary);margin-top:3px; }
  `;
  document.head.appendChild(s);
}

function initHomeHandlers() {
  window.navigate = (page, params) => {
    const { navigate: nav } = window._router;
    nav(page, params);
  };

  window.toggleAccountMenu = (e) => {
    if (e) e.stopPropagation();
    const menu = document.getElementById('patient-account-menu');
    const btn = document.getElementById('profile-avatar');
    if (!menu || !btn) return;
    const willOpen = menu.classList.contains('hidden');
    menu.classList.toggle('hidden', !willOpen);
    btn.setAttribute('aria-expanded', String(willOpen));
  };

  window.closeAccountMenu = () => {
    const menu = document.getElementById('patient-account-menu');
    const btn = document.getElementById('profile-avatar');
    if (menu) menu.classList.add('hidden');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  };

  window.handleHomeSignOut = () => {
    window.closeAccountMenu();
    authService.logout();
    showToast('Signed out successfully. Returning to portal selection.', 'info');
    navigate('user-type');
  };

  if (window._hvAccountDocClick) {
    document.removeEventListener('click', window._hvAccountDocClick);
  }
  if (window._hvAccountDocKey) {
    document.removeEventListener('keydown', window._hvAccountDocKey);
  }

  window._hvAccountDocClick = (e) => {
    const wrap = document.getElementById('account-menu-wrap');
    if (wrap && !wrap.contains(e.target)) {
      window.closeAccountMenu();
    }
  };
  window._hvAccountDocKey = (e) => {
    if (e.key === 'Escape') {
      const menu = document.getElementById('patient-account-menu');
      if (menu && !menu.classList.contains('hidden')) {
        window.closeAccountMenu();
        document.getElementById('profile-avatar')?.focus();
      }
    }
  };

  document.addEventListener('click', window._hvAccountDocClick);
  document.addEventListener('keydown', window._hvAccountDocKey);

  window.toggleMed = (el, id) => {
    const isTaken = el.classList.contains('taken');
    el.classList.toggle('taken', !isTaken);
    el.classList.toggle('pending', isTaken);
    el.textContent = isTaken ? '○' : '✓';
    showToast(isTaken ? 'Medicine marked as pending' : 'Medicine taken! ✓', isTaken ? 'info' : 'success');
  };

  window.showQR = () => {
    const { showModal, generateQRDisplay } = window._utils;
    showModal(`
      <h3 class="modal-title text-center" style="margin-bottom:6px;">Appointment QR Code</h3>
      <p class="modal-subtitle text-center">Show this at the hospital reception</p>
      <div class="flex justify-center">
        ${generateQRDisplay('QR-A1-HEALTHVERSE')}
      </div>
      <div class="qr-modal-info">
        <div class="qr-modal-token">Token: TK-047 • Room 204, 2nd Floor</div>
        <div class="qr-modal-meta">Today, 3:30 PM • Dr. Priya Krishnamurthy</div>
      </div>
    `);
  };

  if (typeof lucide !== 'undefined') lucide.createIcons();
}
