// HealthVerse — Client-Side Router with Protected Route Middleware
import { store } from '../store/store.js';

const routes = {};
let currentCleanup = null;

const PUBLIC_ROUTES = ['splash', 'login'];

export function register(name, renderFn) {
  routes[name] = renderFn;
}

export function navigate(page, params = {}, addHistory = true) {
  // Protected Route Middleware: Redirect to login if unauthenticated
  if (!PUBLIC_ROUTES.includes(page) && !store.isLoggedIn) {
    console.warn(`Unauthenticated access attempt to '${page}'. Redirecting to login.`);
    page = 'login';
  }

  if (addHistory && store.currentPage !== page) {
    store.history.push(store.currentPage);
  }

  // Cleanup previous page handlers
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
  if (prev && prev !== store.currentPage) {
    navigate(prev, {}, false);
  } else {
    // Default fallback depending on user role
    if (store.userType === 'doctor') navigate('doctor-home');
    else if (store.userType === 'ambulance') navigate('ambulance-home');
    else navigate('patient-home');
  }
}

// Bind globally
window.navigate = navigate;
window.goBack = goBack;
