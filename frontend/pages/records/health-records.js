// HealthVerse — Health Records Timeline with Supabase DB & Storage
import { navigate, goBack } from '../../routes/router.js';
import { mockData } from '../../services/data.js';
import { showToast, showModal, closeModal } from '../../utils/utils.js';
import { getHealthRecords, createHealthRecord } from '../../services/supabase/db.js';
import { uploadFile } from '../../services/supabase/storage.js';

let currentRecords = [];

export async function renderHealthRecords() {
  const app = document.getElementById('app');
  currentRecords = await getHealthRecords();

  app.innerHTML = `
    <div class="screen" id="records-screen" style="background:var(--bg);">
      <div class="page-header">
        <button class="back-btn" onclick="goBack()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div class="page-title">Health Records</div>
        <button class="btn-icon-sm btn-ghost" onclick="uploadRecordModal()" aria-label="Upload">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        </button>
      </div>

      <div class="screen-content" style="padding-bottom:100px;">
        <!-- Search -->
        <div class="section mt-2">
          <div class="input-group">
            <span class="input-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </span>
            <input type="text" class="form-input" placeholder="Search records, reports, prescriptions..." id="record-search" oninput="filterRecords(this.value)" />
          </div>
        </div>

        <!-- Filter Chips -->
        <div class="section mt-3">
          <div class="scroll-x" style="gap:8px;">
            ${['All','Blood Report','Prescription','Vaccination','X-Ray','MRI Scan','ECG Report'].map((cat, i) =>
              `<div class="chip ${i===0?'active':''}" onclick="filterRecordType(this,'${cat}')">${cat}</div>`
            ).join('')}
          </div>
        </div>

        <!-- ABHA Integration Banner -->
        <div class="section mt-4">
          <div style="background:linear-gradient(135deg,var(--primary-light),#DBEEFF);border-radius:16px;padding:16px;display:flex;align-items:center;gap:14px;cursor:pointer;" onclick="showToast('Syncing with ABHA records...','info')">
            <div style="width:44px;height:44px;background:var(--primary);border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div style="flex:1;">
              <div style="font-family:var(--font-display);font-size:14px;font-weight:700;color:var(--primary);">ABHA Connected</div>
              <div style="font-size:12px;color:var(--text-secondary);margin-top:2px;">AB-1234-5678-9012 • Synced</div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        </div>

        <!-- Stats -->
        <div class="section mt-4">
          <div class="grid-3">
            ${[
              { n: currentRecords.length, label: 'Total', color: 'var(--primary)', bg: 'var(--primary-light)' },
              { n: currentRecords.filter(r=>r.type==='Prescription').length, label: 'Scripts', color: 'var(--secondary)', bg: 'var(--secondary-light)' },
              { n: currentRecords.filter(r=>r.type==='Blood Report').length, label: 'Lab Reports', color: 'var(--accent)', bg: 'var(--accent-light)' },
            ].map(s => `
              <div style="background:${s.bg};border-radius:14px;padding:14px;text-align:center;">
                <div style="font-family:var(--font-display);font-size:24px;font-weight:800;color:${s.color};">${s.n}</div>
                <div style="font-size:11px;font-weight:600;color:${s.color};margin-top:2px;">${s.label}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Timeline -->
        <div class="section mt-5" id="records-list">
          <div class="section-title mb-4">Timeline</div>
          <div class="timeline" id="timeline-container">
            ${renderRecordItems(currentRecords)}
          </div>
        </div>
      </div>
    </div>
  `;

  injectRecordStyles();
  initRecordHandlers();
}

function renderRecordItems(records) {
  return records.map((r, i) => `
    <div class="timeline-item" onclick="openRecord('${r.id}')" style="animation:slideUp 0.4s ease ${i * 0.08}s both;">
      <div class="timeline-line ${i === records.length - 1 ? 'last' : ''}"></div>
      <div class="timeline-dot" style="background:${getRecordColor(r.type)};"></div>
      <div class="timeline-card">
        <div class="flex items-center gap-3">
          <div class="icon-box" style="background:${getRecordColor(r.type)}15;color:${getRecordColor(r.type)};width:40px;height:40px;">
            ${getRecordIcon(r.type)}
          </div>
          <div style="flex:1;">
            <div style="font-family:var(--font-display);font-size:14px;font-weight:700;color:var(--text-primary);">${r.title}</div>
            <div style="font-size:12px;color:var(--text-secondary);margin-top:2px;">${r.type}</div>
          </div>
          <div class="badge ${r.status === 'normal' ? 'badge-success' : r.status === 'active' ? 'badge-primary' : 'badge-secondary'}">${r.status}</div>
        </div>
        <div style="display:flex;align-items:center;gap:12px;margin-top:12px;font-size:12px;color:var(--text-tertiary);">
          <span>📅 ${r.date}</span>
          <span>🏥 ${r.hospital || 'Apollo Hospitals'}</span>
        </div>
        <div style="font-size:11px;color:var(--text-tertiary);margin-top:4px;">👨‍⚕️ ${r.doctor || 'Dr. Priya Krishnamurthy'}</div>
      </div>
    </div>
  `).join('');
}

function getRecordColor(type) {
  const map = { 'Blood Report': '#E74C3C', 'Prescription': '#4A90D9', 'ECG Report': '#7B68EE', 'Vaccination': '#27AE60', 'X-Ray': '#FFA502', 'MRI Scan': '#52C99B' };
  return map[type] || '#4A90D9';
}

function getRecordIcon(type) {
  const map = {
    'Blood Report': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>',
    'Prescription': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
    'ECG Report': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
    'Vaccination': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    'X-Ray': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/></svg>',
    'MRI Scan': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>'
  };
  return map[type] || map['Prescription'];
}

function injectRecordStyles() {
  if (document.getElementById('record-styles')) return;
  const s = document.createElement('style');
  s.id = 'record-styles';
  s.textContent = `
    .timeline { position:relative;padding-left:24px; }
    .timeline-item { position:relative;margin-bottom:16px;cursor:pointer; }
    .timeline-line { position:absolute;left:-16px;top:12px;width:2px;height:calc(100% + 16px);background:var(--border); }
    .timeline-line.last { display:none; }
    .timeline-dot { position:absolute;left:-20px;top:18px;width:10px;height:10px;border-radius:50%;border:2px solid var(--surface);box-shadow:0 0 0 2px var(--border);z-index:1; }
    .timeline-card { background:var(--surface);border-radius:16px;padding:16px;box-shadow:var(--shadow-sm);border:1px solid var(--border-light);transition:all var(--transition-normal); }
    .timeline-card:hover { box-shadow:var(--shadow-md);transform:translateX(4px); }
  `;
  document.head.appendChild(s);
}

function initRecordHandlers() {
  window.filterRecords = (query) => {
    const q = query.toLowerCase();
    const container = document.getElementById('timeline-container');
    if (!container) return;
    const records = currentRecords.filter(r =>
      r.title.toLowerCase().includes(q) || r.type.toLowerCase().includes(q) || (r.doctor && r.doctor.toLowerCase().includes(q))
    );
    container.innerHTML = renderRecordItems(records);
  };

  window.filterRecordType = (el, type) => {
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    window.filterRecords(type === 'All' ? '' : type);
  };

  window.openRecord = (id) => {
    const r = currentRecords.find(rec => rec.id === id);
    if (!r) return;
    showModal(`
      <h3 style="font-family:var(--font-display);font-size:18px;font-weight:700;">${r.title}</h3>
      <div class="badge ${r.status==='normal'?'badge-success':'badge-primary'}" style="margin-top:8px;">${r.status}</div>
      <div style="margin-top:20px;display:flex;flex-direction:column;gap:10px;font-size:14px;">
        <div class="flex justify-between"><span style="color:var(--text-secondary);">Type</span><strong>${r.type}</strong></div>
        <div class="flex justify-between"><span style="color:var(--text-secondary);">Date</span><strong>${r.date}</strong></div>
        <div class="flex justify-between"><span style="color:var(--text-secondary);">Hospital</span><strong>${r.hospital || 'Apollo Hospitals'}</strong></div>
        <div class="flex justify-between"><span style="color:var(--text-secondary);">Doctor</span><strong>${r.doctor || 'Dr. Priya Krishnamurthy'}</strong></div>
      </div>
      <div style="background:var(--surface-dim);border-radius:14px;padding:20px;margin-top:20px;text-align:center;">
        <div style="font-size:48px;margin-bottom:8px;">📄</div>
        <div style="font-size:14px;font-weight:600;color:var(--text-primary);">${r.title}</div>
        <div style="font-size:12px;color:var(--text-tertiary);margin-top:4px;">${r.file_url ? 'File stored on Supabase Storage' : 'Tap to view report'}</div>
      </div>
      <div style="display:flex;gap:10px;margin-top:20px;">
        <button class="btn btn-primary" style="flex:1;" onclick="window.open('${r.file_url || '#'}', '_blank');showToast('Opening report...','success');closeModal()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Download
        </button>
        <button class="btn btn-outline" onclick="showToast('Report shared securely','success');closeModal()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
          Share
        </button>
      </div>
    `);
  };

  window.uploadRecordModal = () => {
    const content = `
      <div style="padding:16px;">
        <h3 class="text-h2 text-center" style="margin-bottom:8px;">Upload Health Record</h3>
        <p class="text-caption text-center" style="margin-bottom:20px;">Files are stored securely in Supabase Storage</p>

        <div class="form-group">
          <label class="form-label">Record Title</label>
          <input type="text" id="upload-title" class="form-input" placeholder="e.g. Annual Blood Panel" />
        </div>

        <div class="form-group mt-3">
          <label class="form-label">Record Type</label>
          <select id="upload-type" class="form-input form-select">
            <option>Blood Report</option>
            <option>Prescription</option>
            <option>Vaccination</option>
            <option>X-Ray</option>
            <option>MRI Scan</option>
            <option>ECG Report</option>
          </select>
        </div>

        <div class="form-group mt-3">
          <label class="form-label">Select File (PDF, Image)</label>
          <input type="file" id="upload-file" class="form-input" accept="image/*,.pdf" />
        </div>

        <button class="btn btn-primary btn-full mt-4" onclick="handleFileUpload()">
          Upload to Supabase Storage
        </button>
      </div>
    `;
    showModal(content);

    window.handleFileUpload = async () => {
      const title = document.getElementById('upload-title').value.trim();
      const type = document.getElementById('upload-type').value;
      const fileInput = document.getElementById('upload-file');

      if (!title) { showToast('Please enter record title', 'error'); return; }
      if (!fileInput.files || fileInput.files.length === 0) {
        showToast('Please select a file to upload', 'error'); return;
      }

      const file = fileInput.files[0];
      showToast('Uploading to Supabase Storage...', 'info');

      const path = `${Date.now()}_${file.name}`;
      const { publicUrl } = await uploadFile('health-records', path, file);

      const newRecord = {
        id: `r_${Date.now()}`,
        title,
        type,
        date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        hospital: 'Apollo Hospitals',
        doctor: 'Dr. Priya Krishnamurthy',
        status: 'normal',
        icon: 'file-text',
        file_url: publicUrl
      };

      await createHealthRecord(newRecord);
      currentRecords.unshift(newRecord);

      showToast('Record uploaded successfully to Supabase! 🎉', 'success');
      closeModal();
      renderHealthRecords();
    };
  };
}
