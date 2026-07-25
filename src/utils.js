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
