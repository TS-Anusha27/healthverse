// HealthVerse — Doctor Dashboard connected to Supabase DB
import { navigate } from '../../routes/router.js';
import { store } from '../../store/store.js';
import { mockData } from '../../services/data.js';
import { showToast, getInitials } from '../../utils/utils.js';
import { getAppointments, getEmergencyRequests } from '../../services/supabase/db.js';

export async function renderDoctorDashboard() {
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

  const appts = await getAppointments();
  const emergencies = await getEmergencyRequests();
  const activeEmergencies = emergencies.filter(e => e.status !== 'completed').length;

  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="screen" style="background:var(--bg);">
      <!-- Header -->
      <div style="background:linear-gradient(135deg,#1E3A5F,#0D4F3C);padding:calc(20px + var(--safe-top)) 20px 20px;color:white;">
        <div class="flex items-center justify-between">
          <div>
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:2px;">
              <span style="font-size:11px;color:rgba(255,255,255,0.7);font-weight:700;letter-spacing:0.5px;">DOCTOR WORKSPACE</span>
              <span style="font-size:10px;font-weight:700;padding:2px 6px;border-radius:4px;background:${isPending ? '#FEF3C7' : '#D1FAE5'};color:${isPending ? '#92400E' : '#065F46'};">
                ${isPending ? '⏳ Pending Verification' : '✓ Verified'}
              </span>
            </div>
            <div style="font-family:var(--font-display);font-size:22px;font-weight:800;margin-top:2px;">${docName}</div>
            <div style="font-size:13px;color:rgba(255,255,255,0.8);">${docSpecialty} • ${docHospital}</div>
          </div>
          <button class="avatar" style="background:rgba(255,255,255,0.2);color:white;cursor:pointer;font-weight:700;" onclick="navigate('settings')" id="doc-avatar" aria-label="Settings">
            ${getInitials(docName)}
          </button>
        </div>

        <!-- Quick Stats Grid -->
        <div class="grid-3 mt-4">
          <div style="background:rgba(255,255,255,0.12);border-radius:14px;padding:12px;text-align:center;">
            <div style="font-family:var(--font-display);font-size:22px;font-weight:800;color:white;">${appts.length}</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.7);">Today's Appts</div>
          </div>
          <div style="background:rgba(255,255,255,0.12);border-radius:14px;padding:12px;text-align:center;">
            <div style="font-family:var(--font-display);font-size:22px;font-weight:800;color:var(--emergency);">${activeEmergencies}</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.7);">Emergency</div>
          </div>
          <div style="background:rgba(255,255,255,0.12);border-radius:14px;padding:12px;text-align:center;">
            <div style="font-family:var(--font-display);font-size:22px;font-weight:800;color:var(--secondary);">4</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.7);">Video Consults</div>
          </div>
        </div>
      </div>

      <div class="screen-content" style="padding:20px;padding-bottom:100px;">
        <!-- AI Priority Queue -->
        <div class="section-header">
          <div class="section-title">AI Priority Patient Queue</div>
          <span class="badge badge-primary">Sorted by AI Triage</span>
        </div>

        <div style="display:flex;flex-direction:column;gap:12px;" class="mt-3">
          ${mockData.doctorQueue.map(q => `
            <div class="card" style="padding:16px;cursor:pointer;" onclick="openPatientSummary('${q.id}')">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <div style="font-family:var(--font-display);font-weight:800;font-size:14px;color:var(--primary);">${q.token}</div>
                  <div style="font-family:var(--font-display);font-size:16px;font-weight:700;">${q.name}</div>
                  <span style="font-size:12px;color:var(--text-tertiary);">(${q.age}y)</span>
                </div>
                <span class="badge badge-triage-${q.triage}">${q.triage.toUpperCase()}</span>
              </div>
              <div style="font-size:13px;color:var(--text-secondary);">Condition: <strong>${q.condition}</strong> • Wait: ${q.wait}</div>
              <div class="flex gap-2 mt-3">
                <button class="btn btn-primary btn-xs flex-1" onclick="event.stopPropagation();navigate('doctor-summary')">View AI Summary</button>
                <button class="btn btn-outline btn-xs flex-1" onclick="event.stopPropagation();navigate('doctor-prescription')">Prescribe</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  window.openPatientSummary = () => navigate('doctor-summary');
}
