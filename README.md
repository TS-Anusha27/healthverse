<div align="center">

  <!-- PROJECT LOGO -->
  <img src="./frontend/assets/images/hero.png" alt="HealthVerse Logo" width="120" height="120" style="border-radius: 24px;" />

  # 🏥 HealthVerse
  ### *A Complete Healthcare Universe*

  **Empowering patients, doctors, and emergency responders through a unified, AI-driven digital healthcare ecosystem.**

  ---

  <!-- SHIELDS BADGES -->
  <p align="center">
    <a href="https://github.com/TS-Anusha27/healthverse/blob/main/LICENSE">
      <img src="https://img.shields.io/github/license/TS-Anusha27/healthverse?style=for-the-badge&color=4A90D9" alt="License" />
    </a>
    <a href="https://github.com/TS-Anusha27/healthverse/releases">
      <img src="https://img.shields.io/github/v/release/TS-Anusha27/healthverse?style=for-the-badge&color=52C99B" alt="Version" />
    </a>
    <a href="https://vitejs.dev">
      <img src="https://img.shields.io/badge/Vite-8.1.5-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
    </a>
    <a href="https://supabase.com">
      <img src="https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
    </a>
    <a href="https://github.com/TS-Anusha27/healthverse/stargazers">
      <img src="https://img.shields.io/github/stars/TS-Anusha27/healthverse?style=for-the-badge&color=FFA502" alt="Stars" />
    </a>
    <a href="https://github.com/TS-Anusha27/healthverse/issues">
      <img src="https://img.shields.io/github/issues/TS-Anusha27/healthverse?style=for-the-badge&color=FF4757" alt="Issues" />
    </a>
    <a href="#contributing">
      <img src="https://img.shields.io/badge/PRs-Welcome-brightgreen.svg?style=for-the-badge" alt="Contributions Welcome" />
    </a>
  </p>

  <!-- BANNER -->
  <br />
  <img src="https://img.shields.io/badge/HealthVerse-Next--Gen_AI_Healthcare_Ecosystem-1E3A5F?style=for-the-badge&logo=heartpulse&logoColor=white&labelColor=0D4F3C" alt="HealthVerse Banner" width="100%" height="80" />
  <br />
  <br />

</div>

---

## 📌 Table of Contents

