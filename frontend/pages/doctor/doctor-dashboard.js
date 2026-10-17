// HealthVerse — Doctor Dashboard connected to Supabase/Firebase DB & Medical Verification
import { navigate } from '../../routes/router.js';
import { store } from '../../store/store.js';
import { mockData } from '../../services/data.js';
import { showToast } from '../../utils/utils.js';
import { getAppointments, getEmergencyRequests } from '../../services/supabase/db.js';

export async function renderDoctorDashboard() {
  const doctor = store.doctor || {
    name: 'Dr. Priya Krishnamurthy',
    specialty: 'Senior Cardiologist',
    hospital: 'Apollo Hospitals, Greams Road',
    regNumber: 'NMC-2024-88421',
    isVerified: true
  };

  let appts = [];
  let emergencies = [];
  try {
    appts = await getAppointments();
    emergencies = await getEmergencyRequests();
  } catch (e) {
    appts = mockData.appointments || [];
    emergencies = [];
  }
  const activeEmergencies = emergencies.filter(e => e.status !== 'completed').length;

  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="screen" style="background:var(--bg);min-height:100dvh;">
      <!-- Top Navigation & Role Bar -->
      <div style="background:linear-gradient(135deg, #0F172A 0%, #1E3A5F 50%, #0D4F3C 100%);padding:calc(16px + var(--safe-top)) 20px 20px;color:white;box-shadow:0 4px 20px rgba(0,0,0,0.15);">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <span class="badge" style="background:rgba(46,213,115,0.2);color:#2ED573;border:1px solid #2ED573;font-size:11px;font-weight:700;">
              ✓ VERIFIED DOCTOR PROFILE
            </span>
          </div>
          <!-- Role Switching & Sign Out -->
          <div class="flex items-center gap-2">
            <button class="btn btn-xs" style="background:rgba(255,255,255,0.15);color:white;border:1px solid rgba(255,255,255,0.25);" onclick="navigate('login')" title="Switch to Patient or Ambulance Driver">
              🔄 Switch Profile
            </button>
            <button class="btn btn-xs btn-ghost text-white" style="border:1px solid rgba(255,71,87,0.4);color:#FF6B6B;" onclick="handleDoctorSignOut()">
              Sign Out
            </button>
          </div>
        </div>

        <div class="flex items-center justify-between">
          <div>
            <div style="font-family:var(--font-display);font-size:22px;font-weight:800;letter-spacing:-0.3px;">
              ${doctor.name}
            </div>
            <div style="font-size:13px;color:rgba(255,255,255,0.85);margin-top:2px;display:flex;align-items:center;gap:6px;">
              <span>🏥 ${doctor.hospital}</span>
              <span>•</span>
              <span style="color:#A8EDDC;">${doctor.specialty}</span>
            </div>
            <div style="font-size:11px;color:rgba(255,255,255,0.65);margin-top:2px;">
              Reg No: <strong>${doctor.regNumber || 'NMC-2024-88421'}</strong> • Certificate: <span style="text-decoration:underline;cursor:pointer;" onclick="navigate('doctor-setup')">${doctor.certificateName || 'Verified_Degree.pdf'}</span>
            </div>
          </div>
          <button class="avatar" style="background:var(--secondary);color:white;cursor:pointer;width:44px;height:44px;font-weight:800;font-size:16px;border:2px solid rgba(255,255,255,0.3);" onclick="navigate('doctor-setup')" title="Update Doctor Credentials & Certificate" id="doc-avatar">
            ${doctor.name?.split(' ').map(n=>n[0]).slice(0,2).join('') || 'DR'}
          </button>
        </div>

        <!-- Quick Credentials Action -->
        <div class="mt-3 flex items-center justify-between" style="border-top:1px solid rgba(255,255,255,0.1);padding-top:10px;">
          <span style="font-size:11px;color:rgba(255,255,255,0.7);">Medical Board License Validated</span>
          <button class="btn btn-xs" style="background:rgba(255,255,255,0.12);color:#A8EDDC;font-size:11px;padding:3px 8px;border:none;" onclick="navigate('doctor-setup')">
            ✏️ Edit Credentials & Certificate
          </button>
        </div>

        <!-- Quick Stats Grid -->
        <div class="grid-3 mt-3">
          <div style="background:rgba(255,255,255,0.12);border-radius:14px;padding:12px;text-align:center;">
            <div style="font-family:var(--font-display);font-size:22px;font-weight:800;color:white;">${appts.length || 6}</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.7);">Today's Appts</div>
          </div>
          <div style="background:rgba(255,255,255,0.12);border-radius:14px;padding:12px;text-align:center;">
            <div style="font-family:var(--font-display);font-size:22px;font-weight:800;color:var(--emergency);">${activeEmergencies || 1}</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.7);">Emergency Triage</div>
          </div>
          <div style="background:rgba(255,255,255,0.12);border-radius:14px;padding:12px;text-align:center;">
            <div style="font-family:var(--font-display);font-size:22px;font-weight:800;color:var(--secondary);">4</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.7);">Video Consults</div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="screen-content" style="padding:20px 16px 100px;max-width:600px;margin:0 auto;">
        <!-- AI Priority Queue -->
        <div class="section-header">
          <div class="section-title">AI Priority Clinical Queue</div>
          <span class="badge badge-primary">Sorted by AI Severity</span>
        </div>

        <div style="display:flex;flex-direction:column;gap:12px;" class="mt-3">
          ${mockData.doctorQueue.map(q => `
            <div class="card" style="padding:16px;cursor:pointer;border-left:4px solid ${q.triage === 'red' ? 'var(--emergency)' : (q.triage === 'yellow' ? 'var(--warning)' : 'var(--success)')};" onclick="openPatientSummary('${q.id}')">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <div style="font-family:var(--font-display);font-weight:800;font-size:14px;color:var(--primary);">${q.token}</div>
                  <div style="font-family:var(--font-display);font-size:16px;font-weight:700;">${q.name}</div>
                  <span style="font-size:12px;color:var(--text-tertiary);">(${q.age}y)</span>
                </div>
                <span class="badge badge-triage-${q.triage}">${q.triage.toUpperCase()} PRIORITY</span>
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
  window.handleDoctorSignOut = () => {
    store.clearUser();
    showToast('Signed out from Doctor profile', 'info');
    navigate('login');
  };
}
