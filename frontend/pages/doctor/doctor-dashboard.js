// HealthVerse — Doctor Dashboard connected to Supabase DB
import { navigate } from '../../routes/router.js';
import { store } from '../../store/store.js';
import { mockData } from '../../services/data.js';
import { showToast, getInitials, escapeHtml, renderSkeletonCards, renderEmptyState, renderErrorState, animateCountUp } from '../../utils/utils.js';
import { getAppointments, getEmergencyRequests } from '../../services/supabase/db.js';

export function renderDoctorDashboard() {
  const doctor = store.doctor || (store.currentUser ? {
    name: store.currentUser.name?.startsWith('Dr.') ? store.currentUser.name : `Dr. ${store.currentUser.name}`,
    specialty: 'General Practitioner',
    hospital: 'Apollo Hospitals',
    verificationStatus: store.currentUser.verificationStatus || 'pending_verification'
  } : {
    name: 'Dr. Medical Specialist',
    specialty: 'General Practitioner',
    hospital: 'Affiliated Hospital',
    verificationStatus: 'pending_verification'
  });
  const docName = doctor.fullName || doctor.name;
  const docSpecialty = doctor.specialisation || doctor.specialty || 'General Practitioner';
  const docHospital = doctor.hospital || 'Affiliated Hospital';
  const isPending = doctor.verificationStatus === 'pending_verification';

  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="screen" style="background:var(--bg);">
      <!-- Header -->
      <div style="background:linear-gradient(135deg,#1E3A5F,#0D4F3C);padding:calc(20px + var(--safe-top)) 20px 20px;color:white;">
        <div class="flex items-center justify-between">
          <div>
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:2px;">
              <span style="font-size:11px;color:rgba(255,255,255,0.7);font-weight:700;letter-spacing:0.5px;">DOCTOR WORKSPACE</span>
              <span class="badge ${isPending ? 'badge-warning' : 'badge-success'}">
                ${isPending ? '⏳ Pending Verification' : '✓ Verified'}
              </span>
            </div>
            <div style="font-family:var(--font-display);font-size:22px;font-weight:800;margin-top:2px;">${escapeHtml(docName)}</div>
            <div style="font-size:13px;color:rgba(255,255,255,0.8);">${escapeHtml(docSpecialty)} • ${escapeHtml(docHospital)}</div>
          </div>
          <button class="avatar" style="background:rgba(255,255,255,0.2);color:white;cursor:pointer;font-weight:700;" onclick="navigate('settings')" id="doc-avatar" aria-label="Settings">
            ${getInitials(docName)}
          </button>
        </div>

        <!-- Quick Stats Grid -->
        <div class="grid-3 mt-4" id="doc-stats-grid">
          <div style="background:rgba(255,255,255,0.12);border-radius:14px;padding:12px;text-align:center;">
            <div style="font-family:var(--font-display);font-size:22px;font-weight:800;color:white;" id="doc-stat-appts">-</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.7);">Today's Appts</div>
          </div>
          <div style="background:rgba(255,255,255,0.12);border-radius:14px;padding:12px;text-align:center;">
            <div style="font-family:var(--font-display);font-size:22px;font-weight:800;color:var(--emergency);" id="doc-stat-emerg">-</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.7);">Emergency</div>
          </div>
          <div style="background:rgba(255,255,255,0.12);border-radius:14px;padding:12px;text-align:center;">
            <div style="font-family:var(--font-display);font-size:22px;font-weight:800;color:var(--secondary);" id="doc-stat-video">-</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.7);">Video Consults</div>
          </div>
        </div>
      </div>

      <div class="screen-content" style="padding:20px;padding-bottom:100px;">
        ${isPending ? `
        <div class="card p-3 mb-4 verification-banner">
          <div class="flex items-center gap-2">
            <span style="font-size:18px;">📋</span>
            <div>
              <div class="verification-banner-title">Verification Incomplete</div>
              <div class="verification-banner-sub">Upload medical license and hospital credentials</div>
            </div>
          </div>
          <button class="btn btn-xs verification-banner-btn" onclick="navigate('doctor-setup')">Complete verification &rarr;</button>
        </div>` : ''}

        <!-- AI Priority Queue -->
        <div class="section-header">
          <div class="section-title">AI Priority Patient Queue</div>
          <span class="badge badge-primary">Sorted by AI Triage</span>
        </div>

        <div id="doc-queue-container" class="mt-3">
          ${renderSkeletonCards(3, false)}
        </div>
      </div>
    </div>
  `;

  window.openPatientSummary = () => navigate('doctor-summary');
  window.retryDoctorDashboard = () => loadDoctorDashboardData();
  loadDoctorDashboardData();
}

async function loadDoctorDashboardData() {
  const queueEl = document.getElementById('doc-queue-container');
  if (!queueEl) return;
  queueEl.innerHTML = renderSkeletonCards(3, false);

  try {
    const [appts, emergencies] = await Promise.all([
      getAppointments(),
      getEmergencyRequests()
    ]);
    if (!document.getElementById('doc-queue-container')) return;

    const activeEmergencies = (emergencies || []).filter(e => e.status !== 'completed').length;
    const apptsEl = document.getElementById('doc-stat-appts');
    const emergEl = document.getElementById('doc-stat-emerg');
    const videoEl = document.getElementById('doc-stat-video');
    if (apptsEl) animateCountUp(apptsEl, (appts || []).length);
    if (emergEl) animateCountUp(emergEl, activeEmergencies);
    if (videoEl) animateCountUp(videoEl, 4);

    const queue = mockData.doctorQueue || [];
    if (queue.length === 0) {
      queueEl.innerHTML = renderEmptyState({
        title: 'No patients waiting',
        description: 'Your AI priority consultation queue is currently empty.'
      });
      return;
    }

    queueEl.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:12px;">
        ${queue.map(q => `
          <div class="card" role="button" tabindex="0" style="padding:16px;cursor:pointer;" onclick="openPatientSummary('${escapeHtml(q.id)}')">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <div style="font-family:var(--font-display);font-weight:800;font-size:14px;color:var(--primary);">${escapeHtml(q.token)}</div>
                <div style="font-family:var(--font-display);font-size:16px;font-weight:700;">${escapeHtml(q.name)}</div>
                <span style="font-size:12px;color:var(--text-tertiary);">(${escapeHtml(q.age)}y)</span>
              </div>
              <span class="badge badge-triage-${escapeHtml(q.triage)}">${escapeHtml(q.triage.toUpperCase())}</span>
            </div>
            <div style="font-size:13px;color:var(--text-secondary);">Condition: <strong>${escapeHtml(q.condition)}</strong> • Wait: ${escapeHtml(q.wait)}</div>
            <div class="flex gap-2 mt-3">
              <button class="btn btn-primary btn-xs flex-1" onclick="event.stopPropagation();navigate('doctor-summary')">View AI Summary</button>
              <button class="btn btn-outline btn-xs flex-1" onclick="event.stopPropagation();navigate('doctor-prescription')">Prescribe</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  } catch (err) {
    if (!document.getElementById('doc-queue-container')) return;
    queueEl.innerHTML = renderErrorState({
      title: 'Unable to load patient queue',
      description: err?.message || 'Could not retrieve today’s appointments and triage queue.',
      retryOnclick: 'retryDoctorDashboard()'
    });
  }
}
