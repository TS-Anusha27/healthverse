// HealthVerse — User Type Selection with Supabase Role Synchronization
import { navigate } from '../../routes/router.js';
import { store } from '../../store/store.js';
import { showToast } from '../../utils/utils.js';
import { updateUserRole, signOutUser } from '../../services/supabase/auth.js';

export function renderUserType() {
  const app = document.getElementById('app');
  const user = store.currentUser;

  app.innerHTML = `
    <div class="screen" style="background:var(--bg);min-height:100dvh;">
      <div style="padding:60px 24px 32px;text-align:center;" class="animate-slide-up">
        <div style="font-size:13px;font-weight:600;color:var(--text-tertiary);letter-spacing:0.5px;text-transform:uppercase;margin-bottom:8px;">Welcome Back</div>
        <h1 style="font-size:26px;font-weight:800;font-family:var(--font-display);color:var(--text-primary);">
          Hi, ${user?.name?.split(' ')[0] || 'there'} 👋
        </h1>
        <p style="color:var(--text-secondary);margin-top:8px;font-size:15px;">Who are you continuing as today?</p>
      </div>

      <div style="padding:0 20px;display:flex;flex-direction:column;gap:16px;" class="animate-slide-up" style="animation-delay:0.1s;">
        <!-- Patient -->
        <div class="user-type-card" id="card-patient" onclick="selectUserType('patient')">
          <div class="user-type-icon" style="background:linear-gradient(135deg,#E8F4FD,#DBEEFF);">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4A90D9" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div class="user-type-info">
            <div class="user-type-name">Patient</div>
            <div class="user-type-desc">Book appointments, manage health records & AI insights</div>
          </div>
          <div class="user-type-arrow" style="color:#4A90D9;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
          <div class="user-type-badge" style="background:#4A90D9;">Most Popular</div>
        </div>

        <!-- Doctor -->
        <div class="user-type-card" id="card-doctor" onclick="selectUserType('doctor')">
          <div class="user-type-icon" style="background:linear-gradient(135deg,#E8F9F3,#D6F5E8);">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#52C99B" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <div class="user-type-info">
            <div class="user-type-name">Doctor</div>
            <div class="user-type-desc">Manage patients, prescriptions, and consultations</div>
          </div>
          <div class="user-type-arrow" style="color:#52C99B;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        </div>

        <!-- Ambulance Driver -->
        <div class="user-type-card" id="card-ambulance" onclick="selectUserType('ambulance')">
          <div class="user-type-icon" style="background:linear-gradient(135deg,#FFF0F1,#FFE0E3);">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF4757" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
            </svg>
          </div>
          <div class="user-type-info">
            <div class="user-type-name">Ambulance Driver</div>
            <div class="user-type-desc">Handle emergency requests and patient transport</div>
          </div>
          <div class="user-type-arrow" style="color:#FF4757;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        </div>
      </div>

      <!-- Sign out option -->
      <div style="text-align:center;margin-top:40px;">
        <span style="font-size:13px;color:var(--text-tertiary);cursor:pointer;" onclick="signOut()">
          Not you? Sign out
        </span>
      </div>
    </div>
  `;

  // Inject styles
  if (!document.getElementById('usertype-styles')) {
    const s = document.createElement('style');
    s.id = 'usertype-styles';
    s.textContent = `
      .user-type-card {
        background:var(--surface);
        border-radius:20px;
        padding:20px;
        display:flex;
        align-items:center;
        gap:16px;
        box-shadow:var(--shadow-sm);
        border:2px solid transparent;
        cursor:pointer;
        transition:all var(--transition-normal);
        position:relative;
        overflow:hidden;
      }
      .user-type-card:hover { transform:translateY(-2px);box-shadow:var(--shadow-md); }
      .user-type-card:active { transform:scale(0.98); }
      .user-type-card.selected { border-color:var(--primary);box-shadow:var(--shadow-primary); }
      .user-type-icon {
        width:64px;height:64px;border-radius:18px;
        display:flex;align-items:center;justify-content:center;flex-shrink:0;
      }
      .user-type-info { flex:1; }
      .user-type-name { font-family:var(--font-display);font-size:17px;font-weight:700;color:var(--text-primary); }
      .user-type-desc { font-size:13px;color:var(--text-secondary);margin-top:4px;line-height:1.4; }
      .user-type-arrow { flex-shrink:0; }
      .user-type-badge {
        position:absolute;top:12px;right:12px;
        font-size:10px;font-weight:700;color:white;
        padding:3px 8px;border-radius:999px;letter-spacing:0.3px;
        font-family:var(--font-display);
      }
    `;
    document.head.appendChild(s);
  }

  window.selectUserType = async (type) => {
    document.querySelectorAll('.user-type-card').forEach(c => c.classList.remove('selected'));
    document.getElementById(`card-${type}`).classList.add('selected');

    // Sync role to Supabase User Metadata & Profiles
    await updateUserRole(type);
    store.setUser(store.currentUser, type);

    setTimeout(() => {
      if (type === 'patient') navigate('patient-registration');
      else if (type === 'doctor') navigate('doctor-home');
      else if (type === 'ambulance') navigate('ambulance-home');
    }, 400);
  };

  window.signOut = async () => {
    await signOutUser();
    store.clearUser();
    navigate('login');
  };
}
