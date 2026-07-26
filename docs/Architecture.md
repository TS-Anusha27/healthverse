# HealthVerse — System Architecture

## Overview

HealthVerse is a comprehensive healthcare ecosystem built as a **Single Page Application (SPA)** using vanilla JavaScript and Vite. It connects patients, doctors, hospitals, and emergency services through a unified mobile-first interface.

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Vanilla JavaScript (ES Modules) |
| **Bundler** | Vite 8.x |
| **Styling** | CSS Custom Properties + Design Tokens |
| **Maps** | Leaflet.js (OpenStreetMap) |
| **Charts** | Chart.js |
| **Icons** | Lucide Icons (CDN) |
| **Typography** | Plus Jakarta Sans + Inter (Google Fonts) |

## Application Architecture

```
┌─────────────────────────────────────────────┐
│                 index.html                  │
│          (CDN: Leaflet, Chart.js, Lucide)   │
└────────────────────┬────────────────────────┘
                     │
              ┌──────▼──────┐
              │   main.js   │  ← App entry point
              └──────┬──────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
   ┌────▼───┐  ┌─────▼────┐  ┌───▼────┐
   │ Router │  │  Store    │  │ Utils  │
   │        │  │ (state)   │  │(toast, │
   │navigate│  │auth,theme │  │ modal) │
   │register│  │history    │  │        │
   └────┬───┘  └──────────┘  └────────┘
        │
   ┌────▼────────────────────────────────┐
   │           Pages (20 modules)        │
   │  auth | patient | doctor | ambulance│
   │  appointments | telemedicine | sos  │
   │  records | ai | bloodDonation | ... │
   └────┬────────────────────────────────┘
        │
   ┌────▼──────┐
   │  data.js  │  ← Mock data & triage engine
   └───────────┘
```

## Routing

The app uses a custom client-side router (`routes/router.js`):
- `register(name, renderFn)` — Maps route name to a render function
- `navigate(page, params)` — Renders a page and manages history
- `goBack()` — Navigates to the previous page in history

## State Management

Global state is managed via a simple object store (`store/store.js`):
- **Auth State**: `currentUser`, `userType`, `isLoggedIn`
- **Theme**: Light/dark mode with localStorage persistence
- **Navigation**: History stack for back-navigation

## Design System

The CSS design system (`styles/style.css`) includes:
- **CSS Custom Properties** for colors, spacing, typography, shadows
- **Dark mode** via `[data-theme="dark"]` data attribute
- **Glassmorphism** effects with backdrop-filter
- **Component styles** for cards, buttons, forms, badges, avatars
- **Animations** including fade, slide, scale, pulse, heartbeat
- **Mobile-first** layout with 430px max-width frame
