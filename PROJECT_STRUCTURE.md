# HealthVerse — Project Structure

> Enterprise-grade folder architecture for a scalable healthcare ecosystem.

---

## Overview

HealthVerse is an AI-powered healthcare platform built with **Vanilla JavaScript** and **Vite**. The project follows a domain-driven directory structure separating concerns into frontend, backend (scaffold), database (scaffold), and documentation layers.

---

## Directory Tree

```
healthverse/
│
├── frontend/                    # All client-side application code
│   ├── assets/                  # Static assets
│   │   ├── images/              # Image files (hero, logos, illustrations)
│   │   ├── icons/               # SVG and icon assets
│   │   ├── fonts/               # Custom web fonts
│   │   └── animations/          # Lottie or CSS animation assets
│   │
│   ├── components/              # Reusable UI building blocks
│   │   ├── common/              # Shared components (loaders, empty states)
│   │   ├── ui/                  # Atomic UI elements (buttons, badges, chips)
│   │   ├── cards/               # Card components (doctor card, hospital card)
│   │   ├── forms/               # Form elements (inputs, selects, toggles)
│   │   ├── navigation/          # Nav bars, tab bars, breadcrumbs
│   │   ├── modals/              # Modal and bottom sheet components
│   │   ├── maps/                # Map-related components (Leaflet wrappers)
│   │   └── charts/              # Chart.js wrappers and health visualizations
│   │
│   ├── layouts/                 # Page layout templates (app shell, auth layout)
│   │
│   ├── pages/                   # Page-level modules organized by domain
│   │   ├── auth/                # Authentication flow
│   │   │   ├── splash.js        #   Splash/loading screen
│   │   │   ├── login.js         #   Login (phone/email OTP)
│   │   │   ├── usertype.js      #   User type selection (patient/doctor/ambulance)
│   │   │   └── patient-registration.js  # Patient registration form
│   │   ├── patient/             # Patient dashboard
│   │   │   └── patient-home.js  #   Patient home with quick actions & stats
│   │   ├── doctor/              # Doctor-facing pages
│   │   │   ├── doctor-dashboard.js    # Doctor home dashboard
│   │   │   ├── doctor-summary.js      # AI patient summary view
│   │   │   └── doctor-prescription.js # Digital prescription writer
│   │   ├── ambulance/           # Ambulance driver interface
│   │   │   └── ambulance-driver.js    # Driver dashboard with live requests
│   │   ├── appointments/        # Appointment management
│   │   │   ├── appointments.js  #   Book, view, manage appointments
│   │   │   └── live-queue.js    #   Real-time hospital queue tracker
│   │   ├── telemedicine/        # Video consultation
│   │   │   └── telemedicine.js  #   Telemedicine session interface
│   │   ├── emergency/           # Emergency services
│   │   │   ├── sos.js           #   One-tap SOS emergency dispatch
│   │   │   └── triage.js        #   AI-powered symptom triage chatbot
│   │   ├── bloodDonation/       # Blood & organ donation
│   │   │   └── blood-donation.js #  Blood/organ donation with donor search
│   │   ├── ai/                  # AI-powered features
│   │   │   └── health-insights.js #  AI health insights & risk scores
│   │   ├── records/             # Medical records & medicines
│   │   │   ├── health-records.js #  View/manage health records
│   │   │   └── medicines.js     #   Medicine tracker & reminders
│   │   ├── profile/             # User profile & preferences
│   │   │   ├── settings.js      #   App settings & theme toggle
│   │   │   └── notifications.js #   Notification center
│   │   └── index.js             # Barrel file — re-exports all page renderers
│   │
│   ├── hooks/                   # Custom hooks (future use)
│   ├── services/                # Data services & API layer
│   │   └── data.js              #   Mock data, triage engine, AI summaries
│   ├── context/                 # App-wide context providers (future use)
│   ├── store/                   # Global state management
│   │   └── store.js             #   Reactive store (auth, theme, navigation)
│   ├── utils/                   # Utility functions
│   │   └── utils.js             #   Toast, modal, date formatting, QR display
│   ├── constants/               # App-wide constants & enums (future use)
│   ├── styles/                  # Stylesheets
│   │   └── style.css            #   Complete design system (1280+ lines)
│   ├── routes/                  # Routing configuration
│   │   └── router.js            #   Client-side SPA router
│   ├── config/                  # App configuration (future use)
│   └── main.js                  # Application entry point
│
├── backend/                     # Server-side code (scaffold for future)
│   ├── api/                     # API route definitions
│   ├── controllers/             # Request handlers
│   ├── middleware/               # Auth, logging, rate-limiting middleware
│   ├── models/                  # Database models / schemas
│   ├── routes/                  # Express/Fastify route files
│   ├── services/                # Business logic layer
│   ├── ai/                      # AI/ML model integrations
│   ├── auth/                    # Authentication & authorization
│   ├── notifications/           # Push notification services
│   ├── maps/                    # Geolocation & mapping services
│   ├── telemedicine/            # Video call signaling & WebRTC
│   ├── appointments/            # Appointment scheduling logic
│   ├── ambulance/               # Ambulance dispatch & tracking
│   ├── bloodDonation/           # Blood donation matching
│   ├── organDonation/           # Organ donation registry
│   ├── medicalRecords/          # EHR / medical records management
│   ├── payment/                 # Payment processing
│   ├── utils/                   # Server-side utilities
│   ├── config/                  # Server configuration
│   └── README.md                # Backend setup instructions
│
├── database/                    # Database layer (scaffold for future)
│   ├── schema/                  # Database schema definitions
│   ├── migrations/              # Schema migration scripts
│   ├── seed/                    # Seed data for development
│   ├── backups/                 # Database backup scripts
│   └── README.md                # Database documentation
│
├── docs/                        # Project documentation
│   ├── Architecture.md          # System architecture overview
│   ├── API.md                   # API endpoint documentation
│   ├── Database.md              # Database schema documentation
│   ├── Setup.md                 # Development setup guide
│   └── UserGuide.md             # End-user guide
│
├── public/                      # Static public assets (served as-is)
│   ├── favicon.svg              # App favicon
│   └── icons.svg                # SVG icon sprite
│
├── .env.example                 # Environment variable template
├── .gitignore                   # Git ignore rules
├── index.html                   # HTML entry point
├── package.json                 # NPM package configuration
├── PROJECT_STRUCTURE.md         # This file
└── README.md                    # Project README
```

---

## Architecture Principles

| Principle | Description |
|---|---|
| **Domain-Driven Organization** | Pages grouped by feature domain (auth, doctor, emergency, etc.) |
| **Separation of Concerns** | Clear boundaries between pages, services, store, utils, and styles |
| **Barrel Exports** | `pages/index.js` provides a single import point for all page renderers |
| **Scalability** | Empty directories scaffolded for components, hooks, and backend |
| **Convention Over Configuration** | Consistent naming: kebab-case files, camelCase directories |

---

## Key Files

| File | Purpose |
|---|---|
| `frontend/main.js` | App bootstrap — imports CSS, registers routes, starts splash |
| `frontend/routes/router.js` | SPA router with `register()`, `navigate()`, `goBack()` |
| `frontend/store/store.js` | Global state — auth, theme, navigation history |
| `frontend/services/data.js` | Mock data (hospitals, doctors, appointments, vitals, triage engine) |
| `frontend/utils/utils.js` | Toast notifications, modals, date formatting, avatars |
| `frontend/styles/style.css` | Complete design system with CSS custom properties, dark mode, animations |
| `index.html` | HTML shell with Leaflet, Lucide, Chart.js CDN dependencies |

---

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```
