// HealthVerse — Appointments + Map Screen
import { navigate, goBack } from '../router.js';
import { mockData } from '../data.js';
import { showToast, showModal, closeModal, generateQRDisplay } from '../utils.js';

let map = null;
let selectedHospital = null;
let selectedDoctor = null;
let selectedDate = null;
let selectedSlot = null;

export function renderAppointments() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="screen" id="appt-screen">
      <!-- Header -->
      <div class="page-header">
        <button class="back-btn" onclick="goBack()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div class="page-title">Find & Book</div>
        <button class="btn-icon btn-ghost" onclick="showFilters()" aria-label="Filter">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
        </button>
      </div>

      <div class="screen-content">
        <!-- Search Bar -->
        <div class="section mt-2">
          <div class="input-group">
            <span class="input-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </span>
            <input type="text" class="form-input" placeholder="Search hospitals, doctors, specialties..." id="search-input" oninput="filterHospitals(this.value)" />
          </div>
        </div>

        <!-- Category Chips -->
        <div class="section mt-3">
          <div class="scroll-x">
            ${['All','Cardiology','Orthopedics','Neurology','Pediatrics','Oncology','ENT','Dermatology'].map((cat, i) =>
              `<div class="chip ${i===0?'active':''}" onclick="filterCategory(this,'${cat}')" id="cat-${cat.toLowerCase()}">${cat}</div>`
            ).join('')}
          </div>
        </div>

        <!-- Map -->
        <div class="section mt-4">
          <div class="section-header">
            <div class="section-title">Hospitals Near You</div>
            <div style="display:flex;align-items:center;gap:4px;font-size:12px;color:var(--secondary);">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Chennai, TN
            </div>
          </div>
          <div class="map-container" id="map-container">
            <div id="map"></div>
          </div>
        </div>

        <!-- Hospital List -->
        <div class="section mt-4 mb-4" id="hospital-list">
          <div class="section-title mb-3">Available Hospitals (${mockData.hospitals.length})</div>
          <div style="display:flex;flex-direction:column;gap:14px;">
            ${mockData.hospitals.map(h => renderHospitalCard(h)).join('')}
          </div>
        </div>
      </div>
    </div>
  `;

  initMap();
  if (typeof lucide !== 'undefined') lucide.createIcons();
  initApptHandlers();
}

function renderHospitalCard(h) {
  return `
    <div class="hosp-card" id="hosp-${h.id}" onclick="openHospital('${h.id}')">
      <div class="hosp-card-header">
        <div class="hosp-avatar">${h.name.charAt(0)}</div>
        <div style="flex:1;">
          <div class="hosp-name">${h.name}</div>
          <div class="hosp-spec">${h.specialty}</div>
          <div style="display:flex;align-items:center;gap:8px;margin-top:4px;">
            <div class="hosp-rating">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#FFA502" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              ${h.rating} <span style="color:var(--text-tertiary);">(${h.reviews.toLocaleString()})</span>
            </div>
            <div class="hosp-distance">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              ${h.distance}
            </div>
          </div>
        </div>
        ${h.emergency ? `<div class="badge badge-emergency">Emergency</div>` : ''}
      </div>
      <div class="hosp-card-body">
        <div class="hosp-stat">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          Wait: <strong>${h.waitTime}</strong>
        </div>
        <div class="hosp-stat">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          Queue: <strong>${h.queue} patients</strong>
        </div>
        <div class="hosp-stat">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          Beds: <strong>${h.beds.available} free</strong>
        </div>
      </div>
      <div class="hosp-specialties">
        ${h.specialties.slice(0,3).map(sp => `<span class="badge badge-primary" style="font-size:10px;">${sp}</span>`).join('')}
        ${h.specialties.length > 3 ? `<span class="badge badge-primary" style="font-size:10px;">+${h.specialties.length-3}</span>` : ''}
      </div>
      <button class="btn btn-primary btn-sm btn-full mt-3" onclick="event.stopPropagation();bookAtHospital('${h.id}')">
        Book Appointment
      </button>
    </div>
  `;
}

function initMap() {
  setTimeout(() => {
    const mapEl = document.getElementById('map');
    if (!mapEl || map) return;

    map = L.map('map', { zoomControl: false, attributionControl: false }).setView([13.0570, 80.2290], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    // Custom markers
    const hospitalIcon = L.divIcon({
      className: '',
      html: `<div style="width:36px;height:36px;background:white;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(74,144,217,0.4);border:2.5px solid #4A90D9;">
               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4A90D9" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
             </div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });

    mockData.hospitals.forEach(h => {
      L.marker([h.lat, h.lng], { icon: hospitalIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family:var(--font-display);min-width:160px;">
            <div style="font-weight:700;font-size:14px;color:#1A2332;">${h.name}</div>
            <div style="color:#6B7A8D;font-size:12px;margin-top:3px;">⭐ ${h.rating} • ${h.distance}</div>
            <div style="color:#6B7A8D;font-size:12px;margin-top:2px;">⏱️ Wait: ${h.waitTime}</div>
            <button onclick="bookAtHospital('${h.id}')" style="margin-top:8px;width:100%;padding:6px;background:#4A90D9;color:white;border:none;border-radius:8px;font-weight:600;cursor:pointer;font-size:12px;">Book Now</button>
          </div>
        `);
    });

    // User location marker
    const userIcon = L.divIcon({
      className: '',
      html: `<div style="width:14px;height:14px;background:#4A90D9;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(74,144,217,0.5);"></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });
    L.marker([13.0570, 80.2290], { icon: userIcon }).addTo(map).bindPopup('<div style="font-size:12px;font-weight:600;">📍 Your Location</div>');

    // Circles for nearby
    L.circle([13.0570, 80.2290], { radius: 5000, color: '#4A90D9', fillColor: '#4A90D9', fillOpacity: 0.04, weight: 1 }).addTo(map);

    setTimeout(() => map && map.invalidateSize(), 300);
  }, 200);
}

