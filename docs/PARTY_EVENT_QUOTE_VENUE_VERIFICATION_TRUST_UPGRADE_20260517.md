# Party Event Quote Venue Verification Trust Upgrade

Date: 2026-05-17  
Branch: `eye-lite-v2-release-candidate-20260512`

## Goal

Continue the product trust upgrade after real venue seed integration by making Venue Finder → Quote carry a clearer venue verification checklist. This helps parents understand that public-research venues are planning candidates, not instant booking guarantees.

## Changes

Updated:

- `frontend/vue-app/src/services/venueFinderService.js`
- `frontend/vue-app/src/views/QuotePage.vue`

Venue Finder quote prefill now carries:

- venue verification status
- whether manual review is required
- whether the venue is a public research seed
- public source label and URL
- food option notes
- allergy notes
- room hire / minimum spend hints
- venue restrictions
- a five-point manual verification checklist

Quote page now shows a venue verification panel for Venue Finder prefills:

- public research seed / owner call required state
- food/allergy/manual minimum spend boundary
- venue verification checklist
- source URL for owner verification

## Customer Trust Impact

This reduces the risk that parents think the app has made a live venue booking. The page now explains that the venue can be used for planning, but availability, rules, food/allergy handling, supplier access and minimum spend must be confirmed before a formal quote.

## Validation

Checks run:

- `node --check frontend/vue-app/src/services/venueFinderService.js`
- Vue SFC parse for `QuotePage.vue`
- `npm run check:i18n`
- `npm run build -- --outDir /tmp/partyonce_quote_venue_verification_build --emptyOutDir`
- Local browser smoke for:
  - `/quote?source=venue_finder&venue=research-miniversal-marrickville&adults=10&kids=20&budget=25-45&area=Marrickville`

Results:

- i18n: P0 = 0, P1 = 0, P2 = 0
- Build: passed
- Browser route status: 200
- Console errors: 0
- Page errors: 0
- Failed requests: 0
- Broken images: 0
- Owner call / manual verification content: visible
- Checklist: visible
- Public source link: visible
- No real booking/payment boundary: visible

Evidence:

- `/tmp/party_event_quote_venue_verification_20260517/quote_venue_verification_summary.json`
- `/tmp/party_event_quote_venue_verification_20260517/quote_venue_verification.png`

## Safety

- No `.env.production` read or modified.
- No `frontend/vue-app/dist` submitted.
- No production deploy.
- No real payment / Stripe / PaymentIntent.
- No webhook / n8n trigger.
- No email / SMS / WhatsApp outbound.
- No Google Maps / Places API.
- No real venue booking or venue contact triggered.

## Remaining Work

- Owner should manually verify the public research venues.
- Replace generated concept visuals with approved real venue photos where permission exists.
- Add verified venue status once venue owners confirm capacity, food, allergy, minimum spend and decoration rules.
