# Thrive Renovation Budget Calculator

A React + Vite budget calculator for extensions, loft conversions, and whole-house refurbishments, built for Thrive Property Education.

Live: https://thrivepropertyeducation.co.uk/calculator/ (served from the [thrivepropertyeducation](https://github.com/ronacon/thrivepropertyeducation) repo — see Deployment below)

## Stack

- Vite + React (JSX, no TypeScript)
- Tailwind CSS for utility classes; brand colours (`#263e3a`, `#d4af37`, `#4e7e73`, `#b9e4da`, `#faf7f0`) applied via inline styles
- `lucide-react` for icons
- Google Tag Manager (`GTM-PZRPPTD5`) + a custom `tool_first_interaction` dataLayer event on first calculator interaction

## Local development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build   # outputs to dist/
npm run preview # serve the production build locally
```

## Deployment

This app is no longer deployed standalone. After `npm run build`, copy the contents of `dist/` into the `calculator/` folder of the [thrivepropertyeducation](https://github.com/ronacon/thrivepropertyeducation) repo and commit there — it's served at `thrivepropertyeducation.co.uk/calculator/` alongside the rest of the marketing site.

The Vite `base` path in `vite.config.js` is set to `/calculator/` to match that URL.

`.github/workflows/deploy.yml` (standalone GitHub Pages deploy to `ronacon.github.io/thrive-budget-calculator/`) is kept for manual runs only (`workflow_dispatch`) and is not the canonical deployment anymore.

## Kajabi embed

The `#kajabi-embed-placeholder` section in `src/App.jsx` (top of `<main>`, above the calculator) is a clearly marked placeholder. Replace its contents with the Kajabi form embed script when available — it sits above the tool without gating access to it.

## Tracking

- GTM container snippet is in `index.html` (`<head>` + `<body>` noscript fallback).
- `tool_first_interaction` fires once per session, via `window.dataLayer.push(...)`, the first time any calculator input changes after initial page load. Wire a GA4 event tag to this trigger in GTM.