function initApptHandlers() {
  window.filterHospitals = (query) => {
    const q = query.toLowerCase();
    const list = document.getElementById('hospital-list');
    const filtered = mockData.hospitals.filter(h =>
      h.name.toLowerCase().includes(q) || h.specialty.toLowerCase().includes(q) ||
      h.specialties.some(s => s.toLowerCase().includes(q))
    );
    const titleEl = list?.querySelector('.section-title');
    if (titleEl) titleEl.textContent = `Available Hospitals (${filtered.length})`;
    const cards = list?.querySelector('div[style]');
    if (cards) cards.innerHTML = filtered.map(h => renderHospitalCard(h)).join('');
  };

  window.filterCategory = (el, cat) => {
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    if (cat === 'All') {
      window.filterHospitals('');
    } else {
      window.filterHospitals(cat);
    }
  };

  window.openHospital = (id) => {
    const h = mockData.hospitals.find(h => h.id === id);
    if (!h) return;
    showModal(`
      <h3 style="font-family:var(--font-display);font-size:20px;font-weight:700;color:var(--text-primary);">${h.name}</h3>
      <div style="display:flex;gap:10px;margin-top:8px;flex-wrap:wrap;">
        <span class="badge badge-primary">⭐ ${h.rating}</span>
        <span class="badge badge-secondary">📍 ${h.distance}</span>
        ${h.emergency ? '<span class="badge badge-emergency">🚨 Emergency</span>' : ''}
      </div>
      <div style="margin-top:16px;display:flex;flex-direction:column;gap:10px;font-size:14px;color:var(--text-secondary);">
        <div>📍 ${h.address}</div>
        <div>📞 ${h.phone}</div>
        <div>⏱️ Wait time: <strong style="color:var(--text-primary);">${h.waitTime}</strong></div>
        <div>👥 Queue: <strong style="color:var(--text-primary);">${h.queue} patients</strong></div>
        <div>🛏️ Available beds: <strong style="color:var(--secondary);">${h.beds.available} / ${h.beds.total}</strong></div>
      </div>
      <div style="margin-top:16px;">
        <div style="font-size:12px;font-weight:600;color:var(--text-tertiary);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Specialties</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;">
          ${h.specialties.map(s => `<span class="chip active">${s}</span>`).join('')}
        </div>
      </div>
      <div style="margin-top:16px;">
        <div style="font-size:12px;font-weight:600;color:var(--text-tertiary);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Insurance Accepted</div>
        <div style="font-size:13px;color:var(--text-secondary);">${h.insurance.join(' • ')}</div>
      </div>
      <button class="btn btn-primary btn-full mt-4" onclick="bookAtHospital('${h.id}');closeModal()">
        Book Appointment at ${h.name}
      </button>
    `);
  };

  window.bookAtHospital = (hospitalId) => {
    selectedHospital = mockData.hospitals.find(h => h.id === hospitalId);
    closeModal();
    showBookingFlow();
  };

  window.showFilters = () => {
    showModal(`
      <h3 style="font-family:var(--font-display);font-size:18px;font-weight:700;margin-bottom:20px;">Filter Hospitals</h3>
      <div style="display:flex;flex-direction:column;gap:16px;">
        <div class="form-group">
          <label class="form-label">Sort By</label>
          <select class="form-input form-select">
            <option>Distance — Nearest First</option>
            <option>Rating — Highest First</option>
            <option>Wait Time — Shortest First</option>
            <option>Availability</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Consultation Type</label>
          <div style="display:flex;gap:8px;">
            <div class="chip active">In-Person</div>
            <div class="chip">Video Call</div>
            <div class="chip">Home Visit</div>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Maximum Distance</label>
          <input type="range" min="1" max="20" value="10" style="width:100%;" />
          <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-tertiary);">
            <span>1 km</span><span>10 km</span><span>20 km</span>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Features</label>
          <div style="display:flex;flex-wrap:wrap;gap:8px;">
            <div class="chip">Emergency 24/7</div>
            <div class="chip">Accepts ABHA</div>
            <div class="chip">Cashless Insurance</div>
            <div class="chip">ICU</div>
          </div>
        </div>
      </div>
      <button class="btn btn-primary btn-full mt-4" onclick="closeModal();showToast('Filters applied','success')">Apply Filters</button>
    `);
  };
}

