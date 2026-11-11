// HealthVerse — Toast Notification System
let toastCounter = 0;

export function showToast(message, type = 'info', duration = 3500) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const icons = {
    success: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
    error: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
    warning: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    info: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
  };

  const colors = {
    success: 'var(--success)',
    error: 'var(--emergency)',
    warning: 'var(--warning)',
    info: 'var(--primary)'
  };

  const id = `toast-${++toastCounter}`;
  const toast = document.createElement('div');
  toast.id = id;
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span style="color: ${colors[type]}; flex-shrink: 0;">${icons[type]}</span>
    <span style="flex: 1;">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  }, duration);

  return id;
}

// Modal System
let activeModal = null;

export function showModal(content, options = {}) {
  const container = document.getElementById('modal-container');
  if (!container) return;

  closeModal();

  container.style.pointerEvents = 'all';
  container.innerHTML = `
    <div class="modal-overlay" id="modal-overlay"></div>
    <div class="modal-sheet" id="modal-sheet">
      <div class="modal-handle"></div>
      ${content}
    </div>
  `;

  activeModal = container;

  document.getElementById('modal-overlay').addEventListener('click', closeModal);

  if (options.onOpen) options.onOpen();

  return {
    close: closeModal,
    getElement: () => document.getElementById('modal-sheet')
  };
}

export function closeModal() {
  const container = document.getElementById('modal-container');
  if (!container || !container.innerHTML.trim()) return;

  container.style.pointerEvents = 'none';
  container.innerHTML = '';
  activeModal = null;
}

// Format utilities
export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function formatDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatTime(t) {
  return new Date(t).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

// Generate avatar initials
export function getInitials(name) {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
}

// Generate random color for avatar
export function avatarColor(name) {
  const colors = ['#4A90D9', '#52C99B', '#7B68EE', '#FF6B6B', '#FFA502', '#17A589'];
  let hash = 0;
  for (let c of name) hash = c.charCodeAt(0) + hash * 31;
  return colors[Math.abs(hash) % colors.length];
}

// Debounce
export function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function renderSkeletonCards(count = 3, withAvatar = true) {
  return `
    <div class="skeleton-stack" aria-busy="true" aria-label="Loading content">
      ${Array.from({ length: count }, () => `
        <div class="skeleton-card">
          <div class="skeleton-row">
            ${withAvatar ? '<div class="skeleton skeleton-avatar"></div>' : ''}
            <div style="flex:1;">
              <div class="skeleton skeleton-line skeleton-line--title"></div>
              <div class="skeleton skeleton-line skeleton-line--medium"></div>
              <div class="skeleton skeleton-line skeleton-line--short"></div>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

export function renderSkeletonStats(count = 3) {
  return `
    <div class="grid-${count === 2 ? '2' : '3'}" aria-busy="true" aria-label="Loading stats">
      ${Array.from({ length: count }, () => '<div class="skeleton skeleton-stat"></div>').join('')}
    </div>
  `;
}

export function renderEmptyState({
  title = 'Nothing here yet',
  description = 'There is no data to display right now.',
  actionLabel = '',
  actionOnclick = '',
  icon = ''
} = {}) {
  const defaultIcon = `
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="9" y1="15" x2="15" y2="15"/>
    </svg>
  `;
  return `
    <div class="empty-state">
      <div class="empty-state-illustration">${icon || defaultIcon}</div>
      <div class="empty-state-title">${escapeHtml(title)}</div>
      <div class="empty-state-desc">${escapeHtml(description)}</div>
      ${actionLabel && actionOnclick ? `
        <div class="empty-state-action">
          <button class="btn btn-primary btn-sm" onclick="${actionOnclick}">${escapeHtml(actionLabel)}</button>
        </div>
      ` : ''}
    </div>
  `;
}

export function renderErrorState({
  title = 'Unable to load data',
  description = 'Something went wrong while fetching this information. Please try again.',
  retryOnclick = '',
  retryLabel = 'Retry'
} = {}) {
  return `
    <div class="error-state" role="alert">
      <div class="error-state-icon">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>
      <div class="error-state-title">${escapeHtml(title)}</div>
      <div class="error-state-desc">${escapeHtml(description)}</div>
      ${retryOnclick ? `
        <div class="error-state-action">
          <button class="btn btn-primary btn-sm" onclick="${retryOnclick}">${escapeHtml(retryLabel)}</button>
        </div>
      ` : ''}
    </div>
  `;
}

// Generate QR-like pattern (visual placeholder)
export function generateQRDisplay(code) {
  return `
    <div style="
      width: 140px; height: 140px;
      background: white;
      border-radius: 12px;
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 2px;
      padding: 10px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.1);
    ">
      ${Array.from({ length: 49 }, (_, i) => {
        const filled = [0,1,2,3,4,5,6,7,13,14,20,21,27,28,34,35,41,42,43,44,45,46,47,48,8,15,22,10,17,24].includes(i) || Math.random() > 0.5;
        return `<div style="background: ${filled ? '#1A2332' : 'transparent'}; border-radius: 2px;"></div>`;
      }).join('')}
    </div>
    <div style="font-size: 11px; color: #6B7A8D; text-align: center; margin-top: 8px; font-family: monospace; letter-spacing: 1px;">${code}</div>
  `;
}

export function animateCountUp(el, target, { duration = 600, prefix = '', suffix = '' } = {}) {
  if (!el) return;
  const numericTarget = Number(target);
  if (!Number.isFinite(numericTarget)) {
    el.textContent = `${prefix}${target}${suffix}`;
    return;
  }
  const prefersReduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced || duration <= 0 || numericTarget === 0) {
    el.textContent = `${prefix}${numericTarget}${suffix}`;
    return;
  }
  const start = performance.now();
  const isFloat = !Number.isInteger(numericTarget);
  function frame(now) {
    const elapsed = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - elapsed, 3);
    const current = numericTarget * eased;
    el.textContent = `${prefix}${isFloat ? current.toFixed(1) : Math.round(current)}${suffix}`;
    if (elapsed < 1) {
      requestAnimationFrame(frame);
    } else {
      el.textContent = `${prefix}${numericTarget}${suffix}`;
    }
  }
  requestAnimationFrame(frame);
}

