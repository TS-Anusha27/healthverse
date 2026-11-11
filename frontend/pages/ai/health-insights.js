// HealthVerse — AI Health Insights & Vital Charts with Supabase Integration
import { navigate, goBack } from '../../routes/router.js';
import { mockData } from '../../services/data.js';
import { showToast, renderSkeletonCards, renderEmptyState, renderErrorState, escapeHtml, applyCountUps } from '../../utils/utils.js';
import { getAISummary } from '../../services/supabase/db.js';
import { renderBottomNav } from '../patient/patient-home.js';

let chartInstance = null;

export function renderHealthInsights() {
  const app = document.getElementById('app');

  app.innerHTML = `
    <div class="screen" style="background:var(--bg);">
      <div class="page-header" style="background:linear-gradient(135deg,#17A589,#117A65);border-bottom:none;">
        <button class="back-btn" onclick="goBack()" style="background:rgba(255,255,255,0.15);border-color:rgba(255,255,255,0.2);">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div style="flex:1;">
          <div style="font-family:var(--font-display);font-size:17px;font-weight:700;color:white;">AI Health Insights</div>
          <div style="font-size:12px;color:rgba(255,255,255,0.75);">Predictive Risk & Vital Trends</div>
        </div>
      </div>

      <div class="screen-content" id="insights-content" style="padding:20px;padding-bottom:100px;">
        ${renderSkeletonCards(2, false)}
      </div>
      ${renderBottomNav('home', { desktopOnly: true })}
    </div>
  `;

  window.retryHealthInsights = () => loadHealthInsightsData();
  loadHealthInsightsData();
}

async function loadHealthInsightsData() {
  const container = document.getElementById('insights-content');
  if (!container) return;
  container.innerHTML = renderSkeletonCards(2, false);

  try {
    const summary = await getAISummary();
    if (!document.getElementById('insights-content')) return;

    const recs = summary?.recommendations || [];
    if (!summary || (!summary.riskScores && recs.length === 0)) {
      container.innerHTML = renderEmptyState({
        title: 'No health insights yet',
        description: 'Complete a health check-in or upload lab reports to generate your AI health analysis.',
        actionLabel: 'Upload Records',
        actionOnclick: "navigate('health-records')"
      });
      return;
    }

    const htn = summary.riskScores?.hypertension ?? 65;
    const cvd = summary.riskScores?.cardiovascular ?? 24;
    const dia = summary.riskScores?.diabetes ?? 18;

    container.innerHTML = `
      <!-- AI Risk Assessment Card -->
      <div class="card mb-4" style="padding:20px;">
        <div style="font-family:var(--font-display);font-size:16px;font-weight:700;margin-bottom:16px;display:flex;align-items:center;gap:8px;">
          <span>🤖 AI Risk Prediction</span>
          <span class="badge badge-success" style="margin-left:auto;">Score: <span data-countup="${escapeHtml(summary.healthScore || 82)}">${escapeHtml(summary.healthScore || 82)}</span></span>
        </div>

        <div style="display:flex;flex-direction:column;gap:14px;">
          <div>
            <div class="flex justify-between text-body-sm mb-1">
              <span style="font-weight:600;">Hypertension Risk</span>
              <span style="color:var(--warning);font-weight:700;">${escapeHtml(htn)}% (Moderate)</span>
            </div>
            <div class="progress-bar"><div class="progress-fill" style="width:${Number(htn) || 0}%;background:var(--warning);"></div></div>
          </div>

          <div>
            <div class="flex justify-between text-body-sm mb-1">
              <span style="font-weight:600;">Cardiovascular Risk</span>
              <span style="color:var(--primary);font-weight:700;">${escapeHtml(cvd)}% (Low)</span>
            </div>
            <div class="progress-bar"><div class="progress-fill" style="width:${Number(cvd) || 0}%;background:var(--primary);"></div></div>
          </div>

          <div>
            <div class="flex justify-between text-body-sm mb-1">
              <span style="font-weight:600;">Diabetes Risk</span>
              <span style="color:var(--secondary);font-weight:700;">${escapeHtml(dia)}% (Low)</span>
            </div>
            <div class="progress-bar"><div class="progress-fill" style="width:${Number(dia) || 0}%;background:var(--secondary);"></div></div>
          </div>
        </div>
      </div>

      <!-- Recommendations -->
      <div class="card mb-4" style="padding:20px;">
        <div style="font-family:var(--font-display);font-size:16px;font-weight:700;margin-bottom:12px;">💡 Personal Recommendations</div>
        <div style="display:flex;flex-direction:column;gap:8px;">
          ${recs.length > 0 ? recs.map(r => `
            <div style="display:flex;align-items:center;gap:10px;font-size:13px;color:var(--text-primary);background:var(--surface-dim);padding:10px 14px;border-radius:10px;">
              <span style="color:var(--secondary);font-weight:700;">✓</span>
              ${escapeHtml(r)}
            </div>
          `).join('') : '<div style="font-size:13px;color:var(--text-secondary);">No new recommendations at this time.</div>'}
        </div>
      </div>
    `;
    applyCountUps(container);
  } catch (err) {
    if (!document.getElementById('insights-content')) return;
    container.innerHTML = renderErrorState({
      title: 'Unable to load AI insights',
      description: err?.message || 'Could not fetch predictive health insights. Please try again.',
      retryOnclick: 'retryHealthInsights()'
    });
  }
}