- [About HealthVerse](#-about-healthverse)
- [Vision](#-vision)
- [Features](#-features)
  - [Patient Suite](#-patient-suite)
  - [Doctor Portal](#-doctor-portal)
  - [Ambulance Dispatch](#-ambulance-dispatch)
  - [Hospital Queue & Management](#-hospital-queue--management)
  - [AI Engine](#-ai-engine)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Database Architecture](#-database-architecture)
- [Folder Structure](#-folder-structure)
- [Screenshots](#-screenshots)
- [Installation](#-installation)
- [Usage Guide](#-usage-guide)
- [Why HealthVerse is Unique](#-why-healthverse-is-unique)
- [Security & Compliance](#-security--compliance)
- [Future Roadmap](#-future-roadmap)
- [Team](#-team)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)
- [Acknowledgements](#-acknowledgements)

---

## 💡 About HealthVerse

Healthcare systems worldwide face immense friction: patients suffer long waiting times, critical medical records are fragmented across clinics, emergency response times are delayed, and doctors are overburdened by manual data entry.

**HealthVerse** bridges these gaps by providing an enterprise-grade digital health universe connecting patients, physicians, ambulance networks, blood banks, and hospitals in real time.

### 🚩 Key Healthcare Challenges Solved

| Problem | Traditional Healthcare | HealthVerse Solution |
|---|---|---|
| **Doctor Shortage & Triage** | Patients wait hours regardless of severity | **AI Symptom Triage** automatically ranks queue priority |
| **Hospital Waiting Queues** | Crowded, unpredictable waiting rooms | **Live Queue Tracker** with real-time token count & ETA |
| **Emergency Delays** | Slow manual 108/911 dispatch | **One-Tap Emergency SOS** with instant GPS location sharing |
| **Fragmented Records** | Paper prescriptions & lost test reports | **Encrypted Cloud Vault** accessible anywhere via ABHA |
| **Rural Healthcare Access** | Limited specialist availability | **Telemedicine Video Portal** connecting rural patients to specialists |
| **Blood & Organ Shortages** | Critical delays finding compatible donors | **Real-Time Donor Registry** & automated hospital matching |
| **Medication Errors** | Dangerous drug-drug & allergy interactions | **AI Drug Conflict Engine** alerting doctors before prescription |

---

## 🎯 Vision

> *"To revolutionize global healthcare accessibility by creating an intelligent, borderless healthcare ecosystem where every patient receives immediate triage, transparent care, and life-saving emergency intervention."*

---

## ✨ Features

<details>
<summary><b>👨‍👩‍👧‍👦 Patient Suite</b> (Click to expand)</summary>

<br />

- 🤖 **AI Health Assistant**: Interactive symptom checker and health risk assessment.
- 🗄️ **Medical Record Vault**: Secure PDF, scan, and lab report storage backed by Supabase Storage.
- 📋 **AI Medical Summarization**: Instant multi-page record synthesis into digestible patient summaries.
- 📅 **Online Appointment Booking**: Multi-specialty doctor discovery with QR code confirmations.
- ⏱️ **Live Queue Tracker**: Real-time position tracking and estimated consultation wait times.
- 📹 **Telemedicine Video Consultations**: Integrated WebRTC signaling for remote care.
- 🚨 **One-Tap Emergency SOS**: Auto-dispatches nearest ambulance and alerts emergency contacts.
- 🩸 **Blood Donation Network**: Live blood bank availability search and active donor requests.
- 🫀 **Organ Donation Registry**: Secure organ donor pledging linked to national registries.
- 💊 **Smart Medicine Reminders**: Pill tracking, dosage schedules, and 1-click pharmacy refills.
- 🏥 **Nearby Hospitals Radar**: Interactive Leaflet maps showing bed capacity and wait times.
- 👤 **Digital Health Profile**: Complete ABHA-linked health identity card.
</details>

<details>
<summary><b>👨‍⚕️ Doctor Portal</b> (Click to expand)</summary>

<br />

- 📊 **Doctor Dashboard**: Today's appointment schedules, patient counts, and urgent flags.
- 🧠 **Patient AI Summary**: Instant 30-second AI clinical synthesis before patient entry.
- ✍️ **Digital Prescription Writer**: Smart prescription builder with automatic allergy warnings.
- ⏱️ **Appointment & Queue Control**: Manage patient status (In Consultation, Next, Completed).
- 📜 **Patient History Timeline**: Longitudinal view of past diagnoses, labs, and vitals.
- 🚨 **Emergency Alerts**: High-priority notifications for incoming emergency transfers.
</details>

<details>
<summary><b>🚑 Ambulance Dispatch & Driver Module</b> (Click to expand)</summary>

<br />

- 📡 **Live Emergency Feed**: Real-time incoming SOS requests with patient location coordinates.
- 🗺️ **Turn-by-Turn Navigation**: Direct Leaflet/Mapbox map routing to patient and target hospital.
- ⚡ **Route Optimization**: AI-based traffic avoidance for fast transit.
- 🔄 **Status Updates**: 1-tap state toggles (`Online`, `Accepted`, `En Route`, `Completed`).
</details>

<details>
<summary><b>🏥 Hospital Management & AI Engine</b> (Click to expand)</summary>

<br />

- 🛏️ **Bed & Resource Tracker**: Real-time total vs. available ICU and general bed counts.
- 👨‍⚕️ **Roster & Availability**: Real-time doctor duty schedules and video consult slots.
- 🤖 **AI Patient Prioritization**: Automated Triage level assignment (Green, Yellow, Orange, Red).
- 📈 **Predictive Risk Assessment**: Cardiovascular, hypertension, and diabetes risk analytics.
</details>

---

## 🛠️ Tech Stack

| Domain | Technologies |
|---|---|
| **Frontend UI** | ![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat-square&logo=javascript&logoColor=black) ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/CSS3-Vanilla-1572B6?style=flat-square&logo=css3&logoColor=white) |
| **Build & Bundler** | ![Vite](https://img.shields.io/badge/Vite-8.1.5-646CFF?style=flat-square&logo=vite&logoColor=white) |
| **Backend Services** | ![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=flat-square&logo=supabase&logoColor=white) |
| **Database** | ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=flat-square&logo=postgresql&logoColor=white) |
| **Authentication** | ![Supabase Auth](https://img.shields.io/badge/Supabase-Auth-3ECF8E?style=flat-square&logo=supabase&logoColor=white) (JWT, Email OTP, Phone OTP) |
| **Storage** | ![Supabase Storage](https://img.shields.io/badge/Supabase-Storage-3ECF8E?style=flat-square&logo=supabase&logoColor=white) (5 Public Buckets) |
| **Mapping** | ![Leaflet](https://img.shields.io/badge/Leaflet-1.9.4-199900?style=flat-square&logo=leaflet&logoColor=white) OpenStreetMap |
| **Data Viz & Icons** | ![Chart.js](https://img.shields.io/badge/Chart.js-4.x-FF6384?style=flat-square&logo=chartdotjs&logoColor=white) ![Lucide](https://img.shields.io/badge/Lucide-Icons-F56565?style=flat-square) |

---

## 🏗️ System Architecture

```
                                  ┌────────────────────────────────┐
                                  │      HealthVerse Frontend      │
                                  │    (Vanilla JS + Vite SPA)     │
                                  └───────────────┬────────────────┘
                                                  │
                       ┌──────────────────────────┼──────────────────────────┐
                       │                          │                          │
            ┌──────────▼──────────┐    ┌──────────▼──────────┐    ┌──────────▼──────────┐
            │   Supabase Auth     │    │ Supabase Database   │    │  Supabase Storage   │
            │  (Email, Phone, OTP)│    │   (PostgreSQL 15)   │    │ (5 Storage Buckets) │
            └─────────────────────┘    └──────────┬──────────┘    └─────────────────────┘
                                                  │
                                       ┌──────────┴──────────┐
                                       │ Row Level Security  │
                                       │ (Patient/Doc/Driver)│
                                       └─────────────────────┘
```

---

## 🗄️ Database Architecture

The backend database runs on **PostgreSQL** hosted via **Supabase**. It contains **19 normalized domain tables**:

<details>
<summary><b>View Database Table Schema Summary</b> (Click to expand)</summary>

<br />

1. `profiles`: Core identity table linked to `auth.users` via database trigger.
2. `patients`: Detailed patient physical stats, emergency contacts, blood group.
3. `doctors`: Doctor qualifications, fees, specialty, hospital linkage.
4. `ambulance_drivers`: Vehicle numbers, driver location, status (`available`/`busy`/`offline`).
5. `hospitals`: Hospital facilities, bed capacity, wait time, geo-coordinates.
6. `appointments`: Appointment bookings, status, queue token, QR code.
7. `health_records`: Medical documents, lab reports, X-rays, file URLs.
8. `ai_summaries`: AI-generated patient health scores, condition timelines, risk scores.
9. `prescriptions`: Digital prescriptions written by doctors with drug conflict alerts.
10. `medicines`: Medication schedules, daily dose adherence trackers.
11. `medicine_orders`: Pharmacy refill orders & delivery addresses.
12. `blood_donors`: Registered blood donor directory & eligibility.
13. `organ_donors`: Organ donor pledge registry.
14. `emergency_requests`: Live SOS emergency dispatches & driver acceptance timestamps.
15. `notifications`: In-app notification center.
16. `payments`: Payment transaction logs & UPI receipts.
17. `telemedicine_sessions`: Video consultation rooms & schedules.
18. `hospital_reviews`: Patient hospital ratings & feedback.
19. `doctor_reviews`: Patient doctor reviews & ratings.
</details>

---

## 📂 Folder Structure

```
healthverse/
├── frontend/                    # Application client code
│   ├── assets/                  # Images, icons, and illustrations
│   ├── components/              # Shared UI component scaffolding
│   ├── pages/                   # Domain-driven page modules
│   │   ├── ai/                  # AI Insights & Risk Predictions
│   │   ├── ambulance/           # Driver dispatch interface
│   │   ├── appointments/        # Booking & Live Queue tracking
│   │   ├── auth/                # Login, Register, UserType, Splash
│   │   ├── bloodDonation/       # Blood & Organ Donation registry
│   │   ├── doctor/              # Doctor Dashboard, Summary & Prescription
│   │   ├── emergency/           # Emergency SOS & AI Triage chatbot
│   │   ├── patient/             # Patient Home Dashboard
│   │   ├── profile/             # Settings & Notifications
│   │   ├── records/             # Health Records Vault & Medicines
│   │   ├── telemedicine/        # Telemedicine Video Portal
│   │   └── index.js             # Pages barrel export file
│   ├── routes/                  # Client-side router with Protected Route middleware
│   ├── services/                # API & Supabase Service Layer
│   │   ├── data.js              # Fallback mock datasets & AI engines
│   │   └── supabase/            # Client, Auth, Database & Storage clients
│   ├── store/                   # Global reactive state store
│   ├── styles/                  # CSS Design System tokens & utilities
│   ├── utils/                   # Utility helpers (toasts, modals, dates)
│   └── main.js                  # Application entry point
├── backend/                     # Server-side API scaffold
├── database/                    # Database migrations & SQL schemas
│   └── schema/                  # Full SQL migration files
├── docs/                        # Project architecture & API guides
├── public/                      # Static web assets
├── .env.example                 # Environment variables template
├── index.html                   # HTML App shell
├── package.json                 # Node dependencies
└── PROJECT_STRUCTURE.md         # Detailed folder layout documentation
```

---

## 📸 Application Previews & Screenshots

| Module | Feature Badge | Status |
|---|---|:---:|
| **Splash / Auth Portal** | ![Splash Screen](https://img.shields.io/badge/Screen-Splash_%26_Auth_Portal-1E3A5F?style=for-the-badge&logo=supabase&logoColor=white) | ✅ Connected |
| **Patient Dashboard** | ![Patient Dashboard](https://img.shields.io/badge/Screen-Patient_Home_Dashboard-4A90D9?style=for-the-badge&logo=activity&logoColor=white) | ✅ Connected |
| **Doctor Dashboard** | ![Doctor Dashboard](https://img.shields.io/badge/Screen-Doctor_Clinical_Dashboard-52C99B?style=for-the-badge&logo=stethoscope&logoColor=white) | ✅ Connected |
| **Ambulance Dispatch** | ![Ambulance Dispatch](https://img.shields.io/badge/Screen-Ambulance_Emergency_Radar-FF4757?style=for-the-badge&logo=googlemaps&logoColor=white) | ✅ Connected |
| **Appointments & Queue** | ![Live Queue](https://img.shields.io/badge/Screen-Live_Hospital_Queue_Tracker-7B68EE?style=for-the-badge&logo=clock&logoColor=white) | ✅ Connected |
| **Medical Records Vault** | ![Health Records](https://img.shields.io/badge/Screen-Health_Records_Vault-FFA502?style=for-the-badge&logo=files&logoColor=white) | ✅ Connected |
| **Telemedicine Portal** | ![Telemedicine](https://img.shields.io/badge/Screen-Video_Consultation_Room-00D2D3?style=for-the-badge&logo=webrtc&logoColor=white) | ✅ Connected |
| **Emergency SOS** | ![Emergency SOS](https://img.shields.io/badge/Screen-One--Tap_Emergency_SOS-E74C3C?style=for-the-badge&logo=alert-triangle&logoColor=white) | ✅ Connected |
| **Blood & Organ Registry** | ![Donor Registry](https://img.shields.io/badge/Screen-Donor_Registry_%26_Requests-C62828?style=for-the-badge&logo=heart&logoColor=white) | ✅ Connected |

---

## ⚙️ Installation

### 1. Prerequisites
- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- A free **Supabase** account

### 2. Clone Repository
```bash
git clone https://github.com/TS-Anusha27/healthverse.git
cd healthverse
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Create a `.env` file in the root directory:
```env
VITE_APP_NAME=HealthVerse
VITE_APP_VERSION=1.0.0

VITE_SUPABASE_URL=https://your-supabase-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-public-key
```

### 5. Setup Supabase Database Schema
Copy and execute the contents of [`database/schema/02_full_supabase_migration.sql`](file:///c:/Users/Anirudh/Desktop/healthverse/database/schema/02_full_supabase_migration.sql) inside your **Supabase Dashboard → SQL Editor**.

### 6. Run Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🚀 Usage Guide

1. **Authentication**: Register a new user using Email or OTP, then select your account role (**Patient**, **Doctor**, or **Ambulance Driver**).
2. **Patient Experience**: Book an appointment, view live queue status, upload medical reports to the Supabase Cloud Vault, or trigger Emergency SOS.
3. **Doctor Experience**: Switch account role to **Doctor** to view AI-prioritized patient queues, review clinical AI summaries, and issue digital prescriptions with conflict warnings.
4. **Ambulance Driver Experience**: Switch account role to **Ambulance Driver** to accept live incoming SOS requests and view turn-by-turn map navigation.

---

## ⚡ Why HealthVerse is Unique

| Feature | Generic Health Apps | HealthVerse Ecosystem |
|---|:---:|:---:|
| **Ecosystem Scope** | Fragmented (Appt only or Telehealth only) | 🌐 **Unified 5-in-1 Ecosystem** (Patient, Doctor, Driver, Hospital, AI) |
| **Patient Prioritization** | First-Come-First-Serve | 🧠 **AI-Powered Triage & Clinical Risk Scoring** |
| **Emergency Response** | Dial phone number | 🚨 **One-Tap SOS Dispatch & GPS Driver Radar** |
| **Queue Management** | Static appointment time | ⏱️ **Live Hospital Queue & Token Position Tracker** |
| **Prescription Safety** | Plain text / PDF | ⚠️ **AI Drug-Drug & Allergy Conflict Detection** |
| **Donation Platform** | None | 🩸 **Integrated Blood & Organ Donor Registries** |
| **Data Protection** | Basic Database | 🛡️ **Supabase Row Level Security & Encryption** |

---

## 🔒 Security & Compliance

- 🔑 **Supabase Authentication**: Secure JWT handling with automatic token refresh.
- 🛡️ **Row Level Security (RLS)**: Fine-grained PostgreSQL policies restricting patient data access strictly to authorized users and physicians.
- 📦 **Secure Storage**: Public and private storage bucket policies for HIPAA-aligned document safety.
- 🚦 **Role-Based Access Control (RBAC)**: Enforced client-side router protection for `Patient`, `Doctor`, and `Ambulance Driver` roles.

---

## 🔮 Future Roadmap

- [ ] ⌚ **Smartwatch & Wearable Integration** (Apple HealthKit / Google Health Connect)
- [ ] 🤖 **Advanced AI Diagnostics Engine** (Automated Chest X-Ray & MRI anomaly detection)
- [ ] 🏥 **Hospital ERP Integration** (HL7 / FHIR protocol compatibility)
- [ ] 🇮🇳 **ABHA (Ayushman Bharat Health Account) Full Sync**
- [ ] 🎙️ **Multilingual Voice Assistant** (Vernacular support for rural adoption)
- [ ] 📡 **Offline Rural Mode** (P2P synchronization in zero-bandwidth areas)

---

## 👥 Team

| Name | Role | Socials |
|---|---|---|
| **Lead Architect** | Full Stack & AI Lead | [![GitHub](https://img.shields.io/badge/GitHub-Profile-181717?style=flat-square&logo=github)](https://github.com/TS-Anusha27) |
| **AI Systems Engineer** | ML Model & Triage Engine | [![GitHub](https://img.shields.io/badge/GitHub-Profile-181717?style=flat-square&logo=github)](https://github.com/TS-Anusha27) |
| **Database Architect** | PostgreSQL & Supabase Specialist | [![GitHub](https://img.shields.io/badge/GitHub-Profile-181717?style=flat-square&logo=github)](https://github.com/TS-Anusha27) |
| **UI/UX Designer** | Product Design & Mobile Systems | [![GitHub](https://img.shields.io/badge/GitHub-Profile-181717?style=flat-square&logo=github)](https://github.com/TS-Anusha27) |

---

## 🤝 Contributing

Contributions are what make the open-source community an amazing place to learn, inspire, and create!

1. Fork the Project (`git checkout -b feature/AmazingFeature`)
2. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
3. Push to the Branch (`git push origin feature/AmazingFeature`)
4. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

---

## 📞 Contact

- **Project Lead**: [TS-Anusha27](https://github.com/TS-Anusha27)
- **GitHub Repository**: [https://github.com/TS-Anusha27/healthverse](https://github.com/TS-Anusha27/healthverse)
- **Project Issues**: [Report a Bug / Request Feature](https://github.com/TS-Anusha27/healthverse/issues)

---

## 🙏 Acknowledgements

- [Supabase](https://supabase.com) — Open Source Firebase Alternative
- [Vite](https://vitejs.dev) — Next Generation Frontend Tooling
- [Leaflet.js](https://leafletjs.com) — Mobile-friendly Interactive Maps
- [Chart.js](https://www.chartjs.org) — Flexible JavaScript Charting
- [Lucide Icons](https://lucide.dev) — Beautiful & Consistent Icons
