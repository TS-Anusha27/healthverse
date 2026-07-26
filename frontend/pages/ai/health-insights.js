// HealthVerse — AI Health Insights & Vital Charts with Supabase Integration
import { navigate, goBack } from '../../routes/router.js';
import { mockData } from '../../services/data.js';
import { showToast } from '../../utils/utils.js';
import { getAISummary } from '../../services/supabase/db.js';

let chartInstance = null;

export async function renderHealthInsights() {
  const summary = await getAISummary();
  const app = document.getElementById('app');
  const vitals = mockData.vitals;

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

      <div class="screen-content" style="padding:20px;padding-bottom:100px;">
        <!-- AI Risk Assessment Card -->
        <div class="card mb-4" style="padding:20px;">
          <div style="font-family:var(--font-display);font-size:16px;font-weight:700;margin-bottom:16px;display:flex;align-items:center;gap:8px;">
            <span>🤖 AI Risk Prediction (Supabase Synced)</span>
            <span class="badge badge-success" style="margin-left:auto;">Score: ${summary.healthScore || 82}</span>
          </div>

          <div style="display:flex;flex-direction:column;gap:14px;">
            <div>
              <div class="flex justify-between text-body-sm mb-1">
                <span style="font-weight:600;">Hypertension Risk</span>
                <span style="color:var(--warning);font-weight:700;">${summary.riskScores?.hypertension || 65}% (Moderate)</span>
              </div>
              <div class="progress-bar"><div class="progress-fill" style="width:${summary.riskScores?.hypertension || 65}%;background:var(--warning);"></div></div>
            </div>

            <div>
              <div class="flex justify-between text-body-sm mb-1">
                <span style="font-weight:600;">Cardiovascular Risk</span>
                <span style="color:var(--primary);font-weight:700;">${summary.riskScores?.cardiovascular || 24}% (Low)</span>
              </div>
              <div class="progress-bar"><div class="progress-fill" style="width:${summary.riskScores?.cardiovascular || 24}%;background:var(--primary);"></div></div>
            </div>

            <div>
              <div class="flex justify-between text-body-sm mb-1">
                <span style="font-weight:600;">Diabetes Risk</span>
                <span style="color:var(--secondary);font-weight:700;">${summary.riskScores?.diabetes || 18}% (Low)</span>
              </div>
              <div class="progress-bar"><div class="progress-fill" style="width:${summary.riskScores?.diabetes || 18}%;background:var(--secondary);"></div></div>
            </div>
          </div>
        </div>

        <!-- Recommendations -->
        <div class="card mb-4" style="padding:20px;">
          <div style="font-family:var(--font-display);font-size:16px;font-weight:700;margin-bottom:12px;">💡 Personal Recommendations</div>
          <div style="display:flex;flex-direction:column;gap:8px;">
            ${(summary.recommendations || []).map(r => `
              <div style="display:flex;align-items:center;gap:10px;font-size:13px;color:var(--text-primary);background:var(--surface-dim);padding:10px 14px;border-radius:10px;">
                <span style="color:var(--secondary);font-weight:700;">✓</span>
                ${r}
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}
