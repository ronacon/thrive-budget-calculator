# Thrive Renovation Budget Calculator

A React + Vite budget calculator for extensions, loft conversions, and whole-house refurbishments, built for Thrive Property Education. Deployed as a static site to GitHub Pages.

Live: https://ronacon.github.io/thrive-budget-calculator/

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

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the app and publishes `dist/` to GitHub Pages via GitHub Actions.

In the repo's **Settings → Pages**, set the source to **GitHub Actions** (one-time setup).

The Vite `base` path in `vite.config.js` is set to `/thrive-budget-calculator/` to match the GitHub Pages project URL. If this repo is ever renamed, or a custom domain is added, update `base` accordingly (`base: '/'` for a custom domain).

## Kajabi embed

The `#kajabi-embed-placeholder` section in `src/App.jsx` (top of `<main>`, above the calculator) is a clearly marked placeholder. Replace its contents with the Kajabi form embed script when available — it sits above the tool without gating access to it.

## Tracking

- GTM container snippet is in `index.html` (`<head>` + `<body>` noscript fallback).
- `tool_first_interaction` fires once per session, via `window.dataLayer.push(...)`, the first time any calculator input changes after initial page load. Wire a GA4 event tag to this trigger in GTM.
