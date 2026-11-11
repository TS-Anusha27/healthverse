# Changelog

All notable changes to HealthVerse are documented here.

## Hackathon updates (branch `hackathon-paypal-ai`)

- **PayPal Sandbox Backend (`api/paypal/*`, `api/_lib/paypal.js`, `api/_lib/http.js`)**
  - Added server-side PayPal OAuth2 client-credentials token caching, same-origin POST validation, `create-order` (`<= $500`, `"appointment"` / `"medicine"` reference types, `PayPal-Request-Id`), and `capture-order` endpoints.
- **PayPal Checkout Service & Patient Receipts UI (`T2`, `T3`, `T7`)**
  - Added `frontend/services/payments/paypalService.js` with dynamic PayPal JS SDK loading, INR-to-USD demo conversion (`VITE_INR_PER_USD`, default `85`), `hv_receipts` persistence, non-blocking Supabase `payments` sync, and printable receipt rendering.
  - Integrated optional PayPal consultation fee checkout and **"Pay later at clinic"** flow into `appointments.js`, optional PayPal checkout into medicine refill orders (`medicines.js`), plus dedicated `#payments` receipt history screen linked from `patient-home.js` and `settings.js`.
- **AI Serverless, Assistant & Multilingual Explainer (`T4`, `T5`, `T8`, `T9`, `T10`)**
  - Added provider-agnostic `api/_lib/llm.js` (Gemini + Anthropic), defensive JSON extraction, 20-second `AbortController` timeout, 700-token cap, transient 503 retry, and per-IP rate limiting.
  - Added `api/ai/triage-explain.js` and live non-diagnostic **Personalized Care Guidance** card (`#ai-triage-explain-card`) in `triage.js` with stale-request guards and graceful offline fallback.
  - Added `api/ai/assistant.js`, `#ai-assistant` chat UI (`ai-assistant.js`), quick action entry in `patient-home.js`, and human-in-the-loop **Booking Concierge** confirmation card that pre-fills `#appointments` specialty/date filters (`appointments.js`).
  - Added `api/ai/explain.js` and shared `"Explain in simple words"` modal (`frontend/services/ai/explainHelper.js`) supporting **English**, **Tamil**, and **Hindi** across `medicines.js` and `doctor-prescription.js`.
- **Hackathon Documentation & Compliance (`T6`)**
  - Added MIT `LICENSE`, updated `.env.example` with client/server placeholder keys, expanded `README.md` with architecture diagram, setup guide, and judge walkthrough, and added this `CHANGELOG.md`.

## Recent project history (since Oct 1, 2026)

- `6f65176` — `B10`: Replace UI icon emojis with consistent inline SVG icons
- `d2e78d3` — `B9`: Replace hardcoded light/dark colors with design tokens for dark mode contrast
- `3024d1e` — `B8`: Add ARIA attributes, modal focus trap/Escape handling, keyboard activation, contrast and 44px touch targets
- `0b48819` — `B7`: Add typing indicator before AI messages, progress bar and answer editing in triage
- `c8cc287` — Add pre-seeded easy demo users for all roles (`patient@demo.com`, `doctor@demo.com`, `driver@demo.com`) and **"Continue with Demo User"** login button
- `68c1941` — `B6`: Add inline validation, password toggle/strength meter, autocomplete attributes and button loading states
- `add0484` — `B5`: Replace Switch Profile button with avatar account menu on patient home
- `e1b6b16` — `B4`: Add responsive tablet and desktop sidebar layouts
- `137619a` — `B3`: Extract repeated inline styles into reusable CSS classes using design tokens
- `0457bbf` — `B2`: Add page transitions, staggered cards, press feedback, and count-up stats with reduced-motion support
- `80e60d4` — `B1`: Add reusable skeleton loading, empty, and error retry states
- `25374c6` — `A6`: Add `.env` and `.env.local` to `.gitignore`
- `f7e8335` — `A5`: Add PWA manifest (`public/manifest.json`) and pin CDN script versions
- `032552e` — `A4`: Remove technical Supabase wording from user-facing UI text
- `542e91b` — `A3`: Add `escapeHtml` helper and escape user-supplied and stored values in templates
- `a9fb617` — `A2`: Register `doctor-setup` and `ambulance-setup` routes and add verification banners
- `62912b5` — `A1`: Fix garbled UTF-8 text and broken character encoding across pages
- `87ec792` — Update project lead information in README
- `ecd6558` — Integrate Phase 1 authentication, identity, routing and light theme overhaul
- `1334a3c` — Complete Phase 1 authentication UI, user identity, routing, and design rework
- `7870195` — Unified 3-profile login, doctor and ambulance onboarding, and Firebase integration
- `d700db0` — Bypass auth and splash to enter application directly for trial and testing

