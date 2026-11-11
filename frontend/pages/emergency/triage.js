// HealthVerse — AI Triage Chat
import { navigate, goBack } from '../../routes/router.js';
import { triageEngine } from '../../services/data.js';
import { showToast, escapeHtml } from '../../utils/utils.js';
import { uiIcon } from '../../utils/icons.js';

let answers = [];
let currentQ = 0;
let pendingTimers = [];
let aiExplainToken = 0;

function clearPendingTimers() {
  pendingTimers.forEach(id => clearTimeout(id));
  pendingTimers = [];
}

function scheduleTriageTimeout(fn, delay) {
  const reducedMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const effectiveDelay = reducedMotion ? Math.min(delay, 120) : delay;
  const id = setTimeout(() => {
    pendingTimers = pendingTimers.filter(t => t !== id);
    if (!document.getElementById('triage-screen')) return;
    fn();
  }, effectiveDelay);
  pendingTimers.push(id);
  return id;
}

export function renderTriage() {
  const app = document.getElementById('app');
  clearPendingTimers();
  aiExplainToken++;
  answers = [];
  currentQ = 0;
  const totalQuestions = triageEngine.questions.length;

  app.innerHTML = `
    <div class="screen" id="triage-screen">
      <div class="page-header triage-header">
        <button class="back-btn btn-glass-back" onclick="goBack()" aria-label="Go back">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div class="flex-1">
          <div class="header-title-light">AI Health Triage</div>
          <div class="triage-status">
            <div class="triage-status-dot"></div>
            HealthVerse AI • Online
          </div>
        </div>
        <div class="triage-badge-pill">
          NOT a diagnosis
        </div>
      </div>

      <!-- Disclaimer Banner -->
      <div class="triage-disclaimer">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        <span class="triage-disclaimer-text">This AI suggests urgency only. It does not prescribe medicine or diagnose conditions.</span>
      </div>

      <!-- Question Progress Bar -->
      <div class="triage-progress-wrap" id="triage-progress-wrap">
        <div class="triage-progress-meta">
          <span id="triage-progress-label">Question 1 of ${totalQuestions}</span>
          <span id="triage-progress-pct">${Math.round((1 / totalQuestions) * 100)}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" id="triage-progress-fill" style="width:${Math.round((1 / totalQuestions) * 100)}%;"></div>
        </div>
      </div>

      <!-- Chat Area -->
      <div class="screen-content triage-chat-area" id="chat-area">
        <div id="options-container"></div>
      </div>

      <!-- Input Area -->
      <div id="chat-input-area" class="triage-input-dock">
        <div id="triage-back-row" class="triage-back-row hidden">
          <button type="button" class="btn btn-ghost btn-sm triage-back-btn" id="btn-triage-prev" onclick="goToPreviousTriageQuestion()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>
            <span>Change previous answer</span>
          </button>
        </div>
        <div id="quick-options" class="flex-col gap-2"></div>
      </div>
    </div>
  `;

  injectTriageStyles();
  initTriageActions();
  updateTriageProgress(0, false);

  const typingId = addTypingIndicator();
  scheduleTriageTimeout(() => {
    removeTypingIndicator(typingId);
    addChatMessage(
      `Hello! I'm HealthVerse AI. I'll ask you a few questions to assess the urgency of your symptoms. Remember, I'm not a substitute for a real doctor.<br><br><strong>Let's begin. ${escapeHtml(triageEngine.questions[0].text)}</strong>`,
      'ai',
      0
    );
    showOptions(triageEngine.questions[0]);
  }, 550);
}

function updateTriageProgress(qIndex, completed = false) {
  const total = triageEngine.questions.length;
  const label = document.getElementById('triage-progress-label');
  const pctEl = document.getElementById('triage-progress-pct');
  const fill = document.getElementById('triage-progress-fill');
  if (completed) {
    if (label) label.textContent = `Question ${total} of ${total} • Assessment Ready`;
    if (pctEl) pctEl.textContent = '100%';
    if (fill) fill.style.width = '100%';
    return;
  }
  const step = Math.min(qIndex + 1, total);
  const pct = Math.round((step / total) * 100);
  if (label) label.textContent = `Question ${step} of ${total}`;
  if (pctEl) pctEl.textContent = `${pct}%`;
  if (fill) fill.style.width = `${pct}%`;
}