function showBookingFlow() {
  if (!selectedHospital) return;

  const doctors = mockData.doctors.filter(d => selectedHospital.doctors.includes(d.id));

  showModal(`
    <h3 style="font-family:var(--font-display);font-size:18px;font-weight:700;margin-bottom:4px;">Select Doctor</h3>
    <p style="font-size:13px;color:var(--text-secondary);margin-bottom:20px;">${selectedHospital.name}</p>
    <div style="display:flex;flex-direction:column;gap:12px;" id="doctor-list">
      ${doctors.length > 0 ? doctors.map(d => `
        <div class="doctor-card ${!d.available ? 'unavailable' : ''}" onclick="selectDoctor('${d.id}')" id="doc-sel-${d.id}">
          <div class="doc-avatar">${d.name.split(' ').slice(-1)[0].charAt(0)}</div>
          <div style="flex:1;">
            <div style="font-family:var(--font-display);font-size:15px;font-weight:700;">${d.name}</div>
            <div style="font-size:12px;color:var(--text-secondary);margin-top:2px;">${d.specialty} • ${d.experience}yr exp</div>
            <div style="display:flex;align-items:center;gap:8px;margin-top:4px;">
              <span style="font-size:11px;font-weight:600;color:var(--warning);">⭐ ${d.rating}</span>
              <span style="font-size:11px;color:var(--text-tertiary);">${d.reviews} reviews</span>
            </div>
          </div>
          <div style="text-align:right;">
            <div style="font-family:var(--font-display);font-size:15px;font-weight:700;color:var(--primary);">₹${d.fee}</div>
            <div class="badge ${d.available ? 'badge-success' : 'badge-warning'}" style="margin-top:4px;">${d.available ? 'Available' : 'Busy'}</div>
          </div>
        </div>
      `).join('') : `
        <div style="text-align:center;padding:30px;color:var(--text-secondary);">
          <p style="font-size:14px;">Showing general doctors for this hospital</p>
        </div>
        ${mockData.doctors.slice(0, 2).map(d => `
          <div class="doctor-card" onclick="selectDoctor('${d.id}')" id="doc-sel-${d.id}">
            <div class="doc-avatar">${d.name.split(' ').slice(-1)[0].charAt(0)}</div>
            <div style="flex:1;">
              <div style="font-family:var(--font-display);font-size:15px;font-weight:700;">${d.name}</div>
              <div style="font-size:12px;color:var(--text-secondary);margin-top:2px;">${d.specialty} • ${d.experience}yr exp</div>
            </div>
            <div style="text-align:right;">
              <div style="font-family:var(--font-display);font-size:15px;font-weight:700;color:var(--primary);">₹${d.fee}</div>
              <div class="badge badge-success" style="margin-top:4px;">Available</div>
            </div>
          </div>
        `).join('')}
      `}
    </div>
  `);

  if (!document.getElementById('booking-styles')) {
    const s = document.createElement('style');
    s.id = 'booking-styles';
    s.textContent = `
      .doctor-card { display:flex;align-items:center;gap:12px;padding:14px;background:var(--surface-dim);border-radius:14px;cursor:pointer;border:2px solid transparent;transition:all var(--transition-fast); }
      .doctor-card:hover { border-color:var(--primary);background:var(--primary-light); }
      .doctor-card.selected { border-color:var(--primary);background:var(--primary-light); }
      .doctor-card.unavailable { opacity:0.6; }
      .doc-avatar { width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,var(--primary-light),var(--primary-glow));color:var(--primary);font-family:var(--font-display);font-size:20px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
      .hosp-card { background:var(--surface);border-radius:18px;padding:18px;box-shadow:var(--shadow-sm);border:1px solid var(--border-light);cursor:pointer;transition:all var(--transition-normal); }
      .hosp-card:hover { box-shadow:var(--shadow-md);transform:translateY(-2px); }
      .hosp-card-header { display:flex;align-items:flex-start;gap:12px;margin-bottom:12px; }
      .hosp-avatar { width:52px;height:52px;border-radius:14px;background:var(--primary-light);color:var(--primary);font-family:var(--font-display);font-size:22px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
      .hosp-name { font-family:var(--font-display);font-size:16px;font-weight:700;color:var(--text-primary); }
      .hosp-spec { font-size:12px;color:var(--text-secondary);margin-top:2px; }
      .hosp-rating,.hosp-distance { display:flex;align-items:center;gap:4px;font-size:12px;color:var(--text-secondary);font-weight:500; }
      .hosp-card-body { display:flex;gap:14px;flex-wrap:wrap;margin-bottom:10px; }
      .hosp-stat { display:flex;align-items:center;gap:5px;font-size:12px;color:var(--text-secondary); }
      .hosp-specialties { display:flex;flex-wrap:wrap;gap:6px; }
    `;
    document.head.appendChild(s);
  }

  window.selectDoctor = (docId) => {
    selectedDoctor = mockData.doctors.find(d => d.id === docId) || mockData.doctors[0];
    document.querySelectorAll('.doctor-card').forEach(c => c.classList.remove('selected'));
    const el = document.getElementById(`doc-sel-${docId}`);
    if (el) el.classList.add('selected');
    setTimeout(() => showDatePicker(), 400);
  };
}

