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

### P1-5 English-mode Chinese residual text

- Localized AppFooter service/about/help/copyright text so English mode no longer shows Chinese footer copy.
- Localized the `/3d-designer` preview page hero, safety note, CTA buttons, scene labels, and status cards.
- Added English-mode localized homepage scene/package sections in `HomePage.vue` so the embedded Chinese-only scene/package components are not shown to English users.
- Chinese mode keeps the original Chinese scene/package components and Chinese footer copy.

### P1-6 English-mode Chinese baked into image assets

- Root cause:
  - Several investor-preview images contain text baked into the image pixels, including theme names, package/quote labels, Restaurant A labels, and supplier/decor notes.
  - Locale JSON cannot translate text that is part of the image itself.
- Fix:
  - English mode hides homepage theme-card images that contain Chinese labels and replaces them with clean icon/title placeholders.
  - English mode hides the investor visual asset image grid and replaces it with English-only theme explanation cards.
  - English mode hides the package matrix and Restaurant A rendering sample images and replaces them with English-only package/layout cards.
  - Chinese mode continues to show the original visual assets.
- Scope control:
  - No new image production.
  - No Canva.
  - No external images.
  - No business logic changes.

### P1-7 English-mode remaining hero image Chinese

- Root cause:
  - The homepage right-side preview mockup image still contained baked-in Chinese labels.
  - The homepage still rendered the old immersive theme hero in English mode, exposing Castle/Princess Chinese hero text and CTAs.
  - Theme detail pages still rendered theme artwork that may contain Chinese labels.
- Fix:
  - English mode replaces the homepage mockup image with an English-only planning placeholder card.
  - English mode does not render the old `ImmersiveHero`; it renders an English-only theme summary and CTAs instead.
  - English mode replaces theme detail hero images with English-only placeholders.
  - Chinese mode keeps the original images and immersive hero.
  - Source scan for owner-confirmed strings (`星际探险`, `梦幻城堡`, `走进童话`, `进入梦幻城堡`, `探索更多主题`, `听一听`) in the English-mode touched files returned no matches.
- Scope control:
  - No new image production.
  - No Canva.
  - No external images.
  - No backend, AI Concierge, 3D, payment, deploy, or external API work.

### P1-8 English-mode Chinese residuals on `/venues`, `/ai-voice-intake`, and `/3d-preview`

- `/venues` fix:
  - Localized page title, subtitle, search, filters, city/type/capacity/amenity labels, sort labels, empty state, partner badge, price unit, and detail button.
  - English mode maps Chinese mock venue names, cities, venue types, addresses, descriptions, and recommendation basis into English display helpers.
  - English mode hides venue images and shows clean venue placeholder cards because some visual venue assets may contain baked-in Chinese text.
- `/ai-voice-intake` fix:
  - Added English display mapping for the existing intake step labels, prompts, helpers, placeholders, and choice options without changing the recommendation logic.
  - English mode hides visual cue package images and Restaurant A rendering images, replacing them with clean English placeholder cards.
  - Localized visible control labels and recommendation section headings.
- `/3d-preview` fix:
  - Localized the page disclaimer and read-only boundary copy.
  - The direct 3D preview component now hides the Chinese construction-warning sentence in English mode while keeping it for non-English modes.
- Scope control:
  - No backend changes.
  - No new AI Concierge functionality.
  - No PlayCanvas / new 3D functionality.
  - No Canva, external images, external API, payment, deploy, or production work.

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
- i18n follow-up validation:
  - Locale JSON parse check: passed.
  - English visible-text scan across the touched view/footer files leaves only the language option label `中文` and non-rendered comments.
  - Build after i18n fix: passed.
  - `http://127.0.0.1:5181/`: 200 after restarting local Vite.
- Image baked-in text follow-up:
  - English mode no longer renders the homepage theme card image files, investor visual asset image grid, package matrix images, or Restaurant A rendering sample images.
  - Chinese mode keeps the original image asset sections.
  - Build after baked-in image text fix: passed.
  - Build after remaining hero image Chinese fix: passed.
  - Build after `/venues`, `/ai-voice-intake`, and `/3d-preview` English residual fix: passed.
  - English-mode source scan of the touched page/component files still finds Chinese inside local mock data and Chinese locale data only; those strings are display-mapped to English or hidden from English mode.

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
