// HealthVerse — Notifications Panel connected to Supabase DB
import { navigate, goBack } from '../../routes/router.js';
import { showToast, escapeHtml, renderSkeletonCards, renderEmptyState, renderErrorState } from '../../utils/utils.js';
import { getNotifications } from '../../services/supabase/db.js';
import { store } from '../../store/store.js';

export function renderNotifications() {
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

      <div class="screen-content" id="notif-list-container" style="padding:20px;padding-bottom:100px;">
        ${renderSkeletonCards(3)}
      </div>
    </div>
  `;

  window.handleNotifClick = (type) => {
    if (type === 'appointment') navigate('live-queue');
    else if (type === 'medicine') navigate('medicines');
    else if (type === 'blood') navigate('blood-donation');
    else if (type === 'report') navigate('health-records');
  };
  window.retryNotifications = () => loadNotificationsData();

  loadNotificationsData();
}

async function loadNotificationsData() {
  const container = document.getElementById('notif-list-container');
  if (!container) return;
  container.innerHTML = renderSkeletonCards(3);

  try {
    const notifs = await getNotifications(store.currentUser?.id);
    if (!document.getElementById('notif-list-container')) return;

    if (!notifs || notifs.length === 0) {
      container.innerHTML = renderEmptyState({
        title: "You're all caught up",
        description: 'No new notifications right now. Reminders for appointments, medicines, and lab reports will appear here.',
        icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`
      });
      return;
    }

    const notifications = notifs.map(n => ({
      title: n.title,
      time: n.created_at ? new Date(n.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : (n.time || 'Just now'),
      desc: n.message,
      type: n.type || 'info',
      icon: n.type === 'appointment' ? '📅' : n.type === 'medicine' ? '💊' : n.type === 'blood' ? '🩸' : '📄'
    }));

    container.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:10px;">
        ${notifications.map(n => `
          <div class="card card-sm" style="cursor:pointer;" onclick="handleNotifClick('${escapeHtml(n.type)}')">
            <div class="flex items-start gap-3">
              <div style="width:40px;height:40px;border-radius:12px;background:var(--surface-dim);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;">
                ${n.icon}
              </div>
              <div style="flex:1;">
                <div class="flex justify-between items-center">
                  <span style="font-family:var(--font-display);font-size:14px;font-weight:700;">${escapeHtml(n.title)}</span>
                  <span style="font-size:11px;color:var(--text-tertiary);">${escapeHtml(n.time)}</span>
                </div>
                <div style="font-size:12px;color:var(--text-secondary);margin-top:4px;line-height:1.4;">${escapeHtml(n.desc)}</div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  } catch (err) {
    if (!document.getElementById('notif-list-container')) return;
    container.innerHTML = renderErrorState({
      title: 'Could not load notifications',
      description: err?.message || 'Unable to check your notifications right now.',
      retryOnclick: 'retryNotifications()'
    });
  }
}
