# Party Event Venue Finder Sprint 2

## Scope

Sprint 2 focused on four local/staging improvements:

1. Improve Venue Finder result-card visual quality.
2. Add a lightweight venue comparison interaction.
3. Add a higher-quality Restaurant A visual planning image.
4. Make the Quote page show a visual venue + package + theme prefill when entered from Venue Finder.

No real venue database, Google Maps, Places API, payment, Stripe, webhook, n8n, or outbound messaging was connected.

## Modified Files

- `frontend/vue-app/src/views/VenueFinder.vue`
- `frontend/vue-app/src/views/QuotePage.vue`
- `frontend/vue-app/public/party-assets/venues/restaurant-a/restaurant-a-showcase.png`
- `docs/PARTY_EVENT_VENUE_FINDER_SPRINT2_20260515.md`

## Venue Result Card Enhancement

The Venue Finder result cards now include:

- stronger image treatment with a demo badge
- theme preview thumbnails
- visible match-score progress bar
- package-fit and visual-fit summary blocks
- clearer "Compare" selected state

This keeps the page local/staging-only while making the results feel closer to a consumer venue shopping experience.

## Venue Compare

Added a compare panel that supports up to 3 shortlisted venues. It shows:

- distance from selected suburb
- capacity range
- price per person range
- package fit
- theme fit
- watch-outs / restrictions
- direct "Use for quote" CTA

The comparison is front-end only and does not persist to backend storage.

## Restaurant A Showcase Image

Added:

`frontend/vue-app/public/party-assets/venues/restaurant-a/restaurant-a-showcase.png`

The image combines Restaurant A original, Castle Standard, Space Standard, and Forest Standard into one visual planning board. It is intended for local/staging presentation and does not represent a final construction drawing.

## Quote Visual Prefill

When `/quote` is entered from Venue Finder, the page now shows a richer venue prefill card with:

- venue image
- venue name
- guest count
- theme
- package
- area
- budget range
- staging/demo safety copy

The Quote page can also reconstruct a safe Venue Finder prefill from the URL if localStorage/sessionStorage is missing.

## Verification

Build:

`npm run build -- --outDir /tmp/partyonce_venue_finder_sprint2_build --emptyOutDir`

Result: passed.

Browser smoke evidence:

`/tmp/partyonce_venue_finder_sprint2/`

Routes checked:

- `/`
- `/venue-finder`
- `/venue-finder/venue-marrickville-family-room`
- `/quote?source=venue_finder&venue=venue-marrickville-family-room&theme=castle&scene=restaurant-a&package=standard`

Flow checked:

- Venue Finder opens and is non-blank.
- Marrickville Family Dining Room appears in results.
- Compare panel opens.
- Venue detail opens with theme render thumbnails.
- Use this venue for quote navigates to Quote.
- Quote shows Venue Finder prefill, venue name, and 30 guests.

Browser results:

- Console errors: 0
- Page errors: 0
- Failed requests: 0
- Broken images: 0

## Safety

- `.env.production` was not read or modified.
- `frontend/vue-app/dist` was not written or staged.
- No payment, Stripe, PaymentIntent, webhook, n8n, email, SMS, WhatsApp, production deploy, production database, Google Maps, Places API, or real venue service was triggered.

## Remaining Notes

- Venue compare is intentionally front-end-only for Sprint 2.
- Restaurant A showcase is a static visual planning asset, not a formal design drawing.
- Future work can add richer comparison persistence, map-style proximity UI, and real owner-approved venue imagery.
