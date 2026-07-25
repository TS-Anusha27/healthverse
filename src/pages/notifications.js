// HealthVerse — Notifications Panel
import { navigate, goBack } from '../router.js';
import { showToast } from '../utils.js';

export function renderNotifications() {
  const notifications = [
    { title: 'Appointment Reminder', time: '10 mins ago', desc: 'Your appointment with Dr. Priya Krishnamurthy is at 3:30 PM today.', type: 'appointment', icon: '📅' },
    { title: 'Medicine Reminder', time: '2 hours ago', desc: 'Time to take Metoprolol 25mg after lunch.', type: 'medicine', icon: '💊' },
    { title: 'Blood Donation Urgent Alert', time: '5 hours ago', desc: 'Apollo Hospitals urgently needs B+ Blood. Can you donate?', type: 'blood', icon: '🩸' },
    { title: 'Lab Report Ready', time: 'Yesterday', desc: 'Your Complete Blood Count (CBC) report is ready for download.', type: 'report', icon: '📄' }
  ];

  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="screen" style="background:var(--bg);">
      <div class="page-header">
        <button class="back-btn" onclick="goBack()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div class="page-title">Notifications</div>
        <button class="btn-ghost btn-xs" onclick="showToast('All notifications marked as read','success')">Mark Read</button>
      </div>

      <div class="screen-content" style="padding:20px;padding-bottom:100px;">
        <div style="display:flex;flex-direction:column;gap:10px;">
          ${notifications.map(n => `
            <div class="card card-sm" style="cursor:pointer;" onclick="handleNotifClick('${n.type}')">
              <div class="flex items-start gap-3">
                <div style="width:40px;height:40px;border-radius:12px;background:var(--surface-dim);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;">
                  ${n.icon}
                </div>
                <div style="flex:1;">
                  <div class="flex justify-between items-center">
                    <span style="font-family:var(--font-display);font-size:14px;font-weight:700;">${n.title}</span>
                    <span style="font-size:11px;color:var(--text-tertiary);">${n.time}</span>
                  </div>
                  <div style="font-size:12px;color:var(--text-secondary);margin-top:4px;line-height:1.4;">${n.desc}</div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  window.handleNotifClick = (type) => {
    if (type === 'appointment') navigate('live-queue');
    else if (type === 'medicine') navigate('medicines');
    else if (type === 'blood') navigate('blood-donation');
    else if (type === 'report') navigate('health-records');
  };
}