function initTriageActions() {
  window.answerQuestion = (answer) => {
    const optContainer = document.getElementById('quick-options');
    const backRow = document.getElementById('triage-back-row');
    const stepIndex = currentQ;

    answers.push(answer);
    addChatMessage(answer, 'user', stepIndex);

    if (optContainer) optContainer.innerHTML = '';
    if (backRow) backRow.classList.add('hidden');

    const typingId = addTypingIndicator();
    scheduleTriageTimeout(() => {
      removeTypingIndicator(typingId);

      currentQ++;
      if (currentQ < triageEngine.questions.length) {
        updateTriageProgress(currentQ, false);
        addChatMessage(escapeHtml(triageEngine.questions[currentQ].text), 'ai', currentQ);
        scheduleTriageTimeout(() => showOptions(triageEngine.questions[currentQ]), 220);
      } else {
        updateTriageProgress(triageEngine.questions.length - 1, true);
        showTriageResult();
      }
    }, 650);
  };

  window.goToPreviousTriageQuestion = () => {
    clearPendingTimers();
    aiExplainToken++;
    document.querySelectorAll('.triage-typing-row').forEach(el => el.remove());

    const chatArea = document.getElementById('chat-area');
    const inputArea = document.getElementById('chat-input-area');
    const total = triageEngine.questions.length;

    if (currentQ >= total) {
      chatArea?.querySelector('.triage-result')?.remove();
      chatArea?.querySelector('#ai-triage-explain-card')?.remove();
      chatArea?.querySelector('[data-turn="summary"]')?.remove();
      if (inputArea) inputArea.style.display = '';
      currentQ = total - 1;
      if (answers.length > currentQ) answers.pop();
      chatArea?.querySelector(`.user-row[data-turn="${currentQ}"]`)?.remove();
    } else if (currentQ > 0) {
      chatArea?.querySelector(`.ai-row[data-turn="${currentQ}"]`)?.remove();
      currentQ--;
      if (answers.length > currentQ) answers.pop();
      chatArea?.querySelector(`.user-row[data-turn="${currentQ}"]`)?.remove();
    } else {
      return;
    }

    updateTriageProgress(currentQ, false);
    showOptions(triageEngine.questions[currentQ]);
    if (chatArea) {
      setTimeout(() => { chatArea.scrollTop = chatArea.scrollHeight; }, 60);
    }
  };

  window.restartTriage = () => {
    clearPendingTimers();
    aiExplainToken++;
    answers = [];
    currentQ = 0;
    renderTriage();
  };

  window.showHomeCare = () => {
    showToast('Home care guide sent to your email', 'success');
  };
}

function injectTriageStyles() {
  if (document.getElementById('triage-styles')) return;
  const s = document.createElement('style');
  s.id = 'triage-styles';
  s.textContent = `
    .chat-row { display:flex;align-items:flex-end;gap:10px; }
    .ai-row { justify-content:flex-start; }
    .user-row { justify-content:flex-end; }
    .ai-avatar { width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#7B68EE,#5A4FCF);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0; }
    .option-btn { width:100%;padding:13px 16px;background:var(--surface);border:1.5px solid var(--border);border-radius:14px;font-size:14px;font-weight:500;color:var(--text-primary);cursor:pointer;text-align:left;transition:all var(--transition-fast);font-family:var(--font-body); }
    .option-btn:hover { border-color:var(--accent);background:var(--accent-light);color:var(--accent); }
    .option-btn:active { transform:scale(0.98); }
    .typing-indicator { display:flex;gap:4px;align-items:center;padding:12px 16px; }
    .typing-dot { width:8px;height:8px;border-radius:50%;background:var(--text-tertiary);animation:wave 1.2s ease-in-out infinite; }
    .typing-dot:nth-child(2) { animation-delay:0.15s; }
    .typing-dot:nth-child(3) { animation-delay:0.30s; }
    .triage-result { padding:20px;border-radius:20px;margin-top:8px;animation:scaleIn 0.4s var(--transition-spring); }
    .triage-result-green { background:rgba(39,174,96,0.08);border:2px solid var(--triage-green); }
    .triage-result-yellow { background:rgba(243,156,18,0.08);border:2px solid var(--triage-yellow); }
    .triage-result-orange { background:rgba(230,126,34,0.08);border:2px solid var(--triage-orange); }
    .triage-result-red { background:rgba(231,76,60,0.08);border:2px solid var(--triage-red); }
  `;
  document.head.appendChild(s);
}

function showOptions(question) {
  const optContainer = document.getElementById('quick-options');
  const backRow = document.getElementById('triage-back-row');
  if (!optContainer) return;

  if (backRow) {
    backRow.classList.toggle('hidden', currentQ === 0);
  }

  optContainer.innerHTML = question.options.map((opt, i) => `
    <button type="button" class="option-btn" onclick="answerQuestion('${opt.replace(/'/g, "\\'")}', ${i})">
      ${escapeHtml(opt)}
    </button>
  `).join('');
}

