# Party Event Real Venue Data + Before/After Sprint

Date: 2026-05-17  
Branch: `eye-lite-v2-release-candidate-20260512`  
Base HEAD: `f3d108af`  
Preview URL checked: `https://partyonce-git-eye-lite-v2-release-2af646-qingli-99026s-projects.vercel.app/`

## 1. Goal

Confirm the latest Vercel Preview owner path after the package/add-ons upgrade, then move the next product step forward: add a small set of public-research venue seeds and local high-quality before/after concept images so Venue Finder feels closer to a real Australian family planning product.

This sprint is still local/staging only. It does not connect to Google Maps, Places API, real booking systems, real restaurant inventory, payment, webhook, n8n, or outbound messaging.

## 2. Preview Owner Recheck

The current Preview was checked against the recommended owner route:

- `/`
- `/venue-finder`
- `/packages`
- `/quote?source=venue_finder&venue=venue-marrickville-family-room&adults=10&kids=20&budget=25-45&area=Marrickville`
- `/payment/deposit?source=quote-readiness`

Result:

- Preview appears updated to the package/add-ons upgrade content from `f3d108af`.
- Pages were HTTP 200 and nonblank.
- Console errors: `0`.
- Broken images: `0`.
- Customer-visible AI sales entry remained hidden.
- Payment copy remained readiness/test-preview wording, with no real payment action.

Evidence:

- `/tmp/party_event_preview_owner_recheck_after_f3d108af/preview_owner_recheck_summary.json`

## 3. Public Research Venue Seeds Added

Four public-research seeds were added to Venue Finder. These are not confirmed commercial listings and are explicitly marked as requiring owner/manual verification before any customer quote.

### Miniversal Marrickville

Source: `https://www.miniversal.com.au/`

Public-source facts used:

- Space-themed kids cafe/playcentre.
- Public page describes party/function spaces and a play area for children.
- Public page lists Marrickville address and party booking contact.

App treatment:

- Marked as `Public research seed`.
- Suitable for kids experience / space theme planning.
- Owner call required before quote.

### Harriet’s Private Dining Room

Source: `https://phmg.com.au/event-spaces/harriets-private-dining-room/`

Public-source facts used:

- Private dining room.
- Public page lists `18 seated` and `30-40 cocktail`.
- Public page lists Marrickville address and birthday/private event use cases.

App treatment:

- Marked as `Public research seed`.
- Treated as an older-kids / family dining candidate.
- Owner call required before quote.

### Marrickville Pavilion

Source: `https://www.innerwest.nsw.gov.au/ArticleDocuments/22227/Marrickville%20Pavilion%20Hire%20Guide%20without%20alarm%20code%20-2024.pdf.aspx`

Public-source facts used:

- Council hire guide lists Marrickville Pavilion details.
- Guide states the venue is a blank canvas and can be decorated, with restrictions.
- Guide lists 10 tables, 100 chairs, kitchen/catering fridge, AV facilities, parking/access constraints and pack-down responsibilities.

App treatment:

- Marked as `Public research seed`.
- Treated as a blank-canvas function/community venue.
- Strong manual operations checklist required before quote.

### Ice Zoo Mascot

Source: `https://icezoo.com/wp-content/uploads/2018/01/Party-Information-Booklet-Coward-Street-Mascot-2025.pdf`

Public-source facts used:

- Public party booklet describes birthday party options.
- Includes skating/session, party area, pizzas and party host details.
- Notes limits and need to contact the venue for larger parties.

App treatment:

- Marked as `Public research seed`.
- Treated as an active-party / Mascot candidate.
- Owner call required before quote.

## 4. Before/After Assets Added

Added local generated concept images under:

`frontend/vue-app/public/party-assets/venues/public-research-seeds/`

Files:

- `miniversal-marrickville-before.png`
- `miniversal-marrickville-after.png`
- `harriets-marrickville-before.png`
- `harriets-marrickville-after.png`
- `marrickville-pavilion-before.png`
- `marrickville-pavilion-after.png`
- `ice-zoo-mascot-before.png`
- `ice-zoo-mascot-after.png`

These are local concept visuals for planning and owner review, not official venue photos. They avoid remote runtime image dependencies and are safe to replace later with real approved photos.

## 5. App Integration

Updated:

- `frontend/vue-app/src/data/venueFinderFixtures.js`
- `frontend/vue-app/src/views/VenueFinder.vue`

Venue Finder now:

- Shows public research seed badges separately from demo fixtures.
- Shows source verification notes.
- Displays public source URL for owner verification.
- Shows before/after concept imagery on venue detail.
- Carries public research seed venue information into Quote prefill.

## 6. Validation

Build:

```text
npm run build -- --outDir /tmp/partyonce_real_venue_before_after_build --emptyOutDir
```

Result: passed.

Static checks:

- `venueFinderFixtures.js`: JS syntax passed.
- `VenueFinder.vue`: SFC parse passed.
- 8 generated PNG assets exist and are nonzero.

Browser smoke:

Base: `http://127.0.0.1:5197`

Routes:

- `/`
- `/venue-finder`
- `/venue-finder/research-miniversal-marrickville`
- `/venue-finder/research-harriets-private-dining-marrickville`
- `/venue-finder/research-marrickville-pavilion`
- `/venue-finder/research-ice-zoo-mascot`
- `/quote?source=venue_finder&venue=research-miniversal-marrickville&adults=10&kids=20&budget=25-45&area=Marrickville`

Result:

- HTTP 200: all checked routes.
- Nonblank: all checked routes.
- Console errors: `0`.
- Page errors: `0`.
- Failed requests: `0`.
- Broken images: `0`.
- Quote prefill for research Miniversal venue: visible.

Evidence:

- `/tmp/party_event_real_venue_before_after_sprint_20260517/browser_smoke_summary.json`
- `/tmp/party_event_real_venue_before_after_sprint_20260517/contact-sheet.png`

## 7. Safety

- `.env.production` not read or modified.
- `frontend/vue-app/dist` not generated or staged.
- No production deploy.
- No real payment / Stripe / PaymentIntent.
- No webhook / n8n trigger.
- No email / SMS / WhatsApp outbound.
- No Google Maps / Places API.
- No booking, scraping automation, or venue contact was triggered.

## 8. Remaining Boundaries

These are still not production-ready venue records. Each seed needs:

- Owner call / email confirmation.
- Capacity and event timing confirmation.
- Current food and allergy policy confirmation.
- Minimum spend / room hire confirmation.
- Decoration and bump-in/bump-out rules.
- Permission to use real venue imagery in the app.

## 9. Next Recommended Step

Recommended next sprint:

1. Owner verifies 4 seed venues manually.
2. Replace concept visuals with approved real before/after images where permission exists.
3. Add 3-5 more verified Inner West / Mascot / Burwood / Chatswood candidates.
4. Add a `Verified` status filter in Venue Finder.
5. Commit and push this sprint once owner approves the public-source wording and concept-image boundary.

