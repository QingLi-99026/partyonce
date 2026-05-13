# PartyOnce Investor Preview Visual Assets Restore Workpack

Date: 2026-05-13
Branch: eye-lite-v2-release-candidate-20260512

## 1. Problem

The Vercel Preview could open, but the homepage presentation looked closer to the functional app version than the investor visual showcase. Early Castle Princess, Space Explorer, Forest Adventure, private dining, package matrix, materials, and app-display preview assets were no longer visible from the main investor flow.

## 2. Visual Assets Found

Historical Git object/commit inspection found self-contained investor preview HTML/CSS/SVG assets in commit `7006541b`:

- `frontend/vue-app/public/castle-visual-enhanced.html`
- `frontend/vue-app/public/preview-castle-full.html`
- `frontend/vue-app/public/preview-forest-full.html`
- `frontend/vue-app/public/preview-forest-layout-v2.html`
- `frontend/vue-app/public/preview-forest-with-switcher.html`
- `frontend/vue-app/public/preview-home-v2.html`
- `frontend/vue-app/public/preview-home-v8.html`
- `frontend/vue-app/public/preview-home.html`
- `frontend/vue-app/public/preview-worlds-v3.html`
- `frontend/vue-app/public/theme-castle-world.html`
- `frontend/vue-app/public/theme-forest-world.html`
- `frontend/vue-app/public/theme-star-world.html`
- `frontend/vue-app/public/theme-switcher-working.html`

No real image binary assets were found in the tracked app source outside forbidden evidence/dist/node_modules locations. The recovered visual assets are standalone HTML/CSS/SVG preview files.

## 3. Restore Source

Restored from historical commit:

- `7006541b31a5c0fa06c515bddea4566a09d67434`

No stash was applied or popped. Only whitelisted files were checked out individually.

## 4. Restored / Added Files

- Restored public investor preview/theme HTML files listed above.
- Added `frontend/vue-app/src/data/visualAssets.js`.
- Updated `frontend/vue-app/src/views/HomePage.vue` to show an investor visual assets panel with links to the restored preview assets.

## 5. Homepage Visual Result

`/` remains the immersive investor homepage. It now displays:

- Castle Princess / Dream Castle visual entry
- Space Explorer visual entry
- Forest Adventure visual entry
- theme switcher
- scene showcase
- package showcase
- restored investor preview asset links

Fallback visual cards are rendered from theme colors and icons, so the page does not go blank if no binary image is available.

## 6. Castle / Space / Forest Result

- Castle Princess: restored via `preview-castle-full.html` and `theme-castle-world.html`.
- Space Explorer: restored via `theme-star-world.html`.
- Forest Adventure: restored via `preview-forest-full.html` and `theme-forest-world.html`.

## 7. Dining / Package Matrix / Mockup Result

- Private dining / restaurant layout: restored via `preview-forest-layout-v2.html`.
- Package matrix: restored via `preview-home-v8.html`.
- Materials and app display mockup reference: restored via `preview-home-v2.html`.

## 8. Local Build Result

Command:

```bash
cd frontend/vue-app
npm run build -- --outDir /tmp/partyonce_visual_restore_build --emptyOutDir
```

Result: passed.

Build output was written to `/tmp/partyonce_visual_restore_build`; `frontend/vue-app/dist` was not written.

## 9. Preview Route Smoke Result

Local Vite smoke tested:

- `/`: status 200, non-blank, investor visual assets visible, console errors 0.
- `/local-demo`: status 200, non-blank, console errors 0.
- `/themes`: status 200, non-blank, Castle / Forest / Space visible, console errors 0.
- `/quote`: status 200, non-blank, package/quote content visible, console errors 0.

Restored public preview assets also returned HTTP 200 locally:

- `/preview-castle-full.html`
- `/preview-forest-full.html`
- `/preview-forest-layout-v2.html`
- `/theme-castle-world.html`
- `/theme-forest-world.html`
- `/theme-star-world.html`
- `/preview-worlds-v3.html`
- `/preview-home-v8.html`
- `/preview-home-v2.html`

## 10. Vercel Preview URL

Branch Preview URL:

`https://partyonce-git-eye-lite-v2-release-2af646-qingli-99026s-projects.vercel.app/`

Preview redeploy verification should confirm the same investor visual panel appears on `/` after this commit is pushed.

## 11. .env.production

`.env.production` was not read or modified.

## 12. dist

`frontend/vue-app/dist` was not committed.

## 13. Production Deploy

No production deploy was performed. Production remains No-Go.

## 14. Blockers

No code/build blocker remains. The only limitation is that no real source image binaries were found outside forbidden evidence/dist/node_modules paths, so the restored assets are the historical self-contained visual HTML/CSS/SVG preview files plus homepage fallback visual cards.

## 15. Next Steps

1. Push this release-candidate commit.
2. Let Vercel Preview redeploy the branch.
3. Confirm `/` shows the investor visual assets panel.
4. Confirm the restored preview links open from Preview.
5. Keep production No-Go until owner explicitly approves a separate production gate.