function showDatePicker() {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push({
      label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }),
      value: d.toISOString().split('T')[0],
      slots: Math.floor(Math.random() * 8) + 3
    });
  }

  showModal(`
    <h3 style="font-family:var(--font-display);font-size:18px;font-weight:700;margin-bottom:4px;">Select Date & Slot</h3>
    <p style="font-size:13px;color:var(--text-secondary);margin-bottom:20px;">${selectedDoctor?.name} • ${selectedHospital?.name}</p>
    <div class="scroll-x" style="gap:8px;margin-bottom:20px;">
      ${dates.map((d, i) => `
        <div class="date-chip ${i===0?'selected':''}" onclick="selectDate(this,'${d.value}')" id="date-${d.value}">
          <div class="date-label">${d.label}</div>
          <div class="date-slots">${d.slots} slots</div>
        </div>
      `).join('')}
    </div>
    <div style="font-size:14px;font-weight:600;color:var(--text-primary);margin-bottom:12px;">Available Time Slots</div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;" id="slot-grid">
      ${mockData.timeSlots.map(s => `
        <div class="time-slot ${!s.available ? 'booked' : ''}" onclick="${s.available ? `selectSlot(this,'${s.time}')` : ''}" id="slot-${s.id}">
          ${s.time}
        </div>
      `).join('')}
    </div>
    <button class="btn btn-primary btn-full mt-5" id="confirm-slot-btn" onclick="proceedToPayment()" disabled style="opacity:0.5;">
      Confirm Slot
    </button>
  `);

  if (!document.getElementById('slot-styles')) {
    const s = document.createElement('style');
    s.id = 'slot-styles';
    s.textContent = `
      .date-chip { flex-shrink:0;padding:12px 16px;background:var(--surface-dim);border:1.5px solid var(--border);border-radius:14px;cursor:pointer;text-align:center;min-width:90px;transition:all var(--transition-fast); }
      .date-chip.selected { background:var(--primary-light);border-color:var(--primary); }
      .date-label { font-size:13px;font-weight:600;color:var(--text-primary);font-family:var(--font-display); }
      .date-slots { font-size:11px;color:var(--text-secondary);margin-top:2px; }
      .date-chip.selected .date-label { color:var(--primary); }
      .time-slot { padding:10px;border-radius:10px;background:var(--surface-dim);border:1.5px solid var(--border);text-align:center;font-size:13px;font-weight:600;color:var(--text-secondary);cursor:pointer;transition:all var(--transition-fast); }
      .time-slot:hover { border-color:var(--primary);color:var(--primary); }
      .time-slot.selected { background:var(--primary);color:white;border-color:var(--primary); }
      .time-slot.booked { background:var(--bg-secondary);color:var(--text-tertiary);cursor:not-allowed;text-decoration:line-through; }
    `;
    document.head.appendChild(s);
  }

  window.selectDate = (el, val) => {
    document.querySelectorAll('.date-chip').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
    selectedDate = val;
  };
  selectedDate = dates[0].value;

  window.selectSlot = (el, time) => {
    document.querySelectorAll('.time-slot:not(.booked)').forEach(s => s.classList.remove('selected'));
    el.classList.add('selected');
    selectedSlot = time;
    const btn = document.getElementById('confirm-slot-btn');
    if (btn) { btn.disabled = false; btn.style.opacity = '1'; }
  };

  window.proceedToPayment = () => {
    if (!selectedSlot) { showToast('Please select a time slot', 'error'); return; }
    showPayment();
  };
}

