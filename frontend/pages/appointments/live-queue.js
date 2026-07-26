// HealthVerse — Live Queue Tracker with Supabase Real-time Sync
import { navigate, goBack } from '../../routes/router.js';
import { mockData } from '../../services/data.js';
import { showToast, showModal, closeModal } from '../../utils/utils.js';
import { getAppointments, cancelAppointment, rescheduleAppointment } from '../../services/supabase/db.js';

let queueInterval = null;

export async function renderLiveQueue() {
  const appointments = await getAppointments();
  const appt = appointments[0] || mockData.appointments[0];
  const app = document.getElementById('app');

  app.innerHTML = `
    <div class="screen" id="queue-screen" style="background:var(--bg);">
      <div class="page-header" style="background:white;">
        <button class="back-btn" onclick="goBack()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div class="page-title">Live Queue</div>
        <div style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--secondary);font-weight:600;">
          <div style="width:7px;height:7px;background:var(--success);border-radius:50%;animation:pulse-ring 1.5s infinite;"></div>
          LIVE
        </div>
      </div>

      <div class="screen-content" style="padding:20px;padding-bottom:100px;">
        <!-- Doctor Status -->
        <div class="card" style="background:linear-gradient(135deg,#1E3A5F,#1A4F6E);padding:20px;margin-bottom:20px;">
          <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px;">
            <div style="width:56px;height:56px;border-radius:50%;background:rgba(255,255,255,0.15);border:2px solid rgba(255,255,255,0.3);display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-size:22px;font-weight:700;color:white;">P</div>
            <div>
              <div style="font-family:var(--font-display);font-size:17px;font-weight:700;color:white;">${appt.doctor_name || appt.doctorName}</div>
              <div style="font-size:13px;color:rgba(255,255,255,0.7);">${appt.specialty}</div>
              <div style="display:flex;align-items:center;gap:6px;margin-top:4px;">
                <div style="width:8px;height:8px;border-radius:50%;background:var(--success);animation:pulse-ring 1.5s infinite;"></div>
                <span style="font-size:12px;color:var(--success);font-weight:600;" id="doctor-status">In Consultation</span>
              </div>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1px 1fr 1px 1fr;gap:0;">
            <div style="text-align:center;">
              <div style="font-size:28px;font-weight:800;color:white;font-family:var(--font-display);" id="current-token">TK-041</div>
              <div style="font-size:11px;color:rgba(255,255,255,0.6);margin-top:2px;">CURRENT</div>
            </div>
            <div style="background:rgba(255,255,255,0.15);"></div>
            <div style="text-align:center;">
              <div style="font-size:28px;font-weight:800;color:var(--warning);font-family:var(--font-display);">${appt.token || 'TK-047'}</div>
              <div style="font-size:11px;color:rgba(255,255,255,0.6);margin-top:2px;">YOUR TOKEN</div>
            </div>
            <div style="background:rgba(255,255,255,0.15);"></div>
            <div style="text-align:center;">
              <div style="font-size:28px;font-weight:800;color:var(--secondary);font-family:var(--font-display);" id="wait-time">25</div>
              <div style="font-size:11px;color:rgba(255,255,255,0.6);margin-top:2px;">MINS WAIT</div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div style="display:flex;gap:12px;margin-bottom:20px;">
          <button class="btn btn-primary" style="flex:1;" onclick="rescheduleModal('${appt.id}')">Reschedule</button>
          <button class="btn btn-outline" style="flex:1;border-color:var(--emergency);color:var(--emergency);" onclick="cancelModal('${appt.id}')">Cancel</button>
        </div>
      </div>
    </div>
  `;

  initQueueHandlers();
}

function initQueueHandlers() {
  window.cancelModal = (id) => {
    showModal(`
      <div style="text-align:center;padding:16px;">
        <h3 class="text-h2" style="color:var(--emergency);margin-bottom:8px;">Cancel Appointment?</h3>
        <p class="text-caption" style="margin-bottom:20px;">Are you sure you want to cancel this booking? This action is saved to Supabase.</p>
        <button class="btn btn-emergency btn-full" onclick="handleCancel('${id}')">Yes, Cancel Booking</button>
        <button class="btn btn-ghost btn-full mt-2" onclick="closeModal()">Keep Appointment</button>
      </div>
    `);

    window.handleCancel = async (apptId) => {
      await cancelAppointment(apptId);
      showToast('Appointment cancelled in Supabase database', 'warning');
      closeModal();
      navigate('patient-home');
    };
  };

  window.rescheduleModal = (id) => {
    showModal(`
      <div style="padding:16px;">
        <h3 class="text-h2 text-center" style="margin-bottom:8px;">Reschedule Appointment</h3>
        <p class="text-caption text-center" style="margin-bottom:20px;">Select a new date and time slot</p>
        <div class="form-group">
          <label class="form-label">New Date</label>
          <input type="date" id="resched-date" class="form-input" value="${new Date().toISOString().split('T')[0]}" />
        </div>
        <div class="form-group mt-3">
          <label class="form-label">Time Slot</label>
          <select id="resched-slot" class="form-input form-select">
            <option>10:00 AM</option>
            <option>11:30 AM</option>
            <option>3:00 PM</option>
            <option>4:30 PM</option>
          </select>
        </div>
        <button class="btn btn-primary btn-full mt-4" onclick="handleReschedule('${id}')">Confirm Reschedule</button>
      </div>
    `);

    window.handleReschedule = async (apptId) => {
      const d = document.getElementById('resched-date').value;
      const s = document.getElementById('resched-slot').value;
      await rescheduleAppointment(apptId, d, s);
      showToast('Appointment rescheduled in Supabase!', 'success');
      closeModal();
      renderLiveQueue();
    };
  };
}
