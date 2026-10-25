// HealthVerse — Client-Side Router with Hash Routing, Browser Back/Forward & Protected Route Middleware
import { store } from '../store/store.js';
import { showToast } from '../utils/utils.js';

const routes = {};
let currentCleanup = null;
let isHandlingPopState = false;

// Route Categorization
export const PUBLIC_ROUTES = ['splash', 'login', 'user-type', 'landing', 'patient-registration'];
export const PATIENT_ROUTES = [
  'patient-home', 'appointments', 'triage', 'live-queue', 'telemedicine',
  'health-records', 'blood-donation', 'organ-donation', 'medicines', 'health-insights', 'sos'
];
export const DOCTOR_ROUTES = [
  'doctor-home', 'doctor-summary', 'doctor-prescription'
];
export const AMBULANCE_ROUTES = [
  'ambulance-home'
];
export const SHARED_AUTH_ROUTES = [
  'settings', 'notifications'
];

/**
 * Register a route with its render function
 */
export function register(name, renderFn) {
  routes[name] = renderFn;
}

/**
 * Parse route and query parameters from current window hash
 */
export function parseHash() {
  const hash = window.location.hash.replace(/^#\/?/, '');
  if (!hash) {
    return { page: 'user-type', params: {} };
  }
  const [path, queryString] = hash.split('?');
  const params = {};
  if (queryString) {
    const searchParams = new URLSearchParams(queryString);
    for (const [key, val] of searchParams.entries()) {
      params[key] = val;
    }
  }
  const cleanPath = (path || 'user-type').trim();
  return { page: cleanPath === 'landing' ? 'user-type' : cleanPath, params };
}

/**
 * Navigate to a route
 * @param {string} page - Route name
 * @param {object} params - Query/page parameters
 * @param {boolean} addHistory - Whether to push a new entry to browser history
 */
export function navigate(page, params = {}, addHistory = true) {
  // Normalize landing alias
  if (page === 'landing') page = 'user-type';

  // 1. Protected Route Middleware: Validate login
  const isPublic = PUBLIC_ROUTES.includes(page);
  if (!isPublic && !store.isLoggedIn) {
    showToast('Please sign in to access this page.', 'warning');
    let targetRole = 'patient';
    if (DOCTOR_ROUTES.includes(page)) targetRole = 'doctor';
    else if (AMBULANCE_ROUTES.includes(page)) targetRole = 'ambulance';

    page = 'login';
    params = { ...params, role: targetRole, redirect: page };
  }

  // 2. Role Enforcement Middleware: Prevent cross-role unauthorized access
  if (store.isLoggedIn && store.userType) {
    const userRole = store.userType;

    if (userRole === 'patient') {
      if (DOCTOR_ROUTES.includes(page)) {
        showToast('Access denied: Doctor privileges required.', 'error');
        page = 'patient-home';
      } else if (AMBULANCE_ROUTES.includes(page)) {
        showToast('Access denied: Ambulance driver privileges required.', 'error');
        page = 'patient-home';
      }
    } else if (userRole === 'doctor') {
      if (PATIENT_ROUTES.includes(page)) {
        showToast('Access denied: Please use the Doctor Workspace.', 'warning');
        page = 'doctor-home';
      } else if (AMBULANCE_ROUTES.includes(page)) {
        showToast('Access denied: Ambulance driver portal restricted.', 'error');
        page = 'doctor-home';
      }
    } else if (userRole === 'ambulance') {
      if (PATIENT_ROUTES.includes(page)) {
        showToast('Access denied: Please use the Ambulance Driver portal.', 'warning');
        page = 'ambulance-home';
      } else if (DOCTOR_ROUTES.includes(page)) {
        showToast('Access denied: Doctor workspace restricted.', 'error');
        page = 'ambulance-home';
      }
    }
  }

  // 3. Browser History & URL Hash Synchronization
  const queryString = Object.keys(params).length
    ? '?' + new URLSearchParams(params).toString()
    : '';
  const targetHash = `#/${page}${queryString}`;

  if (!isHandlingPopState) {
    if (addHistory) {
      if (window.location.hash !== targetHash) {
        window.history.pushState(null, '', targetHash);
      }
    } else {
      window.history.replaceState(null, '', targetHash);
    }
  }

  // Record in store history array for backward compatibility
  if (store.currentPage !== page) {
    store.history.push(store.currentPage);
  }

  // 4. Cleanup previous page handlers
  if (currentCleanup && typeof currentCleanup === 'function') {
    try { currentCleanup(); } catch(e) {}
  }
  currentCleanup = null;

  store.currentPage = page;

  // 5. Render Page Component
  const app = document.getElementById('app');
  if (!app) return;

  if (routes[page]) {
    try {
      const result = routes[page](params);
      if (result && typeof result === 'function') {
        currentCleanup = result;
      }
    } catch (err) {
      console.error(`Error rendering route '${page}':`, err);
      app.innerHTML = `
        <div style="padding:40px 20px;text-align:center;color:var(--text-secondary);">
          <h2 style="font-size:20px;color:var(--emergency);margin-bottom:8px;">Page Encountered an Error</h2>
          <p style="font-size:14px;margin-bottom:16px;">${err.message}</p>
          <button class="btn btn-primary" onclick="navigate('user-type')">Return to Home</button>
        </div>
      `;
    }
  } else {
    app.innerHTML = `
      <div style="padding:60px 20px;text-align:center;color:var(--text-secondary);">
        <h2 style="font-size:22px;color:var(--text-primary);margin-bottom:8px;">Page Not Found</h2>
        <p style="font-size:14px;margin-bottom:20px;">The route '<strong>${page}</strong>' does not exist.</p>
        <button class="btn btn-primary" onclick="navigate('user-type')">Back to HealthVerse</button>
      </div>
    `;
  }

  // Scroll to top
  const content = document.querySelector('.screen-content');
  if (content) content.scrollTop = 0;
  window.scrollTo(0, 0);
}

/**
 * Handle browser Back button and in-app Back button
 */
export function goBack() {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    // Default fallback depending on role
    if (store.isLoggedIn) {
      if (store.userType === 'doctor') navigate('doctor-home', {}, false);
      else if (store.userType === 'ambulance') navigate('ambulance-home', {}, false);
      else navigate('patient-home', {}, false);
    } else {
      navigate('user-type', {}, false);
    }
  }
}

/**
 * Initialize Hash and Popstate Event Listeners
 */
export function initRouter() {
  const handleHashOrPopState = () => {
    isHandlingPopState = true;
    const { page, params } = parseHash();
    navigate(page, params, false);
    isHandlingPopState = false;
  };

  window.addEventListener('popstate', handleHashOrPopState);
  window.addEventListener('hashchange', handleHashOrPopState);
}

// Global exposure for inline onclick handlers across templates
window.navigate = navigate;
window.goBack = goBack;
