# Party Event Consumer Acceptance Fix Round 1

## Scope

Fixer round for owner-confirmed Safari QA P0/P1 issues only. No backend, payment, webhook, n8n, deploy, or external API work was performed.

## Fixes

### P0-3 `/3d-designer` blank body in Safari

- Root cause:
  - The navigation linked to `/3d-designer`, but the router only registered `/designer`.
  - The existing `Designer3D.vue` was a real Three.js editor draft behind auth, which could leave Safari showing only NavHeader/Footer or an empty body if the route missed, auth redirected, or the 3D canvas setup failed.
- Fix:
  - Added `/3d-designer` as an alias for the 3D design route.
  - Removed the login requirement for this entry because it is a consumer-facing core preview entry in the current acceptance sprint.
  - Replaced the unfinished editor with a safe visible placeholder page:
    - Title: `3D Party Design Preview`
    - Status: `Beta / Coming soon / 本地预览中`
    - Clear explanation that this is a visual planning preview, not a final construction drawing.
    - CTAs: return home, view themes, get quote.
    - Lightweight Restaurant A layout preview showing tables, main table, dessert table, photo zone, backdrop, balloon arch, and entrance flow.
- Scope control:
  - No PlayCanvas.
  - No real 3D editor.
  - No external API.
  - No backend, payment, webhook, n8n, deploy, or production work.

### P0-1 Homepage first viewport visual quality

- Removed the duplicate homepage fixed navigation layer and transparent fixed theme switcher from the homepage first viewport.
- Reworked the hero into a warm, readable Party Event introduction with a clear content panel, visible title, supporting copy, two primary actions, and a separate image card.
- Reduced dark overlay usage so the first view no longer reads as an empty/dim masked page.

### P0-2 Login/register overlap with planning button

- Removed the homepage-specific floating planning navigation that overlapped the global NavHeader.
- Kept the global login/register area independent in NavHeader.
- Added stronger NavHeader layout constraints so the logo, nav scroll area, language selector, local customer button, and login/register button do not visually merge.

### P1-1 Theme buttons lacked clear downstream handling

- Homepage theme cards continue to route directly to:
  - `/themes/space-explorer`
  - `/themes/castle-princess`
  - `/themes/forest-adventure`
- The removed floating theme switcher no longer creates a misleading click state that only changes local visuals.

### P1-2 Visible brand name

- Updated visible homepage, NavHeader, footer, localized hero titles, and document title suffix from PartyOnce to Party Event / 派对活动 where applicable.
- Historical internal service identifiers were not renamed.

### P1-3 Logo overlap

- Split NavHeader logo into a fixed icon mark and a separate wordmark.
- Added minimum width, nowrap, and flex shrink controls so the icon and wordmark do not overlap.

### P1-4 Footer color and layout

- Removed the duplicate homepage footer.
- Updated the shared AppFooter brand and contrast treatment so footer text is clearly readable and not polluted by homepage background styling.
- Follow-up footer/CTA pass: reduced the final CTA height, changed it into a lighter warm transition band, and changed AppFooter to one unified warm background with darker readable text so the bottom no longer appears split into mismatched dark/white layers.

## Validation

- Build command:
  `npm run build -- --outDir /tmp/partyonce_consumer_fix_round1_build --emptyOutDir`
- Result: passed after P0-3 validation.
- Output was written to `/tmp`, not `frontend/vue-app/dist`.
- Local HTTP check:
  - `http://127.0.0.1:5181/`: 200
  - `/3d-designer`: 200
  - `/themes`: 200
  - `/themes/castle-princess`: 200
  - `/themes/space-explorer`: 200
  - `/themes/forest-adventure`: 200
- WebKit check:
  - URL: `http://127.0.0.1:5181/3d-designer`
  - HTTP status: 200
  - Route component rendered: yes
  - Body visible: yes
  - Console errors: 0
  - Page errors: 0
  - Failed network requests: 0
  - Evidence:
    - `/tmp/partyonce_consumer_fix_round1_evidence_20260515/3d-designer-webkit.png`
    - `/tmp/partyonce_consumer_fix_round1_evidence_20260515/3d-designer-webkit-check.json`
- Note: port 5181 was already occupied by a local Vite server during validation; the requested routes were reachable on 5181.

## Safari Owner Re-check Checklist

Please re-check these routes in Safari:

- `/`
- `/themes`
- `/themes/castle-princess`
- `/themes/space-explorer`
- `/themes/forest-adventure`

Checklist:

- Homepage first viewport clearly shows Party Event / 派对活动.
- Hero title, copy, CTAs, and image are readable and not hidden by dark overlays.
- Global login/register is visible and separate from planning actions.
- Logo icon and wordmark do not overlap.
- Space / Castle / Forest theme cards navigate to their detail pages.
- Footer has clear contrast and normal spacing.

## Safety

- No production deploy.
- No payment / Stripe.
- No webhook / n8n.
- No external API.
- No Canva.
- No `.env.production` read or modification.
- No `dist` commit.
- No `git add`.
- No commit.
- No push.
- No LaCie backup.

## Recommendation

Enter QA Re-check after owner Safari review of the five listed routes.
