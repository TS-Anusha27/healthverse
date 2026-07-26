// HealthVerse â€” Splash Screen
import { navigate } from '../../routes/router.js';
import { store } from '../../store/store.js';

export function renderSplash() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="splash-screen" id="splash">
      <div class="splash-bg-orbs">
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="orb orb-3"></div>
      </div>
      <div class="splash-logo">
        <div class="splash-icon">
          <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M26 8C26 8 14 14 14 26C14 32 17.5 37 23 40L26 42L29 40C34.5 37 38 32 38 26C38 14 26 8 26 8Z" fill="white" fill-opacity="0.9"/>
            <path d="M22 26H30M26 22V30" stroke="#4A90D9" stroke-width="2.5" stroke-linecap="round"/>
            <circle cx="26" cy="26" r="5" stroke="#52C99B" stroke-width="2" fill="none"/>
          </svg>
        </div>
        <div>
          <div class="splash-title">HealthVerse</div>
          <div class="splash-tagline">A Complete Healthcare Universe</div>
        </div>
      </div>
      <div class="splash-loader">
        <div class="splash-dot"></div>
        <div class="splash-dot"></div>
        <div class="splash-dot"></div>
      </div>
      <div style="position:absolute;bottom:30px;left:0;right:0;text-align:center;font-size:11px;color:rgba(255,255,255,0.3);letter-spacing:1px;">
        v2.0.1 â€” Powered by HealthVerse AI
      </div>
    </div>
  `;

  // Inject orb styles
  if (!document.getElementById('splash-styles')) {
    const s = document.createElement('style');
    s.id = 'splash-styles';
    s.textContent = `
      .splash-bg-orbs { position:absolute; inset:0; pointer-events:none; overflow:hidden; }
      .orb { position:absolute; border-radius:50%; filter:blur(60px); opacity:0.18; animation:float 6s ease-in-out infinite; }
      .orb-1 { width:300px;height:300px;background:var(--primary);top:-80px;right:-80px;animation-delay:0s; }
      .orb-2 { width:250px;height:250px;background:var(--secondary);bottom:-60px;left:-60px;animation-delay:2s; }
      .orb-3 { width:200px;height:200px;background:var(--accent);top:40%;left:50%;transform:translate(-50%,-50%);animation-delay:4s; }
    `;
    document.head.appendChild(s);
  }

  // Transition after 2.2s
  setTimeout(() => {
    const splash = document.getElementById('splash');
    if (splash) {
      splash.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      splash.style.opacity = '0';
      splash.style.transform = 'scale(1.04)';
    }
    setTimeout(() => {
      if (store.isLoggedIn && store.currentUser) {
        const type = store.userType;
        if (type === 'doctor') navigate('doctor-home');
        else if (type === 'ambulance') navigate('ambulance-home');
        else navigate('patient-home');
      } else {
        navigate('login');
      }
    }, 600);
  }, 2200);
}
