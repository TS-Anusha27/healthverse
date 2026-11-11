// HealthVerse — Shared Plain-Language Medicine & Prescription Explainer Modal
import { showModal, escapeHtml } from '../../utils/utils.js';
import { uiIcon } from '../../utils/icons.js';
import { getDemoPlainExplanation } from './demoAiFallback.js';

const LANGUAGES = [
  { code: 'English', label: 'English' },
  { code: 'Tamil', label: 'தமிழ்' },
  { code: 'Hindi', label: 'हिन्दी' }
];

let activeExplainToken = 0;

/**
 * Open a modal that calls /api/ai/explain with a language switcher (English / Tamil / Hindi).
 */
export function openSimpleExplainModal({ kind = 'medicine', name = '', contextNote = '', initialLanguage = 'English' } = {}) {
  const itemText = contextNote ? `${name} — ${contextNote}` : name;
  let currentLang = initialLanguage;

  const renderModalShell = (lang) => `
    <div style="padding:10px 4px 4px;">
      <div class="ai-explain-header" style="margin-bottom:8px;">
        <div class="ai-explain-title-row">
          <span class="ai-explain-icon">${uiIcon('bot', { size: 15 })}</span>
          <span class="ai-explain-title">Explain in Simple Words</span>
        </div>
        <span class="ai-explain-badge">AI-generated, not medical advice</span>
      </div>
      <div style="font-size:14px;font-weight:700;color:var(--text-primary);margin-bottom:10px;">
        ${escapeHtml(name)}
      </div>
      <div class="flex gap-2 mb-3" role="group" aria-label="Choose explanation language">
        ${LANGUAGES.map((l) => `
          <button
            type="button"
            class="btn ${l.code === lang ? 'btn-primary' : 'btn-outline'} btn-xs flex-1"
            aria-pressed="${l.code === lang ? 'true' : 'false'}"
            data-lang="${escapeHtml(l.code)}"
            onclick="window.__hvSwitchExplainLang(this.dataset.lang)"
          >
            ${escapeHtml(l.label)}
          </button>
        `).join('')}
      </div>
      <div id="ai-simple-explain-body" aria-live="polite"></div>
    </div>
  `;

  const fetchAndRender = async (lang) => {
    const token = ++activeExplainToken;
    const bodyEl = document.getElementById('ai-simple-explain-body');
    if (!bodyEl) return;

    bodyEl.innerHTML = `
      <div class="ai-explain-card">
        <div class="ai-explain-skeleton">
          <div class="skeleton skeleton-line" style="width:92%;"></div>
          <div class="skeleton skeleton-line" style="width:80%;"></div>
          <div class="skeleton skeleton-line" style="width:65%;"></div>
        </div>
      </div>
    `;

    let controller = null;
    let timeoutId = null;

    try {
      if (typeof AbortController !== 'undefined') {
        controller = new AbortController();
        timeoutId = setTimeout(() => controller.abort(), 8000);
      }

      const res = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind, item: itemText, language: lang }),
        ...(controller ? { signal: controller.signal } : {})
      });
      if (timeoutId) clearTimeout(timeoutId);
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.whatItDoes) {
        throw new Error(data?.error || 'Unable to generate explanation right now.');
      }

      if (token !== activeExplainToken) return;
      renderExplanationBody(data);
    } catch {
      if (timeoutId) clearTimeout(timeoutId);
      await new Promise((r) => setTimeout(r, 240));
      if (token !== activeExplainToken) return;
      renderExplanationBody(getDemoPlainExplanation({ item: itemText, language: lang }));
    }

    function renderExplanationBody(data) {
      const target = document.getElementById('ai-simple-explain-body');
      if (!target) return;

      const watchHtml = Array.isArray(data.thingsToWatch) && data.thingsToWatch.length > 0
        ? `
          <div class="ai-explain-section">
            <div class="ai-explain-label">Things to Keep in Mind</div>
            <ul class="ai-explain-list">
              ${data.thingsToWatch.map((t) => `<li>${escapeHtml(t)}</li>`).join('')}
            </ul>
          </div>
        `
        : '';

      const doctorHtml = Array.isArray(data.askDoctorIf) && data.askDoctorIf.length > 0
        ? `
          <div class="ai-explain-section ai-explain-flags">
            <div class="ai-explain-label">Check with Your Doctor If</div>
            <ul class="ai-explain-list">
              ${data.askDoctorIf.map((t) => `<li>${escapeHtml(t)}</li>`).join('')}
            </ul>
          </div>
        `
        : '';

      target.innerHTML = `
        <div class="ai-explain-card">
          <p class="ai-explain-summary">${escapeHtml(data.whatItDoes || '')}</p>
          ${data.howUsuallyTaken ? `<p class="ai-explain-why"><strong>Reminder:</strong> ${escapeHtml(data.howUsuallyTaken)}</p>` : ''}
          ${watchHtml}
          ${doctorHtml}
          <div class="ai-explain-disclaimer">${escapeHtml(data.disclaimer || 'AI-generated guidance — follow your doctor’s instructions.')}</div>
        </div>
      `;
    }
  };

  window.__hvSwitchExplainLang = (nextLang) => {
    currentLang = nextLang || 'English';
    document.querySelectorAll('#modal-body [data-lang]').forEach((btn) => {
      const isSelected = btn.getAttribute('data-lang') === currentLang;
      btn.className = `btn ${isSelected ? 'btn-primary' : 'btn-outline'} btn-xs flex-1`;
      btn.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
    });
    fetchAndRender(currentLang);
  };

  window.__hvRetryExplain = () => fetchAndRender(currentLang);

  showModal(renderModalShell(currentLang));
  fetchAndRender(currentLang);
}
