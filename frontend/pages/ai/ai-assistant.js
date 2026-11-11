// HealthVerse — Patient AI Health Assistant (#ai-assistant)
import { goBack, navigate } from '../../routes/router.js';
import { escapeHtml, showToast } from '../../utils/utils.js';
import { uiIcon } from '../../utils/icons.js';
import { renderBottomNav } from '../patient/patient-home.js';

const QUICK_PROMPTS = [
  { label: 'I have a fever', prompt: 'I have a fever and feel fatigued. What should I monitor and when should I see a doctor?' },
  { label: 'Explain my medicines', prompt: 'What important questions should I check before taking prescribed medicines, and what warning side effects need medical attention?' },
  { label: 'Find a doctor', prompt: 'How do I choose which specialist doctor in HealthVerse to consult for chest discomfort vs routine skin issues?' },
  { label: 'Book a cardiologist tomorrow', prompt: 'Please help me book a Cardiology doctor appointment for tomorrow.' }
];

let chatMessages = [];
let isSending = false;
let lastFailedPayload = null;
let sessionToken = 0;

function formatMessageText(rawText) {
  return escapeHtml(String(rawText || '')).replace(/\n/g, '<br>');
}

export function renderAiAssistant() {
  const app = document.getElementById('app');
  sessionToken++;
  isSending = false;
  lastFailedPayload = null;

  app.innerHTML = `
    <div class="screen ai-chat-shell" id="ai-assistant-screen">
      <div class="page-header triage-header">
        <button class="back-btn btn-glass-back" onclick="goBack()" aria-label="Go back">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div class="flex-1">
          <div class="header-title-light">AI Health Assistant</div>
          <div class="triage-status">
            <span class="triage-status-dot" aria-hidden="true"></span>
            Informational Support • NOT medical advice
          </div>
        </div>
        <button type="button" class="btn btn-glass btn-xs" id="btn-ai-clear" onclick="clearAssistantChat()" aria-label="Clear conversation">
          Clear
        </button>
      </div>

      <div class="triage-disclaimer">
        ${uiIcon('alertTriangle', { size: 15, color: 'var(--warning)' })}
        <span class="triage-disclaimer-text">For emergencies, call <strong>108</strong> / <strong>112</strong> immediately. AI guidance does not diagnose or prescribe.</span>
      </div>

      <div class="screen-content ai-chat-thread" id="ai-chat-thread" aria-live="polite"></div>

      <div class="ai-input-dock">
        <div class="ai-chip-row" id="ai-quick-chips">
          ${QUICK_PROMPTS.map((item, idx) => `
            <button type="button" class="ai-chip-btn" data-chip-idx="${idx}" onclick="sendQuickAssistantPrompt(${idx})">
              ${escapeHtml(item.label)}
            </button>
          `).join('')}
        </div>
        <form class="ai-chat-form" id="ai-chat-form" onsubmit="handleAssistantSubmit(event)">
          <input
            type="text"
            id="ai-chat-input"
            class="form-input ai-chat-input"
            placeholder="Ask about symptoms, medicines, or finding a doctor..."
            maxlength="600"
            autocomplete="off"
            aria-label="Ask HealthVerse AI Assistant"
          />
          <button type="submit" class="btn btn-primary ai-chat-send-btn" id="ai-chat-send" aria-label="Send message">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
      </div>

      ${renderBottomNav('', { desktopOnly: true })}
    </div>
  `;

  window.clearAssistantChat = () => {
    sessionToken++;
    chatMessages = [];
    lastFailedPayload = null;
    isSending = false;
    setComposerBusy(false);
    renderConversation();
    showToast('Conversation cleared', 'info');
  };

  window.sendQuickAssistantPrompt = (idx) => {
    const preset = QUICK_PROMPTS[Number(idx)];
    if (!preset || isSending) return;
    submitUserMessage(preset.prompt);
  };

  window.handleAssistantSubmit = (e) => {
    e.preventDefault();
    if (isSending) return;
    const input = document.getElementById('ai-chat-input');
    const text = (input?.value || '').trim();
    if (!text) return;
    if (input) input.value = '';
    submitUserMessage(text);
  };

  window.retryLastAssistantTurn = () => {
    if (!lastFailedPayload || isSending) return;
    sendAssistantRequest(lastFailedPayload);
  };

  window.confirmAssistantBooking = (msgIdx) => {
    const msg = chatMessages[Number(msgIdx)];
    const intent = msg?.intent;
    if (!intent) return;
    navigate('appointments', {
      specialty: intent.specialty || '',
      preferredDate: intent.preferredDate || '',
      reason: intent.reason || '',
      fromAssistant: '1'
    });
  };

  window.dismissAssistantBooking = (msgIdx) => {
    const msg = chatMessages[Number(msgIdx)];
    if (!msg) return;
    msg.intentDismissed = true;
    renderConversation();
  };

  renderConversation();
}

function setComposerBusy(busy) {
  const input = document.getElementById('ai-chat-input');
  const sendBtn = document.getElementById('ai-chat-send');
  const chipBtns = document.querySelectorAll('.ai-chip-btn');
  if (input) input.disabled = busy;
  if (sendBtn) sendBtn.disabled = busy;
  chipBtns.forEach((btn) => {
    btn.disabled = busy;
  });
}