function showPayment() {
  const fee = selectedDoctor?.fee || 800;
  showModal(`
    <h3 style="font-family:var(--font-display);font-size:18px;font-weight:700;margin-bottom:4px;">Payment</h3>
    <p style="font-size:13px;color:var(--text-secondary);margin-bottom:20px;">Secure checkout via HealthVerse Pay</p>

    <!-- Booking Summary -->
    <div style="background:var(--surface-dim);border-radius:14px;padding:16px;margin-bottom:16px;">
      <div style="font-size:13px;font-weight:600;color:var(--text-tertiary);margin-bottom:10px;">BOOKING SUMMARY</div>
      <div style="display:flex;flex-direction:column;gap:8px;font-size:14px;">
        <div class="flex justify-between"><span style="color:var(--text-secondary);">Doctor</span><span style="font-weight:600;">${selectedDoctor?.name}</span></div>
        <div class="flex justify-between"><span style="color:var(--text-secondary);">Hospital</span><span style="font-weight:600;">${selectedHospital?.name}</span></div>
        <div class="flex justify-between"><span style="color:var(--text-secondary);">Date & Time</span><span style="font-weight:600;">${selectedDate === new Date().toISOString().split('T')[0] ? 'Today' : 'Tomorrow'}, ${selectedSlot}</span></div>
        <div class="divider" style="margin:4px 0;"></div>
        <div class="flex justify-between"><span>Consultation Fee</span><span>₹${fee}</span></div>
        <div class="flex justify-between"><span style="color:var(--text-secondary);">Platform Fee</span><span>₹29</span></div>
        <div class="flex justify-between"><span style="color:var(--text-secondary);">GST (18%)</span><span>₹${Math.round(fee * 0.18)}</span></div>
        <div class="divider" style="margin:4px 0;"></div>
        <div class="flex justify-between"><span style="font-family:var(--font-display);font-weight:700;font-size:16px;">Total</span><span style="font-family:var(--font-display);font-weight:800;font-size:18px;color:var(--primary);">₹${fee + 29 + Math.round(fee * 0.18)}</span></div>
      </div>
    </div>

    <!-- Payment Methods -->
    <div style="font-size:13px;font-weight:600;color:var(--text-tertiary);margin-bottom:10px;">PAYMENT METHOD</div>
    <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:20px;">
      ${['UPI (GooglePay, PhonePe, Paytm)', 'Credit / Debit Card', 'Net Banking', 'EMI', 'ABHA Wallet'].map((m, i) => `
        <label style="display:flex;align-items:center;gap:12px;padding:12px;background:var(--surface-dim);border-radius:12px;cursor:pointer;border:1.5px solid ${i===0 ? 'var(--primary)' : 'transparent'};">
          <input type="radio" name="pay-method" value="${m}" ${i===0?'checked':''} />
          <span style="font-size:14px;font-weight:500;">${m}</span>
        </label>
      `).join('')}
    </div>

    <button class="btn btn-primary btn-full btn-lg" onclick="completePayment()">
      Pay ₹${fee + 29 + Math.round(fee * 0.18)} Securely
    </button>
  `);

  window.completePayment = () => {
    const btn = document.querySelector('#modal-sheet .btn-primary');
    if (btn) { btn.innerHTML = '<span class="animate-spin" style="display:inline-block;width:18px;height:18px;border:2px solid rgba(255,255,255,0.3);border-top-color:white;border-radius:50%;"></span> Processing...'; btn.disabled = true; }

    setTimeout(() => {
      closeModal();
      showBookingConfirmation();
    }, 1800);
  };
}

