# PartyOnce Investor Visual Homepage Restoration V2

Date: 2026-05-13
Branch: eye-lite-v2-release-candidate-20260512

## Goal

Restore the investor-facing homepage as a visual showcase, not only a functional app screen. The homepage now directly references real image assets committed under `frontend/vue-app/public/party-assets/`.

## Formal Public Assets Added

- `frontend/vue-app/public/party-assets/investor-hero/immersive-homepage-hero.png`
- `frontend/vue-app/public/party-assets/themes/space-explorer.png`
- `frontend/vue-app/public/party-assets/themes/castle-princess-full.png`
- `frontend/vue-app/public/party-assets/themes/forest-adventure-full.png`
- `frontend/vue-app/public/party-assets/dining-layouts/private-dining-room-layout.png`
- `frontend/vue-app/public/party-assets/packages/package-tier-matrix.png`
- `frontend/vue-app/public/party-assets/app-mockups/app-display-mockup.png`
- `frontend/vue-app/public/party-assets/quotes/quote-entry-preview.png`

The images were copied from existing local visual evidence files into formal public asset paths. The source evidence paths were not staged or committed.

## Homepage Changes

- Added a top immersive image hero using `/party-assets/investor-hero/immersive-homepage-hero.png`.
- Added two investor entry buttons:
  - `自己来策划` -> `/themes`
  - `AI 帮我推荐` -> `/ai-planner`
- Theme cards now directly render real image assets:
  - Space Explorer
  - Castle Princess
  - Forest Adventure
- Investor visual asset cards now render real images instead of CSS-only placeholders.
- Added formal visual entries for private dining, package matrix, app mockup, and quote entry.

## Build

Command:

```bash
cd frontend/vue-app
npm run build -- --outDir /tmp/partyonce_visual_homepage_v2_build --emptyOutDir
```

Result: passed. No `frontend/vue-app/dist` output was written.

## Local Smoke

Routes checked:

- `/`: status 200, non-blank, hero present, theme cards present, dining/package/quote entries present, broken images 0, console errors 0.
- `/themes`: status 200, non-blank, visual assets present, broken images 0, console errors 0.
- `/quote`: status 200, non-blank, quote/package content present, broken images 0, console errors 0.
- `/local-demo`: status 200, non-blank, console errors 0.

Direct asset URLs checked:

- `/party-assets/investor-hero/immersive-homepage-hero.png`
- `/party-assets/themes/space-explorer.png`
- `/party-assets/themes/castle-princess-full.png`
- `/party-assets/themes/forest-adventure-full.png`
- `/party-assets/dining-layouts/private-dining-room-layout.png`
- `/party-assets/packages/package-tier-matrix.png`
- `/party-assets/app-mockups/app-display-mockup.png`
- `/party-assets/quotes/quote-entry-preview.png`

All returned HTTP 200 locally.

## Safety

- `.env.production` was not read or modified.
- `frontend/vue-app/dist` was not committed.
- `node_modules` was not committed.
- Evidence/test evidence paths were not committed.
- No production deploy was performed.
- No payment, Stripe, webhook, n8n, email, SMS, or WhatsApp action was triggered.

## Preview

Preview should be verified after pushing the release candidate branch:

`https://partyonce-git-eye-lite-v2-release-2af646-qingli-99026s-projects.vercel.app/`

Production remains No-Go.
