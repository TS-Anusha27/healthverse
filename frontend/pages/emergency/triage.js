// HealthVerse — AI Triage Chat
import { navigate, goBack } from '../../routes/router.js';
import { triageEngine } from '../../services/data.js';
import { showToast, escapeHtml } from '../../utils/utils.js';

let answers = [];
let currentQ = 0;
let chatMessages = [];

export function renderTriage() {
  const app = document.getElementById('app');
  answers = [];
  currentQ = 0;

  app.innerHTML = `
    <div class="screen" id="triage-screen">
      <div class="page-header triage-header">
        <button class="back-btn btn-glass-back" onclick="goBack()">
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

      <!-- Chat Area -->
      <div class="screen-content triage-chat-area" id="chat-area">
        <!-- Initial AI message -->
        <div class="chat-row ai-row">
          <div class="ai-avatar">🤖</div>
          <div class="chat-bubble ai">
            Hello! I'm HealthVerse AI. I'll ask you a few questions to assess the urgency of your symptoms. Remember, I'm not a substitute for a real doctor.<br><br>
            <strong>Let's begin. ${triageEngine.questions[0].text}</strong>
          </div>
        </div>
        <div id="options-container"></div>
      </div>

      <!-- Input Area -->
      <div id="chat-input-area" class="triage-input-dock">
        <div id="quick-options" class="flex-col gap-2"></div>
      </div>
    </div>
  `;

  injectTriageStyles();
  setTimeout(() => showOptions(triageEngine.questions[0]), 800);
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
  if (!optContainer) return;

  optContainer.innerHTML = question.options.map((opt, i) => `
    <button class="option-btn" onclick="answerQuestion('${opt.replace(/'/g, "\\'")}', ${i})">
      ${opt}
    </button>
  `).join('');

  window.answerQuestion = (answer, idx) => {
    answers.push(answer);

    // Add user message
    addChatMessage(answer, 'user');

    // Clear options
    optContainer.innerHTML = '';

    // Add typing indicator
    const typingId = addTypingIndicator();

    setTimeout(() => {
      removeTypingIndicator(typingId);

      currentQ++;
      if (currentQ < triageEngine.questions.length) {
        addChatMessage(triageEngine.questions[currentQ].text, 'ai');
        setTimeout(() => showOptions(triageEngine.questions[currentQ]), 600);
      } else {
        showTriageResult();
      }
    }, 900 + Math.random() * 400);
  };
}

function addChatMessage(text, sender) {
  const chatArea = document.getElementById('chat-area');
  if (!chatArea) return;

  const div = document.createElement('div');
  div.className = `chat-row ${sender === 'ai' ? 'ai-row' : 'user-row'}`;
  div.innerHTML = sender === 'ai'
    ? `<div class="ai-avatar">🤖</div><div class="chat-bubble ai">${text}</div>`
    : `<div class="chat-bubble user">${escapeHtml(text)}</div>`;

  // Insert before options container
  const optionsEl = document.getElementById('options-container');
  chatArea.insertBefore(div, optionsEl);

  // Scroll to bottom
  setTimeout(() => chatArea.scrollTop = chatArea.scrollHeight, 100);
}

function addTypingIndicator() {
  const chatArea = document.getElementById('chat-area');
  if (!chatArea) return null;

  const id = `typing-${Date.now()}`;
  const div = document.createElement('div');
  div.id = id;
  div.className = 'chat-row ai-row';
  div.innerHTML = `
    <div class="ai-avatar">🤖</div>
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
  setTimeout(() => chatArea.scrollTop = chatArea.scrollHeight, 100);
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
  addChatMessage("Thank you for your responses. Based on what you've described, here is my assessment:", 'ai');

  setTimeout(() => {
    // Result card
    const resultDiv = document.createElement('div');
    resultDiv.className = `triage-result triage-result-${result.level}`;
    resultDiv.innerHTML = `
      <div class="flex items-center gap-3 mb-4">
        <div class="triage-result-icon" style="background:${result.color}20;">
          ${result.level === 'red' ? '🚨' : result.level === 'orange' ? '⚠️' : result.level === 'yellow' ? '⏰' : '✅'}
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
            🚨 Call Emergency Services Now
          </button>
        ` : result.level === 'orange' ? `
          <button class="btn btn-primary btn-full" onclick="navigate('appointments')">
            📅 Book Urgent Appointment
          </button>
        ` : result.level === 'yellow' ? `
          <button class="btn btn-primary btn-full" onclick="navigate('appointments')">
            📅 Schedule Appointment
          </button>
        ` : `
          <button class="btn btn-secondary btn-full" onclick="showHomeCare()">
            🏡 View Home Care Tips
          </button>
        `}
        <button class="btn btn-ghost btn-full" onclick="restartTriage()">
          Assess Again
        </button>
      </div>
    `;

    const optionsEl = document.getElementById('options-container');
    chatArea.insertBefore(resultDiv, optionsEl);

    if (optContainer) optContainer.innerHTML = '';
    if (inputArea) inputArea.style.display = 'none';

    setTimeout(() => chatArea.scrollTop = chatArea.scrollHeight, 200);

    if (result.level === 'red') {
      showToast('🚨 Critical condition detected. Emergency services alert sent!', 'error', 5000);
    }
  }, 800);

  window.restartTriage = () => {
    answers = [];
    currentQ = 0;
    renderTriage();
  };

  window.showHomeCare = () => {
    showToast('Home care guide sent to your email', 'success');
  };
}