function addChatMessage(text, sender, turnIndex = null) {
  const chatArea = document.getElementById('chat-area');
  if (!chatArea) return;

  const div = document.createElement('div');
  div.className = `chat-row ${sender === 'ai' ? 'ai-row' : 'user-row'}`;
  if (turnIndex !== null && turnIndex !== undefined) {
    div.setAttribute('data-turn', String(turnIndex));
  }
  div.innerHTML = sender === 'ai'
    ? `<div class="ai-avatar">${uiIcon('bot', { size: 18, color: 'white' })}</div><div class="chat-bubble ai">${text}</div>`
    : `<div class="chat-bubble user">${escapeHtml(text)}</div>`;

  // Insert before options container
  const optionsEl = document.getElementById('options-container');
  chatArea.insertBefore(div, optionsEl);

  // Scroll to bottom
  setTimeout(() => chatArea.scrollTop = chatArea.scrollHeight, 80);
}

function addTypingIndicator() {
  const chatArea = document.getElementById('chat-area');
  if (!chatArea) return null;

  const id = `typing-${Date.now()}`;
  const div = document.createElement('div');
  div.id = id;
  div.className = 'chat-row ai-row triage-typing-row';
  div.setAttribute('aria-label', 'AI is typing');
  div.innerHTML = `
    <div class="ai-avatar">${uiIcon('bot', { size: 18, color: 'white' })}</div>
    <div class="chat-bubble ai" style="padding:12px;">
      <div class="typing-indicator">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    </div>
  `;
  const optionsEl = document.getElementById('options-container');
  chatArea.insertBefore(div, optionsEl);
  setTimeout(() => chatArea.scrollTop = chatArea.scrollHeight, 80);
  return id;
}

