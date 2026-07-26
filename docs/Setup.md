# HealthVerse — Development Setup Guide

## Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x
- A modern browser (Chrome, Firefox, Edge, Safari)

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/your-org/healthverse.git
cd healthverse

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev

# 4. Open in browser
# Navigate to http://localhost:5173
```

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite development server with HMR |
| `npm run build` | Build optimized production bundle to `dist/` |
| `npm run preview` | Preview the production build locally |

## Project Structure

See [PROJECT_STRUCTURE.md](../PROJECT_STRUCTURE.md) for the complete directory layout.

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

See `.env.example` for all available variables.

## CDN Dependencies

The following libraries are loaded via CDN in `index.html`:
- **Leaflet 1.9.4** — Interactive maps
- **Lucide Icons** — SVG icon library
- **Chart.js** — Data visualization charts

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
