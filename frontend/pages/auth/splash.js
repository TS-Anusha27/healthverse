// HealthVerse — Professional Light Theme Splash Screen
import { navigate, parseHash } from '../../routes/router.js';
import { store } from '../../store/store.js';

export function renderSplash() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="splash-screen-light" id="splash">
      <div class="splash-bg-orbs-light">
        <div class="orb-light orb-1-light"></div>
        <div class="orb-light orb-2-light"></div>
      </div>
      <div class="splash-logo-light">
        <div class="splash-icon-light">
          <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M26 8C26 8 14 14 14 26C14 32 17.5 37 23 40L26 42L29 40C34.5 37 38 32 38 26C38 14 26 8 26 8Z" fill="white" fill-opacity="0.95"/>
            <path d="M22 26H30M26 22V30" stroke="#4A90D9" stroke-width="2.5" stroke-linecap="round"/>
            <circle cx="26" cy="26" r="5" stroke="#52C99B" stroke-width="2" fill="none"/>
          </svg>
        </div>
        <div style="text-align:center;">
          <div class="splash-title-light">HealthVerse</div>
          <div class="splash-tagline-light">A Complete Healthcare Universe</div>
        </div>
      </div>
      <div class="splash-loader-light">
        <div class="splash-dot-light"></div>
        <div class="splash-dot-light"></div>
        <div class="splash-dot-light"></div>
      </div>
      <div style="position:absolute;bottom:24px;left:0;right:0;text-align:center;font-size:12px;color:var(--text-tertiary);letter-spacing:0.5px;">
        AI-Powered Healthcare Ecosystem
      </div>
    </div>
  `;

  // Inject light splash styles
  if (!document.getElementById('splash-light-styles')) {
    const s = document.createElement('style');
    s.id = 'splash-light-styles';
    s.textContent = `
      .splash-screen-light {
        position: fixed; inset: 0;
        background: linear-gradient(135deg, #F8FAFC 0%, #EDF4FB 50%, #E8F9F3 100%);
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        z-index: var(--z-top); overflow: hidden;
      }
      .splash-bg-orbs-light { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
      .orb-light { position: absolute; border-radius: 50%; filter: blur(70px); opacity: 0.35; }
      .orb-1-light { width: 320px; height: 320px; background: #BEE3F8; top: -60px; right: -60px; }
      .orb-2-light { width: 280px; height: 280px; background: #C6F6D5; bottom: -50px; left: -50px; }
      .splash-logo-light {
        display: flex; flex-direction: column; align-items: center; gap: 16px;
        animation: scaleInSpring 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        z-index: 1;
      }
      .splash-icon-light {
        width: 88px; height: 88px;
        background: linear-gradient(135deg, #4A90D9 0%, #52C99B 100%);
        border-radius: 26px; display: flex; align-items: center; justify-content: center;
        box-shadow: 0 16px 36px rgba(74, 144, 217, 0.28);
      }
      .splash-title-light {
        font-family: var(--font-display); font-size: 28px; font-weight: 800;
        color: var(--text-primary); letter-spacing: -0.5px;
      }
      .splash-tagline-light {
        font-size: 13px; font-weight: 600; color: var(--text-secondary);
        letter-spacing: 0.5px; margin-top: 4px;
      }
      .splash-loader-light {
        display: flex; gap: 8px; margin-top: 32px; z-index: 1;
      }
      .splash-dot-light {
        width: 10px; height: 10px; border-radius: 50%; background: var(--primary);
        animation: splashBounce 1.2s ease-in-out infinite;
      }
      .splash-dot-light:nth-child(2) { animation-delay: 0.2s; background: var(--secondary); }
      .splash-dot-light:nth-child(3) { animation-delay: 0.4s; background: var(--accent); }
      @keyframes splashBounce {
        0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
        40% { transform: scale(1.1); opacity: 1; }
      }
    `;
    document.head.appendChild(s);
  }

  // Check saved session in parallel with animation
  const checkSessionPromise = store.loadSavedUser();

  // Transition after 1.6s
  setTimeout(async () => {
    await checkSessionPromise;
    const splash = document.getElementById('splash');
    if (splash) {
      splash.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      splash.style.opacity = '0';
      splash.style.transform = 'scale(1.02)';
    }

    setTimeout(() => {
      const currentHash = window.location.hash.trim();
      if (currentHash && currentHash !== '#' && currentHash !== '#/' && !currentHash.includes('splash')) {
        const { page, params } = parseHash();
        navigate(page, params, false);
      } else if (store.isLoggedIn && store.currentUser) {
        const type = store.userType;
        if (type === 'doctor') navigate('doctor-home');
        else if (type === 'ambulance') navigate('ambulance-home');
        else navigate('patient-home');
      } else {
        navigate('user-type');
      }
    }, 400);
  }, 1600);
}
