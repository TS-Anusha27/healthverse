// HealthVerse â€” Client-Side Router
import { store } from '../store/store.js';

const routes = {};
let currentCleanup = null;

export function register(name, renderFn) {
  routes[name] = renderFn;
}

export function navigate(page, params = {}, addHistory = true) {
  if (addHistory && store.currentPage !== page) {
    store.history.push(store.currentPage);
  }

  // Cleanup previous page
  if (currentCleanup && typeof currentCleanup === 'function') {
    try { currentCleanup(); } catch(e) {}
  }
  currentCleanup = null;

  store.currentPage = page;

  const app = document.getElementById('app');
  if (!app) return;

  if (routes[page]) {
    const result = routes[page](params);
    if (result && typeof result === 'function') {
      currentCleanup = result;
    }
  } else {
    app.innerHTML = `<div style="padding:40px;text-align:center;color:var(--text-secondary);">Page not found: ${page}</div>`;
  }

  // Scroll to top
  const content = document.querySelector('.screen-content');
  if (content) content.scrollTop = 0;
}

export function goBack() {
  const prev = store.history.pop();
  if (prev) navigate(prev, {}, false);
}