function showBookingConfirmation() {
  showModal(`
    <div style="text-align:center;padding:20px 0;">
      <div style="width:80px;height:80px;background:var(--success-light);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;animation:scaleInSpring 0.5s var(--transition-spring);">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <h3 style="font-family:var(--font-display);font-size:22px;font-weight:800;color:var(--text-primary);">Booked! 🎉</h3>
      <p style="font-size:14px;color:var(--text-secondary);margin-top:8px;">Your appointment has been confirmed</p>
      <div style="background:var(--surface-dim);border-radius:16px;padding:20px;margin:20px 0;text-align:left;">
        <div style="display:flex;flex-direction:column;gap:8px;font-size:14px;">
          <div class="flex justify-between"><span style="color:var(--text-secondary);">Doctor</span><span style="font-weight:600;">${selectedDoctor?.name || 'Dr. Priya K.'}</span></div>
          <div class="flex justify-between"><span style="color:var(--text-secondary);">Hospital</span><span style="font-weight:600;">${selectedHospital?.name || 'Apollo'}</span></div>
          <div class="flex justify-between"><span style="color:var(--text-secondary);">Slot</span><span style="font-weight:600;">${selectedSlot || '3:30 PM'}</span></div>
          <div class="flex justify-between"><span style="color:var(--text-secondary);">Token</span><span style="font-weight:700;color:var(--primary);">TK-052</span></div>
        </div>
      </div>
      <div style="display:flex;justify-content:center;margin:16px 0;">
        ${generateQRDisplay('QR-052-HEALTHVERSE')}
      </div>
      <div style="display:flex;gap:10px;margin-top:20px;">
        <button class="btn btn-primary" style="flex:1;" onclick="closeModal();navigate('live-queue')">View Queue</button>
        <button class="btn btn-ghost" onclick="closeModal()">Done</button>
      </div>
    </div>
  `);

  showToast('Appointment booked! QR code sent to your email 📧', 'success');
}
