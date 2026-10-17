// HealthVerse â€” Patient Home Dashboard
import { navigate } from '../../routes/router.js';
import { store } from '../../store/store.js';
import { mockData } from '../../services/data.js';
import { showToast, getInitials, avatarColor } from '../../utils/utils.js';

export function renderPatientHome() {
  const patient = store.patient || JSON.parse(localStorage.getItem('hv_patient_profile') || 'null') || { name: store.currentUser?.name || 'Aarav Patel', bloodGroup: 'B+', healthScore: 82 };
  store.patient = patient;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const firstName = patient.name?.split(' ')[0] || 'there';

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
              <div class="home-name">${firstName}</div>
            </div>
            <div class="flex items-center gap-2">
              <button class="btn btn-xs" style="background:rgba(255,255,255,0.18);color:white;border:1px solid rgba(255,255,255,0.25);border-radius:12px;padding:4px 8px;font-size:11px;" onclick="navigate('login')" title="Switch to Doctor or Ambulance Driver">
                🔄 Switch Profile
              </button>
              <button class="header-icon-btn" onclick="navigate('notifications')" id="notif-btn" aria-label="Notifications">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                <span class="notif-dot"></span>
              </button>
              <div class="avatar" style="background:${avatarColor(patient.name || 'User')};color:white;cursor:pointer;" onclick="navigate('settings')" id="profile-avatar">
                ${getInitials(patient.name || 'User')}
              </div>
            </div>
          </div>

          <!-- Health Score Card -->
          <div class="health-score-card">
            <div class="health-score-left">
              <div class="score-label">Health Score</div>
              <div class="score-value">${patient.healthScore || 82}<span style="font-size:18px;">/100</span></div>
              <div class="score-status">
                <div class="score-dot" style="background:var(--secondary);"></div>
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
              <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;">
                <div style="font-size:20px;font-weight:800;color:white;">${patient.healthScore || 82}</div>
                <div style="font-size:10px;color:rgba(255,255,255,0.7);">score</div>
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
            ${quickAction('Appointment', 'calendar', '#4A90D9', '#E8F4FD', 'appointments')}
            ${quickAction('Triage AI', 'stethoscope', '#7B68EE', '#F0EEFF', 'triage')}
            ${quickAction('Records', 'folder', '#52C99B', '#E8F9F3', 'health-records')}
            ${quickAction('Video Call', 'video', '#FF6B6B', '#FFF0F0', 'telemedicine')}
            ${quickAction('Medicine', 'pill', '#FFA502', '#FFF8EC', 'medicines')}
            ${quickAction('Blood', 'droplets', '#E74C3C', '#FFF0F0', 'blood-donation')}
            ${quickAction('Insights', 'trending-up', '#17A589', '#E8F8F5', 'health-insights')}
            ${quickAction('Organ', 'heart', '#EC407A', '#FCE4EC', 'organ-donation')}
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
                <div class="appt-spec">${mockData.appointments[0].specialty} â€¢ ${mockData.appointments[0].hospital}</div>
              </div>
              <div class="badge badge-success">Confirmed</div>
            </div>
            <div class="appt-details">
              <div class="appt-detail-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                ${mockData.appointments[0].date} â€¢ ${mockData.appointments[0].time}
              </div>
              <div class="appt-detail-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                Token: ${mockData.appointments[0].token} â€¢ ${mockData.appointments[0].room}
              </div>
            </div>
            <div style="margin-top:14px;display:flex;gap:10px;">
              <button class="btn btn-primary btn-sm" style="flex:1;" onclick="event.stopPropagation();navigate('live-queue')">View Queue</button>
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
          <div style="display:flex;flex-direction:column;gap:10px;">
            ${mockData.medicines.slice(0, 3).map(med => `
              <div class="med-card" style="border-left:3px solid ${med.color};" onclick="navigate('medicines')">
                <div class="med-dot" style="background:${med.color};"></div>
                <div style="flex:1;">
                  <div class="med-name">${med.name} <span class="med-dosage">${med.dosage}</span></div>
                  <div class="med-time">${med.time} â€¢ ${med.meals}</div>
                </div>
                <div class="med-status ${med.taken ? 'taken' : 'pending'}" onclick="event.stopPropagation();toggleMed(this,'${med.id}')">
                  ${med.taken ? 'âœ“' : 'â—‹'}
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
                <div class="flex items-center gap-1" style="margin-top:4px;">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="#FFA502" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  <span style="font-size:11px;font-weight:600;">${h.rating}</span>
                </div>
                ${h.emergency ? '<div style="font-size:10px;color:var(--emergency);font-weight:600;margin-top:3px;">ðŸš¨ Emergency</div>' : ''}
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Blood Donation CTA -->
        <div class="section mt-5 mb-4">
          <div class="card-gradient" style="padding:20px;cursor:pointer;" onclick="navigate('blood-donation')">
            <div class="flex items-center justify-between">
              <div>
                <div style="font-size:13px;opacity:0.8;margin-bottom:4px;">ðŸ©¸ Save Lives</div>
                <div style="font-family:var(--font-display);font-size:18px;font-weight:700;color:white;">Donate Blood</div>
                <div style="font-size:13px;opacity:0.8;margin-top:4px;">3 nearby requests â€¢ B+ needed</div>
              </div>
              <div style="width:60px;height:60px;background:rgba(255,255,255,0.15);border-radius:var(--radius-full);display:flex;align-items:center;justify-content:center;">
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
    <div class="quick-action" onclick="navigate('${page}')" id="qa-${page}">
      <div class="quick-action-icon" style="background:${bg};">
        <i data-lucide="${icon}" style="width:22px;height:22px;color:${color};stroke-width:2;"></i>
      </div>
      <div class="quick-action-label">${label}</div>
    </div>
  `;
}

function renderBottomNav(active) {
  const items = [
    { id: 'home', icon: 'home', label: 'Home', page: 'patient-home' },
    { id: 'appointments', icon: 'calendar', label: 'Book', page: 'appointments' },
    { id: 'sos', icon: 'alert-triangle', label: 'SOS', page: 'sos', isCenter: true },
    { id: 'records', icon: 'folder-open', label: 'Records', page: 'health-records' },
    { id: 'settings', icon: 'settings', label: 'Settings', page: 'settings' },
  ];

  return `
    <nav class="bottom-nav" id="bottom-nav">
      ${items.map(item => item.isCenter ? `
        <div class="nav-center-btn" onclick="navigate('sos')" id="nav-sos" aria-label="Emergency SOS">
          <i data-lucide="alert-triangle" style="width:24px;height:24px;color:white;"></i>
        </div>
      ` : `
        <a class="nav-item ${item.id === active ? 'active' : ''}" onclick="navigate('${item.page}')" id="nav-${item.id}" aria-label="${item.label}">
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
      overflow:hidden;
    }
    .home-header-bg {
      position:absolute;inset:0;
      background:radial-gradient(circle at 80% 20%,rgba(74,144,217,0.3) 0%,transparent 60%),
                 radial-gradient(circle at 20% 80%,rgba(82,201,155,0.2) 0%,transparent 60%);
    }
    .home-header-content { position:relative;z-index:1; }
    .home-greeting { font-size:13px;color:rgba(255,255,255,0.7);font-weight:500; }
    .home-name { font-family:var(--font-display);font-size:24px;font-weight:800;color:white;margin-top:2px; }
    .header-icon-btn {
      width:40px;height:40px;border-radius:12px;
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

  window.toggleMed = (el, id) => {
    const isTaken = el.classList.contains('taken');
    el.classList.toggle('taken', !isTaken);
    el.classList.toggle('pending', isTaken);
    el.textContent = isTaken ? 'â—‹' : 'âœ“';
    showToast(isTaken ? 'Medicine marked as pending' : 'Medicine taken! âœ“', isTaken ? 'info' : 'success');
  };

  window.showQR = () => {
    const { showModal, generateQRDisplay } = window._utils;
    showModal(`
      <h3 style="font-family:var(--font-display);font-size:18px;font-weight:700;text-align:center;color:var(--text-primary);margin-bottom:6px;">Appointment QR Code</h3>
      <p style="text-align:center;font-size:13px;color:var(--text-secondary);margin-bottom:24px;">Show this at the hospital reception</p>
      <div style="display:flex;justify-content:center;">
        ${generateQRDisplay('QR-A1-HEALTHVERSE')}
      </div>
      <div style="background:var(--primary-light);border-radius:12px;padding:14px;margin-top:20px;text-align:center;">
        <div style="font-size:13px;color:var(--primary);font-weight:600;">Token: TK-047 â€¢ Room 204, 2nd Floor</div>
        <div style="font-size:12px;color:var(--text-secondary);margin-top:4px;">Today, 3:30 PM â€¢ Dr. Priya Krishnamurthy</div>
      </div>
    `);
  };

  if (typeof lucide !== 'undefined') lucide.createIcons();
}