function renderConversation(errorMessage = '') {
  const threadEl = document.getElementById('ai-chat-thread');
  if (!threadEl) return;

  if (chatMessages.length === 0 && !isSending && !errorMessage) {
    threadEl.innerHTML = `
      <div class="ai-welcome-card">
        <div class="ai-welcome-avatar">${uiIcon('bot', { size: 24, color: 'white' })}</div>
        <h2 class="ai-welcome-title">How can I help you today?</h2>
        <p class="ai-welcome-sub">Ask questions about general symptoms, what specialist to see, or medication safety tips. Tap a starter below or type your own message.</p>
      </div>
    `;
    return;
  }

  const bubblesHtml = chatMessages.map((msg, idx) => {
    if (msg.role === 'user') {
      return `
        <div class="ai-msg-row ai-msg-row--user">
          <div class="ai-msg-bubble ai-msg-bubble--user">${formatMessageText(msg.content)}</div>
        </div>
      `;
    }

    const intent = msg.intent;
    const intentCardHtml = intent && intent.action === 'book_appointment' && !msg.intentDismissed ? `
      <div class="ai-intent-card" role="region" aria-label="Appointment booking confirmation">
        <div class="ai-intent-title">${uiIcon('calendar', { size: 14, color: 'var(--primary)' })} Review Suggested Appointment Filter</div>
        <div class="ai-intent-meta">
          <div><strong>Specialty:</strong> ${escapeHtml(intent.specialty)}</div>
          ${intent.preferredDate ? `<div><strong>Preferred Date:</strong> ${escapeHtml(intent.preferredDate)}</div>` : ''}
          ${intent.reason ? `<div><strong>Reason:</strong> ${escapeHtml(intent.reason)}</div>` : ''}
          <div style="margin-top:4px;font-size:11px;color:var(--text-muted);">Nothing is booked yet — confirm to open pre-filtered hospitals &amp; slots.</div>
        </div>
        <div class="ai-intent-actions">
          <button type="button" class="btn btn-primary btn-xs" onclick="confirmAssistantBooking(${idx})">
            Confirm &amp; Open Appointments
          </button>
          <button type="button" class="btn btn-ghost btn-xs" onclick="dismissAssistantBooking(${idx})">
            Not now
          </button>
        </div>
      </div>
    ` : '';

    return `
      <div class="ai-msg-row ai-msg-row--ai">
        <div class="ai-msg-avatar" aria-hidden="true">${uiIcon('bot', { size: 15, color: 'white' })}</div>
        <div class="ai-msg-stack">
          <div class="ai-msg-bubble ai-msg-bubble--ai">${formatMessageText(msg.content)}</div>
          ${intentCardHtml}
          ${msg.disclaimer ? `<div class="ai-msg-note">${escapeHtml(msg.disclaimer)}</div>` : ''}
        </div>
      </div>
    `;
  }).join('');

  const loadingHtml = isSending ? `
    <div class="ai-msg-row ai-msg-row--ai">
      <div class="ai-msg-avatar" aria-hidden="true">${uiIcon('bot', { size: 15, color: 'white' })}</div>
      <div class="ai-msg-bubble ai-msg-bubble--ai ai-msg-bubble--loading">
        <div class="skeleton skeleton-line" style="width:170px;"></div>
        <div class="skeleton skeleton-line" style="width:120px;margin-bottom:0;"></div>
      </div>
    </div>
  ` : '';

  const errorHtml = errorMessage ? `
    <div class="ai-error-card" role="alert">
      <div class="ai-error-text">${escapeHtml(errorMessage)}</div>
      <button type="button" class="btn btn-outline btn-xs" onclick="retryLastAssistantTurn()">
        ${uiIcon('repeat', { size: 13 })} Retry
      </button>
    </div>
  ` : '';

  threadEl.innerHTML = bubblesHtml + loadingHtml + errorHtml;
  threadEl.scrollTop = threadEl.scrollHeight;
}

async function submitUserMessage(text) {
  const clean = text.trim();
  if (!clean) return;

  chatMessages.push({ role: 'user', content: clean });
  const payloadMessages = chatMessages
    .slice(-6)
    .map((m) => ({ role: m.role, content: m.content }));

  lastFailedPayload = payloadMessages;
  await sendAssistantRequest(payloadMessages);
}

async function sendAssistantRequest(payloadMessages) {
  const token = sessionToken;
  isSending = true;
  setComposerBusy(true);
  renderConversation();

  try {
    const res = await fetch('/api/ai/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: payloadMessages })
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.reply) {
      throw new Error(data?.error || 'Unable to reach HealthVerse AI right now.');
    }

    if (token !== sessionToken) return;

    lastFailedPayload = null;
    chatMessages.push({
      role: 'assistant',
      content: data.reply,
      intent: data.intent || null,
      disclaimer: data.disclaimer || 'AI-generated information only — not medical advice.'
    });
    isSending = false;
    setComposerBusy(false);
    renderConversation();
  } catch (err) {
    if (token !== sessionToken) return;
    isSending = false;
    setComposerBusy(false);
    renderConversation(err?.message || 'Unable to reach HealthVerse AI right now. Please try again.');
  }
}
