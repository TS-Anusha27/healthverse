// HealthVerse â€” Telemedicine / Video Call UI
import { navigate, goBack } from '../../routes/router.js';
import { mockData } from '../../services/data.js';
import { showToast, showModal } from '../../utils/utils.js';
import { getDoctors, createTelemedicineSession } from '../../services/supabase/db.js';
import { store } from '../../store/store.js';

let callTimer = null;
let callSeconds = 0;

export function renderTelemedicine() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="screen" id="tele-screen" style="background:var(--bg);">
      <div class="page-header">
        <button class="back-btn" onclick="goBack()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div class="page-title">Telemedicine</div>
        <button class="btn-icon btn-ghost" aria-label="Help">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        </button>
      </div>

      <div class="screen-content" style="padding-bottom:100px;">
        <!-- Available Doctors for Video -->
        <div class="section mt-3">
          <div style="background:linear-gradient(135deg,#E8F4FD,#DBEEFF);border-radius:16px;padding:16px 18px;margin-bottom:20px;display:flex;align-items:center;gap:12px;">
            <div style="width:44px;height:44px;background:var(--primary);border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
            </div>
            <div>
              <div style="font-family:var(--font-display);font-size:15px;font-weight:700;color:var(--primary);">Video Consultations</div>
              <div style="font-size:12px;color:var(--text-secondary);margin-top:2px;">Consult top doctors from home â€¢ No travel needed</div>
            </div>
          </div>

          <div class="section-header">
            <div class="section-title">Available Now</div>
            <span class="section-link">See All</span>
          </div>

          <div style="display:flex;flex-direction:column;gap:14px;" id="video-doctors">
            ${mockData.doctors.filter(d => d.available).map(doc => `
              <div class="tele-doctor-card" onclick="openBookingModal('${doc.id}')">
                <div class="tele-doc-avatar">${doc.name.split(' ').pop().charAt(0)}</div>
                <div style="flex:1;">
                  <div style="font-family:var(--font-display);font-size:15px;font-weight:700;color:var(--text-primary);">${doc.name}</div>
                  <div style="font-size:12px;color:var(--text-secondary);margin-top:2px;">${doc.specialty}</div>
                  <div style="font-size:11px;color:var(--text-tertiary);margin-top:2px;">${doc.qualification}</div>
                  <div style="display:flex;align-items:center;gap:8px;margin-top:6px;">
                    <span style="font-size:11px;font-weight:600;color:var(--warning);">â­ ${doc.rating}</span>
                    <span style="font-size:11px;color:var(--text-tertiary);">${doc.experience}yrs exp</span>
                    <div style="display:flex;align-items:center;gap:3px;">
                      <div style="width:6px;height:6px;background:var(--success);border-radius:50%;animation:pulse-ring 1.5s infinite;"></div>
                      <span style="font-size:11px;color:var(--success);font-weight:600;">Online</span>
                    </div>
                  </div>
                  <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:6px;">
                    ${doc.languages.map(l => `<span style="font-size:10px;padding:2px 7px;background:var(--surface-dim);border-radius:20px;color:var(--text-secondary);">${l}</span>`).join('')}
                  </div>
                </div>
                <div style="text-align:right;flex-shrink:0;">
                  <div style="font-family:var(--font-display);font-size:17px;font-weight:800;color:var(--primary);">â‚¹${doc.fee}</div>
                  <div style="font-size:11px;color:var(--text-secondary);margin-top:2px;">Next: ${doc.nextSlot}</div>
                  <button class="btn btn-primary btn-xs mt-2" onclick="event.stopPropagation();startCall('${doc.id}')">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                    Consult Now
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Past Consultations -->
        <div class="section mt-5">
          <div class="section-title mb-3">Past Consultations</div>
          <div style="display:flex;flex-direction:column;gap:10px;">
            ${[
              { doctor: 'Dr. Priya Krishnamurthy', specialty: 'Cardiologist', date: '18 Jul 2026', duration: '22 min', fee: 800 },
              { doctor: 'Dr. Sunita Sharma', specialty: 'Pulmonologist', date: '5 Jun 2026', duration: '18 min', fee: 750 }
            ].map(c => `
              <div class="card card-sm" style="cursor:pointer;">
                <div class="flex items-center gap-12px">
                  <div class="icon-box icon-box-primary">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                  </div>
                  <div style="flex:1;">
                    <div style="font-size:14px;font-weight:600;color:var(--text-primary);">${c.doctor}</div>
                    <div style="font-size:12px;color:var(--text-secondary);">${c.specialty} â€¢ ${c.date}</div>
                    <div style="font-size:11px;color:var(--text-tertiary);">Duration: ${c.duration}</div>
                  </div>
                  <div style="text-align:right;">
                    <div style="font-size:13px;font-weight:700;color:var(--text-primary);">â‚¹${c.fee}</div>
                    <div class="badge badge-success" style="margin-top:4px;">Completed</div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;

  injectTeleStyles();
  initTeleHandlers();
}

function injectTeleStyles() {
  if (document.getElementById('tele-styles')) return;
  const s = document.createElement('style');
  s.id = 'tele-styles';
  s.textContent = `
    .tele-doctor-card {
      display:flex;align-items:flex-start;gap:12px;padding:16px;
      background:var(--surface);border-radius:18px;box-shadow:var(--shadow-sm);
      border:1px solid var(--border-light);cursor:pointer;transition:all var(--transition-normal);
    }
    .tele-doctor-card:hover { box-shadow:var(--shadow-md);transform:translateY(-2px); }
    .tele-doc-avatar {
      width:52px;height:52px;border-radius:50%;
      background:linear-gradient(135deg,var(--primary),var(--secondary));
      display:flex;align-items:center;justify-content:center;
      font-family:var(--font-display);font-size:22px;font-weight:700;color:white;flex-shrink:0;
    }
    .video-call-screen {
      position:fixed;inset:0;background:#0A0E1A;z-index:999;
      display:flex;flex-direction:column;align-items:center;justify-content:center;
    }
    .video-remote { width:100%;height:100%;object-fit:cover;position:absolute;inset:0; }
    .video-local {
      position:absolute;bottom:120px;right:20px;
      width:110px;height:150px;background:#1A2335;border-radius:16px;
      border:2.5px solid white;overflow:hidden;box-shadow:var(--shadow-xl);
      display:flex;align-items:center;justify-content:center;
    }
    .call-controls {
      position:absolute;bottom:0;left:0;right:0;
      padding:20px 30px calc(30px + var(--safe-bottom));
      display:flex;align-items:center;justify-content:center;gap:20px;
      background:linear-gradient(0deg,rgba(10,14,26,0.9),transparent);
    }
    .call-btn {
      width:60px;height:60px;border-radius:50%;display:flex;align-items:center;justify-content:center;
      cursor:pointer;border:none;transition:all var(--transition-spring);
    }
    .call-btn:hover { transform:scale(1.1); }
    .call-btn:active { transform:scale(0.95); }
    .call-btn-end { width:72px;height:72px;background:var(--emergency);box-shadow:var(--shadow-emergency); }
  `;
  document.head.appendChild(s);
}

function initTeleHandlers() {
  window.confirmVideoBooking = async (docId, slot) => {
    const doc = mockData.doctors.find(d => d.id === docId) || { name: 'Dr. Priya K.' };
    const roomId = 'room_' + Math.random().toString(36).substring(2, 9);
    
    await createTelemedicineSession({
      patient_id: store.currentUser?.id || null,
      doctor_id: docId,
      room_id: roomId,
      status: 'waiting'
    });

    closeModal();
    showToast(`Video consultation confirmed with ${doc.name} for ${slot}! Saved to Supabase.`, 'success', 5000);
    setTimeout(() => startVideoCall(doc.name, doc.specialty), 800);
  };

  window.openBookingModal = (docId) => {
    const doc = mockData.doctors.find(d => d.id === docId);
    if (!doc) return;
    showModal(`
      <h3 style="font-family:var(--font-display);font-size:18px;font-weight:700;margin-bottom:4px;">${doc.name}</h3>
      <div style="font-size:13px;color:var(--text-secondary);margin-bottom:16px;">${doc.specialty} â€¢ ${doc.hospital}</div>
      <div style="background:var(--surface-dim);border-radius:14px;padding:14px;margin-bottom:16px;font-size:14px;">
        <p style="color:var(--text-secondary);line-height:1.6;">${doc.about}</p>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:20px;">
        <div class="flex justify-between"><span style="color:var(--text-secondary);">Experience</span><strong>${doc.experience} years</strong></div>
        <div class="flex justify-between"><span style="color:var(--text-secondary);">Rating</span><strong>â­  ${doc.rating} (${doc.reviews} reviews)</strong></div>
        <div class="flex justify-between"><span style="color:var(--text-secondary);">Consultation Fee</span><strong style="color:var(--primary);">â‚¹${doc.fee}</strong></div>
        <div class="flex justify-between"><span style="color:var(--text-secondary);">Next Available</span><strong style="color:var(--success);">${doc.nextSlot}</strong></div>
      </div>
      <div style="display:flex;gap:10px;">
        <button class="btn btn-primary" style="flex:2;" onclick="startCall('${doc.id}');closeModal()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
          Start Video Call
        </button>
        <button class="btn btn-outline" style="flex:1;" onclick="closeModal();navigate('appointments')">Schedule</button>
      </div>
    `);
  };

  window.startCall = (docId) => {
    const doc = mockData.doctors.find(d => d.id === docId);
    if (!doc) return;

    // Show waiting room
    const waitScreen = document.createElement('div');
    waitScreen.id = 'wait-room';
    waitScreen.style.cssText = 'position:fixed;inset:0;background:linear-gradient(160deg,#1A2332,#1E3A5F);z-index:998;display:flex;flex-direction:column;align-items:center;justify-content:center;';
    waitScreen.innerHTML = `
      <div style="text-align:center;animation:scaleIn 0.5s var(--transition-spring);">
        <div style="width:100px;height:100px;border-radius:50%;background:linear-gradient(135deg,var(--primary),var(--secondary));display:flex;align-items:center;justify-content:center;margin:0 auto 20px;font-size:42px;font-weight:700;color:white;font-family:var(--font-display);">${doc.name.split(' ').pop().charAt(0)}</div>
        <div style="font-family:var(--font-display);font-size:22px;font-weight:700;color:white;">${doc.name}</div>
        <div style="font-size:14px;color:rgba(255,255,255,0.7);margin-top:6px;">${doc.specialty}</div>
        <div style="margin-top:30px;display:flex;gap:6px;justify-content:center;">
          <div class="splash-dot"></div><div class="splash-dot"></div><div class="splash-dot"></div>
        </div>
        <div style="font-size:14px;color:rgba(255,255,255,0.6);margin-top:12px;" id="connecting-text">Connecting to Waiting Room...</div>
      </div>
      <button style="position:absolute;bottom:50px;padding:14px 40px;background:var(--emergency);color:white;border:none;border-radius:999px;font-family:var(--font-display);font-size:15px;font-weight:700;cursor:pointer;" onclick="document.getElementById('wait-room').remove();showToast('Call cancelled','info');">
        Cancel
      </button>
    `;
    document.body.appendChild(waitScreen);

    setTimeout(() => {
      const textEl = document.getElementById('connecting-text');
      if (textEl) textEl.textContent = 'Doctor is joining...';
    }, 1500);

    setTimeout(() => {
      waitScreen.remove();
      startVideoCallUI(doc);
    }, 3000);
  };
}

function startVideoCallUI(doc) {
  callSeconds = 0;
  const callScreen = document.createElement('div');
  callScreen.id = 'video-call-screen';
  callScreen.className = 'video-call-screen';
  callScreen.innerHTML = `
    <!-- Simulated Video Background -->
    <div style="position:absolute;inset:0;background:linear-gradient(160deg,#1A2332 0%,#0D2840 100%);display:flex;align-items:center;justify-content:center;">
      <div style="text-align:center;opacity:0.3;">
        <div style="font-size:80px;margin-bottom:10px;">ðŸ‘¨â€âš•ï¸</div>
        <div style="color:white;font-size:14px;">Dr. ${doc.name}</div>
      </div>
    </div>

    <!-- Top Info -->
    <div style="position:absolute;top:0;left:0;right:0;padding:calc(20px + var(--safe-top)) 20px 20px;background:linear-gradient(180deg,rgba(10,14,26,0.8),transparent);">
      <div style="display:flex;align-items:center;justify-content:space-between;">
        <div>
          <div style="font-family:var(--font-display);font-size:18px;font-weight:700;color:white;">${doc.name}</div>
          <div style="font-size:13px;color:rgba(255,255,255,0.7);">${doc.specialty}</div>
        </div>
        <div style="background:rgba(46,213,115,0.2);border:1px solid rgba(46,213,115,0.4);padding:6px 14px;border-radius:999px;display:flex;align-items:center;gap:6px;">
          <div style="width:7px;height:7px;background:var(--success);border-radius:50%;"></div>
          <span style="font-size:12px;font-weight:700;color:var(--success);" id="call-timer">00:00</span>
        </div>
      </div>
    </div>

    <!-- Local Video -->
    <div class="video-local">
      <div style="width:100%;height:100%;background:linear-gradient(135deg,#1E3A5F,#0D4F3C);display:flex;align-items:center;justify-content:center;font-size:36px;">ðŸ§‘</div>
    </div>

    <!-- Floating Action: Share Report -->
    <div style="position:absolute;right:20px;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;gap:12px;">
      <button class="call-btn" style="background:rgba(255,255,255,0.15);backdrop-filter:blur(10px);" onclick="showToast('Report shared with doctor','success')" title="Share Report">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
      </button>
      <button class="call-btn" style="background:rgba(255,255,255,0.15);backdrop-filter:blur(10px);" onclick="showToast('Chat opened','info')" title="Chat">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      </button>
    </div>

    <!-- Call Controls -->
    <div class="call-controls">
      <button class="call-btn" id="btn-mic" style="background:rgba(255,255,255,0.15);" onclick="toggleMic(this)">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
      </button>
      <button class="call-btn call-btn-end" onclick="endCall()">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.42 19.42 0 0 1 4.43 9.44 19.79 19.79 0 0 1 1.36 .82"/><line x1="23" y1="1" x2="1" y2="23"/></svg>
      </button>
      <button class="call-btn" id="btn-cam" style="background:rgba(255,255,255,0.15);" onclick="toggleCam(this)">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
      </button>
    </div>
  `;
  document.body.appendChild(callScreen);

  // Start timer
  callTimer = setInterval(() => {
    callSeconds++;
    const mins = String(Math.floor(callSeconds / 60)).padStart(2, '0');
    const secs = String(callSeconds % 60).padStart(2, '0');
    const timerEl = document.getElementById('call-timer');
    if (timerEl) timerEl.textContent = `${mins}:${secs}`;
  }, 1000);

  window.endCall = () => {
    clearInterval(callTimer);
    callScreen.remove();
    const duration = `${Math.floor(callSeconds / 60)}:${String(callSeconds % 60).padStart(2, '0')}`;
    showToast(`Call ended â€¢ Duration: ${duration} â€¢ Prescription will be sent shortly`, 'success', 5000);
  };

  window.toggleMic = (btn) => {
    btn.style.background = btn.dataset.muted ? 'rgba(255,255,255,0.15)' : 'rgba(255,71,87,0.7)';
    btn.dataset.muted = btn.dataset.muted ? '' : '1';
    showToast(btn.dataset.muted ? 'Microphone muted' : 'Microphone on', 'info');
  };

  window.toggleCam = (btn) => {
    btn.style.background = btn.dataset.off ? 'rgba(255,255,255,0.15)' : 'rgba(255,71,87,0.7)';
    btn.dataset.off = btn.dataset.off ? '' : '1';
    showToast(btn.dataset.off ? 'Camera off' : 'Camera on', 'info');
  };
}
