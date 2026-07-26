// HealthVerse â€” AI Health Insights & Vital Charts
import { navigate, goBack } from '../../routes/router.js';
import { mockData, mockAISummary } from '../../services/data.js';
import { showToast } from '../../utils/utils.js';

let chartInstance = null;

export function renderHealthInsights() {
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
            <span>ðŸ¤– AI Risk Prediction</span>
            <span class="badge badge-success" style="margin-left:auto;">Low Overall Risk</span>
          </div>

          <div style="display:flex;flex-direction:column;gap:14px;">
            <div>
              <div class="flex justify-between text-body-sm mb-1">
                <span style="font-weight:600;">Hypertension Risk</span>
                <span style="color:var(--warning);font-weight:700;">65% (Moderate)</span>
              </div>
              <div class="progress-bar"><div class="progress-fill" style="width:65%;background:var(--warning);"></div></div>
            </div>

            <div>
              <div class="flex justify-between text-body-sm mb-1">
                <span style="font-weight:600;">Cardiovascular Risk</span>
                <span style="color:var(--primary);font-weight:700;">24% (Low)</span>
              </div>
              <div class="progress-bar"><div class="progress-fill" style="width:24%;background:var(--primary);"></div></div>
            </div>

            <div>
              <div class="flex justify-between text-body-sm mb-1">
                <span style="font-weight:600;">Diabetes Risk</span>
                <span style="color:var(--secondary);font-weight:700;">18% (Low)</span>
              </div>
              <div class="progress-bar"><div class="progress-fill" style="width:18%;background:var(--secondary);"></div></div>
            </div>
          </div>
        </div>

        <!-- Vital Trends Chart -->
        <div class="card mb-4" style="padding:18px;">
          <div class="flex items-center justify-between mb-3">
            <div style="font-family:var(--font-display);font-size:15px;font-weight:700;">Blood Pressure Trend</div>
            <span style="font-size:12px;color:var(--text-secondary);">Last 15 Days</span>
          </div>
          <div style="height:200px;width:100%;">
            <canvas id="vitals-chart"></canvas>
          </div>
        </div>

        <!-- AI Lifestyle Recommendations -->
        <div class="card mb-4" style="padding:18px;">
          <div style="font-family:var(--font-display);font-size:15px;font-weight:700;margin-bottom:12px;color:var(--primary);">
            ðŸ’¡ AI Recommendations
          </div>
          <div style="display:flex;flex-direction:column;gap:10px;">
            ${mockAISummary.recommendations.map(rec => `
              <div style="display:flex;align-items:flex-start;gap:10px;font-size:13px;color:var(--text-primary);">
                <span style="color:var(--secondary);font-weight:700;margin-top:2px;">â€¢</span>
                <span>${rec}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;

  setTimeout(() => {
    initChart(vitals);
  }, 100);

  return () => {
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }
  };
}

function initChart(vitals) {
  const ctx = document.getElementById('vitals-chart')?.getContext('2d');
  if (!ctx || typeof Chart === 'undefined') return;

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: vitals.labels,
      datasets: [
        {
          label: 'Systolic (mmHg)',
          data: vitals.bloodPressure.systolic,
          borderColor: '#4A90D9',
          backgroundColor: 'rgba(74,144,217,0.1)',
          tension: 0.3,
          fill: true
        },
        {
          label: 'Diastolic (mmHg)',
          data: vitals.bloodPressure.diastolic,
          borderColor: '#52C99B',
          backgroundColor: 'transparent',
          tension: 0.3,
          borderDash: [5, 5]
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { family: 'Inter', size: 11 } } } },
      scales: {
        x: { grid: { display: false } },
        y: { min: 60, max: 140, grid: { color: '#EEF2F7' } }
      }
    }
  });
}