export function applyCountUps(root = document) {
  if (!root) return;
  const targets = root.querySelectorAll('[data-countup]');
  targets.forEach(el => {
    if (el.dataset.counted === 'true') return;
    el.dataset.counted = 'true';
    const raw = el.getAttribute('data-countup');
    const prefix = el.getAttribute('data-countup-prefix') || '';
    const suffix = el.getAttribute('data-countup-suffix') || '';
    animateCountUp(el, raw, { prefix, suffix });
  });
}

export function setFieldError(inputId, message) {
  const input = document.getElementById(inputId);
  const errId = `err-${inputId}`;
  let errEl = document.getElementById(errId);
  if (!errEl && input) {
    const group = input.closest('.form-group') || input.parentElement;
    if (group) {
      errEl = document.createElement('div');
      errEl.id = errId;
      errEl.className = 'form-error hidden';
      errEl.setAttribute('role', 'alert');
      group.appendChild(errEl);
    }
  }
  if (message) {
    if (input) {
      input.classList.add('error');
      input.setAttribute('aria-invalid', 'true');
      input.setAttribute('aria-describedby', errId);
    }
    if (errEl) {
      errEl.textContent = message;
      errEl.classList.remove('hidden');
    }
    return false;
  }
  if (input) {
    input.classList.remove('error');
    input.removeAttribute('aria-invalid');
  }
  if (errEl) {
    errEl.textContent = '';
    errEl.classList.add('hidden');
  }
  return true;
}

export function clearFieldError(inputId) {
  return setFieldError(inputId, '');
}

export function clearFormErrors(root = document) {
  if (!root) return;
  root.querySelectorAll('.form-input.error').forEach(el => {
    el.classList.remove('error');
    el.removeAttribute('aria-invalid');
  });
  root.querySelectorAll('.form-error').forEach(el => {
    el.textContent = '';
    el.classList.add('hidden');
  });
}

export function evaluatePasswordStrength(password = '') {
  if (!password) return { score: 0, label: '', tier: '' };
  if (password.length < 6) {
    return { score: 1, label: 'Weak — at least 6 characters required', tier: 'weak' };
  }
  let variety = 0;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) variety += 1;
  if (/\d/.test(password)) variety += 1;
  if (/[^A-Za-z0-9]/.test(password)) variety += 1;
  if (password.length >= 10) variety += 1;

  if (variety >= 3) return { score: 4, label: 'Strong password', tier: 'strong' };
  if (variety === 2) return { score: 3, label: 'Good password', tier: 'good' };
  return { score: 2, label: 'Fair — add numbers or symbols to strengthen', tier: 'fair' };
}

export function setButtonLoading(btnOrId, isLoading, loadingText = 'Submitting...') {
  const btn = typeof btnOrId === 'string' ? document.getElementById(btnOrId) : btnOrId;
  if (!btn) return;
  if (isLoading) {
    if (!btn.dataset.originalHtml) {
      btn.dataset.originalHtml = btn.innerHTML;
    }
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-inline animate-spin"></span> ${escapeHtml(loadingText)}`;
  } else {
    btn.disabled = false;
    if (btn.dataset.originalHtml) {
      btn.innerHTML = btn.dataset.originalHtml;
      delete btn.dataset.originalHtml;
    }
  }
}