function removeTypingIndicator(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

function showTriageResult() {
  const result = triageEngine.assess(answers);
  const chatArea = document.getElementById('chat-area');
  const optContainer = document.getElementById('quick-options');
  const inputArea = document.getElementById('chat-input-area');

  if (!chatArea) return;

  // AI summary message
  addChatMessage("Thank you for your responses. Based on what you've described, here is my assessment:", 'ai', 'summary');

  const typingId = addTypingIndicator();
  scheduleTriageTimeout(() => {
    removeTypingIndicator(typingId);
    // Result card
    const resultDiv = document.createElement('div');
    resultDiv.className = `triage-result triage-result-${result.level}`;
    resultDiv.innerHTML = `
      <div class="flex items-center gap-3 mb-4">
        <div class="triage-result-icon" style="background:${result.color}20;color:${result.color};">
          ${result.level === 'red' ? uiIcon('siren', { size: 26, color: result.color }) : result.level === 'orange' ? uiIcon('alertTriangle', { size: 26, color: result.color }) : result.level === 'yellow' ? uiIcon('clock', { size: 26, color: result.color }) : uiIcon('checkCircle', { size: 26, color: result.color })}
        </div>
        <div>
          <div style="font-family:var(--font-display);font-size:16px;font-weight:800;color:${result.color};">${result.label}</div>
          <div class="text-caption">AI Triage Assessment</div>
        </div>
      </div>
      <p class="triage-result-msg">${result.message}</p>
      <div class="flex-col gap-2">
        ${result.level === 'red' ? `
          <button class="btn btn-emergency btn-full" onclick="navigate('sos')">
            ${uiIcon('siren', { size: 16 })} Call Emergency Services Now
          </button>
        ` : result.level === 'orange' ? `
          <button class="btn btn-primary btn-full" onclick="navigate('appointments')">
            ${uiIcon('calendar', { size: 16 })} Book Urgent Appointment
          </button>
        ` : result.level === 'yellow' ? `
          <button class="btn btn-primary btn-full" onclick="navigate('appointments')">
            ${uiIcon('calendar', { size: 16 })} Schedule Appointment
          </button>
        ` : `
          <button class="btn btn-secondary btn-full" onclick="showHomeCare()">
            ${uiIcon('home', { size: 16 })} View Home Care Tips
          </button>
        `}
        <button type="button" class="btn btn-outline btn-full" onclick="goToPreviousTriageQuestion()">
          Change Previous Answer
        </button>
        <button type="button" class="btn btn-ghost btn-full" onclick="restartTriage()">
          Assess Again
        </button>
      </div>
    `;

    const optionsEl = document.getElementById('options-container');
    chatArea.insertBefore(resultDiv, optionsEl);

    const requestToken = ++aiExplainToken;
    const aiCard = createAiExplainLoadingCard(requestToken);
    chatArea.insertBefore(aiCard, optionsEl);
    loadAiTriageExplanation(requestToken, answers, result, chatArea);

    if (optContainer) optContainer.innerHTML = '';
    if (inputArea) inputArea.style.display = 'none';

    setTimeout(() => chatArea.scrollTop = chatArea.scrollHeight, 120);

    if (result.level === 'red') {
      showToast('🚨 Critical condition detected. Emergency services alert sent!', 'error', 5000);
    }
  }, 550);
}

function createAiExplainLoadingCard(token) {
  const card = document.createElement('div');
  card.id = 'ai-triage-explain-card';
  card.className = 'ai-explain-card mt-3';
  card.setAttribute('data-token', String(token));
  card.setAttribute('aria-live', 'polite');
  card.innerHTML = `
    <div class="ai-explain-header">
      <div class="ai-explain-title-row">
        <span class="ai-explain-icon">${uiIcon('bot', { size: 16 })}</span>
        <span class="ai-explain-title">Personalized Care Guidance</span>
      </div>
      <span class="ai-explain-badge">AI-generated, not medical advice</span>
    </div>
    <div class="ai-explain-skeleton">
      <div class="skeleton skeleton-line" style="width:90%;"></div>
      <div class="skeleton skeleton-line" style="width:76%;"></div>
      <div class="skeleton skeleton-line" style="width:60%;"></div>
    </div>
  `;
  return card;
}

async function loadAiTriageExplanation(token, userAnswers, result, chatArea) {
  const pairedAnswers = triageEngine.questions
    .map((q, idx) => ({
      question: q.text,
      answer: userAnswers[idx] || ''
    }))
    .filter((entry) => entry.answer);

  if (pairedAnswers.length === 0) {
    document.getElementById('ai-triage-explain-card')?.remove();
    return;
  }

  const numericScore = Number.isFinite(Number(result?.score))
    ? Number(result.score)
    : (result.level === 'red' ? 9 : result.level === 'orange' ? 6 : result.level === 'yellow' ? 3 : 1);

  try {
    const resp = await fetch('/api/ai/triage-explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        answers: pairedAnswers,
        level: result.level,
        score: numericScore
      })
    });

    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}`);
    }

    const data = await resp.json();
    if (token !== aiExplainToken) return;

    const card = document.getElementById('ai-triage-explain-card');
    if (!card || card.getAttribute('data-token') !== String(token)) return;

    const tipsHtml = Array.isArray(data.selfCareTips) && data.selfCareTips.length > 0
      ? `
        <div class="ai-explain-section">
          <div class="ai-explain-label">Safe Next Steps</div>
          <ul class="ai-explain-list">
            ${data.selfCareTips.map((tip) => `<li>${escapeHtml(tip)}</li>`).join('')}
          </ul>
        </div>
      `
      : '';

    const flagsHtml = Array.isArray(data.redFlags) && data.redFlags.length > 0
      ? `
        <div class="ai-explain-section ai-explain-flags">
          <div class="ai-explain-label">Seek Immediate 108 / 112 Care If You Notice</div>
          <ul class="ai-explain-list">
            ${data.redFlags.map((flag) => `<li>${escapeHtml(flag)}</li>`).join('')}
          </ul>
        </div>
      `
      : '';

    const specialty = data.suggestedSpecialty ? escapeHtml(data.suggestedSpecialty) : 'General Physician';

    card.innerHTML = `
      <div class="ai-explain-header">
        <div class="ai-explain-title-row">
          <span class="ai-explain-icon">${uiIcon('bot', { size: 16 })}</span>
          <span class="ai-explain-title">Personalized Care Guidance</span>
        </div>
        <span class="ai-explain-badge">AI-generated, not medical advice</span>
      </div>
      <p class="ai-explain-summary">${escapeHtml(data.summary || '')}</p>
      ${data.whyThisLevel ? `<p class="ai-explain-why"><strong>Why this urgency:</strong> ${escapeHtml(data.whyThisLevel)}</p>` : ''}
      <div class="ai-explain-specialty-row">
        <span class="badge badge-info">Suggested Specialty: ${specialty}</span>
        ${result.level !== 'red' ? `
          <button type="button" class="btn btn-ghost btn-xs" data-specialty="${specialty}" onclick="navigate('appointments', { specialty: this.dataset.specialty, fromTriage: '1' })">
            Find Specialists →
          </button>
        ` : ''}
      </div>
      ${tipsHtml}
      ${flagsHtml}
      <div class="ai-explain-disclaimer">${escapeHtml(data.disclaimer || 'AI-generated explanation for informational support only — not medical advice.')}</div>
    `;

    if (chatArea) {
      setTimeout(() => { chatArea.scrollTop = chatArea.scrollHeight; }, 90);
    }
  } catch {
    if (token === aiExplainToken) {
      document.getElementById('ai-triage-explain-card')?.remove();
    }
  }
}
