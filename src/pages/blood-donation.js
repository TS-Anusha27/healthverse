// HealthVerse — Blood Donation + Organ Donation
import { navigate, goBack } from '../router.js';
import { mockData } from '../data.js';
import { showToast, showModal, closeModal } from '../utils.js';

export function renderBloodDonation() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="screen" style="background:var(--bg);">
      <div class="page-header" style="background:linear-gradient(135deg,#E74C3C,#C62828);border-bottom:none;">
        <button class="back-btn" onclick="goBack()" style="background:rgba(255,255,255,0.15);border-color:rgba(255,255,255,0.2);">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div style="flex:1;">
          <div style="font-family:var(--font-display);font-size:17px;font-weight:700;color:white;">Blood Donation</div>
          <div style="font-size:12px;color:rgba(255,255,255,0.7);">Save a life today 🩸</div>
        </div>
      </div>

      <div class="screen-content" style="padding-bottom:100px;">
        <!-- Hero -->
        <div class="section mt-3">
          <div style="background:linear-gradient(135deg,#FFF0F1,#FFE0E3);border-radius:18px;padding:20px;text-align:center;">
            <div style="font-size:48px;margin-bottom:10px;">🩸</div>
            <h2 style="font-family:var(--font-display);font-size:20px;font-weight:800;color:#E74C3C;">Donate Blood, Save Lives</h2>
            <p style="font-size:13px;color:var(--text-secondary);margin-top:6px;line-height:1.5;">1 unit of blood can save up to 3 lives.<br>Your donation matters.</p>
            <button class="btn btn-emergency mt-4" onclick="registerDonor()">
              Register as Donor
            </button>
          </div>
        </div>

        <!-- Your Blood Group -->
        <div class="section mt-4">
          <div class="card" style="padding:18px;">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-label">YOUR BLOOD GROUP</div>
                <div style="font-family:var(--font-display);font-size:36px;font-weight:800;color:#E74C3C;margin-top:4px;">B+</div>
              </div>
              <div style="text-align:right;">
                <div class="text-label">LAST DONATED</div>
                <div style="font-size:14px;font-weight:600;color:var(--text-primary);margin-top:4px;">3 months ago</div>
                <div class="badge badge-success mt-2">Eligible to Donate</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Active Requests -->
        <div class="section mt-4">
          <div class="section-header">
            <div class="section-title">Active Blood Requests</div>
            <span class="badge badge-emergency">3 Urgent</span>
          </div>
          <div style="display:flex;flex-direction:column;gap:12px;">
            ${[
              { patient: 'Ramesh K.', group: 'B+', hospital: 'Apollo Hospitals', units: 2, urgency: 'Urgent', time: '2 hours ago', distance: '1.2 km' },
              { patient: 'Lakshmi D.', group: 'O-', hospital: 'Fortis Healthcare', units: 3, urgency: 'Critical', time: '30 min ago', distance: '2.4 km' },
              { patient: 'Pradeep S.', group: 'AB+', hospital: 'MIOT International', units: 1, urgency: 'Normal', time: '5 hours ago', distance: '4.2 km' },
            ].map(req => `
              <div class="card card-sm" style="cursor:pointer;">
                <div class="flex items-center gap-3">
                  <div style="width:48px;height:48px;border-radius:50%;background:#FFF0F1;display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-size:16px;font-weight:800;color:#E74C3C;flex-shrink:0;">${req.group}</div>
                  <div style="flex:1;">
                    <div style="font-family:var(--font-display);font-size:14px;font-weight:700;">${req.patient} needs ${req.group}</div>
                    <div style="font-size:12px;color:var(--text-secondary);margin-top:2px;">${req.hospital} • ${req.distance}</div>
                    <div style="font-size:11px;color:var(--text-tertiary);margin-top:2px;">${req.units} unit(s) • ${req.time}</div>
                  </div>
                  <div style="text-align:right;">
                    <div class="badge ${req.urgency==='Critical'?'badge-emergency':req.urgency==='Urgent'?'badge-warning':'badge-primary'}" style="margin-bottom:6px;">${req.urgency}</div>
                    <button class="btn btn-emergency btn-xs" onclick="event.stopPropagation();acceptBloodRequest('${req.patient}')">Donate</button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Nearby Blood Banks -->
        <div class="section mt-4">
          <div class="section-title mb-3">Nearby Blood Banks</div>
          <div style="display:flex;flex-direction:column;gap:10px;">
            ${mockData.bloodBanks.map(bb => `
              <div class="card card-sm" style="cursor:pointer;" onclick="showToast('Opening directions to ${bb.name}...','info')">
                <div class="flex items-center gap-3">
                  <div class="icon-box icon-box-emergency">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                  </div>
                  <div style="flex:1;">
                    <div style="font-size:14px;font-weight:600;">${bb.name}</div>
                    <div style="font-size:12px;color:var(--text-secondary);margin-top:2px;">${bb.address} • ${bb.distance}</div>
                    <div style="font-size:11px;color:var(--success);margin-top:2px;">${bb.open24h ? '🟢 Open 24/7' : 'Check Hours'}</div>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Nearby Donors -->
        <div class="section mt-4 mb-4">
          <div class="section-title mb-3">Nearby Donors</div>
          <div style="display:flex;flex-direction:column;gap:10px;">
            ${mockData.bloodDonors.map(d => `
              <div class="card card-sm">
                <div class="flex items-center gap-3">
                  <div class="avatar" style="background:linear-gradient(135deg,#E74C3C,#C62828);color:white;">${d.name.charAt(0)}</div>
                  <div style="flex:1;">
                    <div style="font-size:14px;font-weight:600;">${d.name}</div>
                    <div style="font-size:12px;color:var(--text-secondary);">${d.group} • ${d.distance} away</div>
                    <div style="font-size:11px;color:var(--text-tertiary);">Last donated: ${d.lastDonated}</div>
                  </div>
                  <div class="badge ${d.eligible?'badge-success':'badge-warning'}">${d.eligible?'Eligible':'Not Yet'}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;

  window.registerDonor = () => {
    showModal(`
      <h3 style="font-family:var(--font-display);font-size:18px;font-weight:700;margin-bottom:20px;">Register as Blood Donor</h3>
      <div style="display:flex;flex-direction:column;gap:14px;">
        <div class="form-group"><label class="form-label">Blood Group</label><select class="form-input form-select"><option>B+</option><option>B-</option><option>O+</option><option>O-</option><option>A+</option><option>A-</option><option>AB+</option><option>AB-</option></select></div>
        <div class="form-group"><label class="form-label">Last Donation Date</label><input type="date" class="form-input" /></div>
        <div class="form-group"><label class="form-label">Any Health Conditions?</label><input type="text" class="form-input" placeholder="e.g. None, Anemia" /></div>
        <div style="background:var(--emergency-light);border-radius:10px;padding:12px;font-size:12px;color:var(--emergency);">
          ⚠️ You must be 18+ years, weigh at least 50kg, and have not donated in the last 56 days.
        </div>
      </div>
      <button class="btn btn-emergency btn-full mt-4" onclick="closeModal();showToast('✅ Registered as blood donor!','success')">
        Confirm Registration
      </button>
    `);
  };

  window.acceptBloodRequest = (patient) => {
    showToast(`🩸 Thank you! Notified ${patient}'s hospital. Directions sent.`, 'success', 4000);
  };
}

// Organ Donation Screen
export function renderOrganDonation() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="screen" style="background:var(--bg);">
      <div class="page-header">
        <button class="back-btn" onclick="goBack()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div class="page-title">Organ Donation</div>
      </div>

      <div class="screen-content" style="padding:20px;padding-bottom:100px;">
        <!-- Hero -->
        <div style="background:linear-gradient(135deg,#FCE4EC,#F8BBD0);border-radius:20px;padding:24px;text-align:center;margin-bottom:24px;">
          <div style="font-size:56px;margin-bottom:12px;animation:heartbeat 1.5s infinite;">❤️</div>
          <h2 style="font-family:var(--font-display);font-size:22px;font-weight:800;color:#C2185B;">Be a Hero</h2>
          <p style="font-size:14px;color:var(--text-secondary);margin-top:8px;line-height:1.6;">One organ donor can save up to 8 lives and enhance 75 more through tissue donation.</p>
        </div>

        <!-- Awareness Cards -->
        <div style="display:flex;flex-direction:column;gap:14px;">
          ${[
            { title: 'Why Donate?', desc: 'Over 5 lakh Indians need organ transplants every year, but only about 15,000 receive them.', icon: '💡', color: '#4A90D9' },
            { title: 'Who Can Donate?', desc: 'Anyone above 18 can pledge. After brain death, organs like heart, liver, kidneys, lungs can be donated.', icon: '✅', color: '#27AE60' },
            { title: 'Is It Safe?', desc: 'Living donation (kidney/liver) is very safe. The remaining organ compensates for the donated part.', icon: '🛡️', color: '#7B68EE' },
          ].map(c => `
            <div class="card" style="border-left:3px solid ${c.color};">
              <div style="font-size:24px;margin-bottom:8px;">${c.icon}</div>
              <div style="font-family:var(--font-display);font-size:16px;font-weight:700;color:var(--text-primary);">${c.title}</div>
              <div style="font-size:13px;color:var(--text-secondary);margin-top:6px;line-height:1.5;">${c.desc}</div>
            </div>
          `).join('')}
        </div>

        <!-- Registration -->
        <div class="card mt-4" style="padding:20px;text-align:center;">
          <div style="font-family:var(--font-display);font-size:17px;font-weight:700;margin-bottom:6px;">Ready to Register?</div>
          <p style="font-size:13px;color:var(--text-secondary);margin-bottom:16px;">Digital consent form — your family will be informed.</p>
          <button class="btn btn-primary btn-full" onclick="showToast('✅ Registered as organ donor! Digital consent saved.','success')">
            Pledge to Donate
          </button>
          <div style="font-size:11px;color:var(--text-tertiary);margin-top:12px;">
            Verified by National Organ & Tissue Transplant Organization (NOTTO)
          </div>
        </div>
      </div>
    </div>
  `;
}
