// HealthVerse — Settings & Profile Management with Real Account Details & Edit Profile
import { navigate, goBack } from '../../routes/router.js';
import { store } from '../../store/store.js';
import { authService } from '../../services/auth/authService.js';
import { showToast, showModal, closeModal, getInitials, avatarColor } from '../../utils/utils.js';

export function renderSettings() {
  const profile = authService.getCurrentProfile() || store.patient || store.doctor || store.driver || {};
  const user = store.currentUser || {
    name: profile.fullName || profile.name || 'User',
    email: profile.email || 'user@healthverse.demo'
  };
  const role = store.userType || profile.role || 'patient';
  const roleName = role === 'doctor' ? 'Doctor' : role === 'ambulance' ? 'Ambulance Driver' : 'Patient';

  const app = document.getElementById('app');

  app.innerHTML = `
    <div class="screen" style="background:var(--bg);min-height:100dvh;">
      <!-- Page Header -->
      <div class="page-header" style="background:var(--surface);border-bottom:1px solid var(--border-light);box-shadow:var(--shadow-xs);">
        <button class="back-btn" onclick="goBack()" aria-label="Go back">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div class="page-title" style="font-family:var(--font-display);font-size:18px;font-weight:700;">Settings & Profile</div>
        <div style="width:38px;"></div>
      </div>

      <div class="screen-content" style="padding:20px;padding-bottom:100px;max-width:540px;margin:0 auto;">
        <!-- User Profile Card -->
        <div class="card mb-4" style="padding:20px;background:var(--surface);border:1px solid var(--border);border-radius:18px;">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="avatar avatar-lg" style="background:${avatarColor(user.name || 'User')};color:white;font-weight:700;font-size:18px;">
                ${getInitials(user.name || 'User')}
              </div>
              <div>
                <div style="font-family:var(--font-display);font-size:18px;font-weight:800;color:var(--text-primary);">${user.name}</div>
                <div style="font-size:13px;color:var(--text-secondary);">${user.email}</div>
                <div style="display:flex;gap:6px;align-items:center;margin-top:6px;">
                  <span class="badge badge-primary">${roleName.toUpperCase()}</span>
                  ${profile.verificationStatus === 'pending_verification'
                    ? '<span class="badge" style="background:#FEF3C7;color:#92400E;border:1px solid #FDE68A;">Pending Verification</span>'
                    : '<span class="badge" style="background:#D1FAE5;color:#065F46;">Verified</span>'}
                </div>
              </div>
            </div>
          </div>

          <div style="margin-top:16px;padding-top:14px;border-top:1px solid var(--border-light);display:flex;justify-content:flex-end;">
            <button class="btn btn-outline btn-sm" onclick="openEditProfileModal()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Edit Profile
            </button>
          </div>
        </div>

        <!-- Role-Specific Details Card -->
        <div class="card mb-4" style="padding:18px;background:var(--surface);border:1px solid var(--border);border-radius:18px;">
          <div style="font-family:var(--font-display);font-size:15px;font-weight:700;margin-bottom:14px;display:flex;align-items:center;justify-content:space-between;">
            <span>Profile Details</span>
            <span style="font-size:12px;color:var(--text-tertiary);">${roleName}</span>
          </div>

          <div style="display:flex;flex-direction:column;gap:12px;font-size:13px;">
            ${getRoleSpecificDetailsHtml(role, profile)}
          </div>
        </div>

        <!-- Appearance & Theme Preferences -->
        <div class="card mb-4" style="padding:18px;background:var(--surface);border:1px solid var(--border);border-radius:18px;">
          <div style="font-family:var(--font-display);font-size:15px;font-weight:700;margin-bottom:14px;">App Theme</div>
          
          <div class="flex justify-between items-center">
            <div>
              <div style="font-size:14px;font-weight:600;color:var(--text-primary);">Dark Theme</div>
              <div style="font-size:12px;color:var(--text-secondary);">Currently: <strong>${store.theme === 'dark' ? 'Dark Mode' : 'Light Mode (Default)'}</strong></div>
            </div>
            <label class="toggle" aria-label="Toggle dark mode">
              <input type="checkbox" id="theme-toggle" ${store.theme === 'dark' ? 'checked' : ''} onchange="handleThemeToggle(this.checked)" />
              <div class="toggle-track"></div>
              <div class="toggle-thumb"></div>
            </label>
          </div>
        </div>

        <!-- Account Actions -->
        <div class="card mb-4" style="padding:18px;background:var(--surface);border:1px solid var(--border);border-radius:18px;">
          <div style="display:flex;flex-direction:column;gap:10px;">
            <button class="btn btn-ghost btn-full" onclick="navigate('user-type')" style="justify-content:flex-start;font-size:14px;">
              🔄 Change Role / View Portals
            </button>
            <div style="height:1px;background:var(--border-light);margin:4px 0;"></div>
            <button class="btn btn-ghost btn-full" onclick="handleSettingsSignOut()" style="justify-content:flex-start;color:var(--emergency);font-size:14px;">
              🚪 Log Out of HealthVerse
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  attachSettingsHandlers(profile, role);
}

function getRoleSpecificDetailsHtml(role, p) {
  if (role === 'doctor') {
    return `
      <div class="flex justify-between"><span style="color:var(--text-secondary);">Specialisation</span><strong style="color:var(--text-primary);">${p.specialisation || p.specialty || 'General Practitioner'}</strong></div>
      <div class="flex justify-between"><span style="color:var(--text-secondary);">Qualification</span><strong style="color:var(--text-primary);">${p.qualification || 'MBBS'}</strong></div>
      <div class="flex justify-between"><span style="color:var(--text-secondary);">Hospital Affiliation</span><strong style="color:var(--text-primary);">${p.hospital || 'Affiliated Clinic'}</strong></div>
      <div class="flex justify-between"><span style="color:var(--text-secondary);">Medical Licence No.</span><strong style="color:var(--text-primary);">${p.medicalRegNo || 'Pending Verification'}</strong></div>
      <div class="flex justify-between"><span style="color:var(--text-secondary);">Contact Mobile</span><strong style="color:var(--text-primary);">${p.phone || 'Not provided'}</strong></div>
      ${p.experience ? `<div class="flex justify-between"><span style="color:var(--text-secondary);">Experience</span><strong style="color:var(--text-primary);">${p.experience}</strong></div>` : ''}
    `;
  }
  if (role === 'ambulance') {
    return `
      <div class="flex justify-between"><span style="color:var(--text-secondary);">Vehicle / Ambulance No.</span><strong style="color:var(--text-primary);">${p.vehicleNumber || 'Pending'}</strong></div>
      <div class="flex justify-between"><span style="color:var(--text-secondary);">Service Affiliation</span><strong style="color:var(--text-primary);">${p.serviceAffiliation || 'Emergency Service'}</strong></div>
      <div class="flex justify-between"><span style="color:var(--text-secondary);">Driving Licence No.</span><strong style="color:var(--text-primary);">${p.drivingLicenceNo || 'Pending Verification'}</strong></div>
      <div class="flex justify-between"><span style="color:var(--text-secondary);">Driver Mobile</span><strong style="color:var(--text-primary);">${p.phone || 'Not provided'}</strong></div>
      <div class="flex justify-between"><span style="color:var(--text-secondary);">Duty Status</span><strong style="color:var(--text-primary);text-transform:capitalize;">${p.dutyStatus || 'offline'}</strong></div>
    `;
  }
  // Patient
  return `
    <div class="flex justify-between"><span style="color:var(--text-secondary);">Date of Birth</span><strong style="color:var(--text-primary);">${p.dob || 'Not set'}</strong></div>
    <div class="flex justify-between"><span style="color:var(--text-secondary);">Calculated Age</span><strong style="color:var(--text-primary);">${p.age !== null && p.age !== undefined ? p.age + ' years' : 'Not calculated'}</strong></div>
    <div class="flex justify-between"><span style="color:var(--text-secondary);">Blood Group</span><strong style="color:var(--text-primary);">${p.bloodGroup || 'Not set'}</strong></div>
    <div class="flex justify-between"><span style="color:var(--text-secondary);">Gender</span><strong style="color:var(--text-primary);text-transform:capitalize;">${p.gender ? p.gender.replace('_', ' ') : 'Not specified'}</strong></div>
    <div class="flex justify-between"><span style="color:var(--text-secondary);">Mobile Phone</span><strong style="color:var(--text-primary);">${p.phone || 'Not provided'}</strong></div>
    <div class="flex justify-between"><span style="color:var(--text-secondary);">Address</span><strong style="color:var(--text-primary);text-align:right;">${p.address || 'Not provided'}</strong></div>
    <div class="flex justify-between"><span style="color:var(--text-secondary);">Emergency Contact</span><strong style="color:var(--text-primary);">${p.emergencyName || 'None'} ${p.emergencyPhone ? '(' + p.emergencyPhone + ')' : ''}</strong></div>
  `;
}

function attachSettingsHandlers(profile, role) {
  window.handleThemeToggle = (isDark) => {
    store.setTheme(isDark ? 'dark' : 'light');
    showToast(`Switched to ${isDark ? 'Dark Mode' : 'Light Mode'}`, 'info');
    renderSettings();
  };

  window.handleSettingsSignOut = () => {
    authService.logout();
    showToast('Signed out successfully. Returning to portal selection.', 'info');
    navigate('user-type');
  };

  window.openEditProfileModal = () => {
    const current = authService.getCurrentProfile() || profile;
    const isPatient = role === 'patient';
    const isDoctor = role === 'doctor';
    const isAmb = role === 'ambulance';

    const content = `
      <div style="padding:20px;max-height:80vh;overflow-y:auto;">
        <h3 style="font-family:var(--font-display);font-size:18px;font-weight:700;margin-bottom:16px;">
          Edit Profile Information
        </h3>

        <form id="edit-profile-form" onsubmit="event.preventDefault(); saveProfileChanges();">
          <div class="form-group mb-3">
            <label class="form-label">Full Name *</label>
            <input type="text" class="form-input" id="edit-fullname" value="${current.fullName || current.name || ''}" required />
          </div>

          <div class="form-group mb-3">
            <label class="form-label">Contact Phone</label>
            <input type="tel" class="form-input" id="edit-phone" value="${current.phone || ''}" placeholder="+91 9876543210" />
          </div>

          ${isPatient ? `
            <div class="form-group mb-3">
              <label class="form-label">Date of Birth</label>
              <input type="date" class="form-input" id="edit-dob" value="${current.dob || ''}" />
            </div>
            <div class="form-group mb-3">
              <label class="form-label">Blood Group</label>
              <select class="form-input form-select" id="edit-bloodgroup">
                <option value="">Select Blood Group</option>
                ${['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(bg => `
                  <option value="${bg}" ${current.bloodGroup === bg ? 'selected' : ''}>${bg}</option>
                `).join('')}
              </select>
            </div>
            <div class="form-group mb-3">
              <label class="form-label">Address / Location</label>
              <input type="text" class="form-input" id="edit-address" value="${current.address || ''}" placeholder="Street, City" />
            </div>
            <div class="form-group mb-3">
              <label class="form-label">Emergency Contact Name</label>
              <input type="text" class="form-input" id="edit-emer-name" value="${current.emergencyName || ''}" placeholder="Contact name" />
            </div>
            <div class="form-group mb-3">
              <label class="form-label">Emergency Phone</label>
              <input type="tel" class="form-input" id="edit-emer-phone" value="${current.emergencyPhone || ''}" placeholder="Contact number" />
            </div>
          ` : ''}

          ${isDoctor ? `
            <div class="form-group mb-3">
              <label class="form-label">Hospital Affiliation</label>
              <input type="text" class="form-input" id="edit-hospital" value="${current.hospital || ''}" />
            </div>
            <div class="form-group mb-3">
              <label class="form-label">Years of Experience</label>
              <input type="text" class="form-input" id="edit-experience" value="${current.experience || ''}" />
            </div>
          ` : ''}

          ${isAmb ? `
            <div class="form-group mb-3">
              <label class="form-label">Ambulance Service Affiliation</label>
              <input type="text" class="form-input" id="edit-service" value="${current.serviceAffiliation || ''}" />
            </div>
          ` : ''}

          <div style="display:flex;gap:10px;margin-top:20px;">
            <button type="button" class="btn btn-outline" style="flex:1;" onclick="closeModal()">Cancel</button>
            <button type="submit" class="btn btn-primary" style="flex:2;" id="btn-save-profile">Save Changes</button>
          </div>
        </form>
      </div>
    `;

    showModal(content);

    window.saveProfileChanges = async () => {
      const fullName = document.getElementById('edit-fullname')?.value?.trim();
      const phone = document.getElementById('edit-phone')?.value?.trim();

      if (!fullName) {
        showToast('Full name is required', 'error');
        return;
      }

      const updates = { fullName, phone };

      if (isPatient) {
        const dob = document.getElementById('edit-dob')?.value;
        const bloodGroup = document.getElementById('edit-bloodgroup')?.value;
        const address = document.getElementById('edit-address')?.value?.trim();
        const emergencyName = document.getElementById('edit-emer-name')?.value?.trim();
        const emergencyPhone = document.getElementById('edit-emer-phone')?.value?.trim();
        if (dob) updates.dob = dob;
        if (bloodGroup) updates.bloodGroup = bloodGroup;
        if (address !== undefined) updates.address = address;
        if (emergencyName !== undefined) updates.emergencyName = emergencyName;
        if (emergencyPhone !== undefined) updates.emergencyPhone = emergencyPhone;
      } else if (isDoctor) {
        const hospital = document.getElementById('edit-hospital')?.value?.trim();
        const experience = document.getElementById('edit-experience')?.value?.trim();
        if (hospital) updates.hospital = hospital;
        if (experience) updates.experience = experience;
      } else if (isAmb) {
        const serviceAffiliation = document.getElementById('edit-service')?.value?.trim();
        if (serviceAffiliation) updates.serviceAffiliation = serviceAffiliation;
      }

      const res = await authService.updateProfile(updates);
      if (res.success) {
        showToast('Profile updated successfully! ✨', 'success');
        closeModal();
        renderSettings();
      } else {
        showToast(res.error || 'Failed to update profile', 'error');
      }
    };
  };
}
