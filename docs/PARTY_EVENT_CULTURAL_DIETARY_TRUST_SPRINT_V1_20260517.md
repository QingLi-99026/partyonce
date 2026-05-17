# Party Event Cultural / Dietary Trust Sprint V1

## 1. Goal

This sprint upgrades the Venue Finder and Quote flow for multicultural Australian families, especially families who need halal, no pork, no alcohol, vegetarian, eggless cake, allergy-aware, or private family-area planning.

The goal is not to connect real venue APIs or make any verified religious-food promise. The goal is to capture requirements earlier, filter local/staging venue candidates more responsibly, and make the manual review obligations clear to operations before a formal quote is sent.

## 2. Skill / Team Usage

- PM / product synthesis: converted virtual consumer findings into P0 trust requirements for Muslim, vegetarian, allergy-sensitive, and culturally specific families.
- Fixer / implementation: local code edits only in frontend data, Venue Finder, Quote form, customer fixture mapping, and Admin Quote display.
- Playwright / browser QA: Chromium browser automation checked Venue Finder, venue detail, Quote prefill, inquiry form, and Admin Quote fixture.
- Local static gates: JS syntax check, Vue SFC parse, i18n residue check, diff whitespace check, and Vite build.
- No Canva, GitHub, Slack, payment, webhook, n8n, production DB, or external business system was used.

## 3. Modified Files

- `frontend/vue-app/src/data/venueFinderFixtures.js`
- `frontend/vue-app/src/services/venueFinderService.js`
- `frontend/vue-app/src/views/VenueFinder.vue`
- `frontend/vue-app/src/views/QuotePage.vue`
- `frontend/vue-app/src/views/AdminQuoteDetail.vue`
- `frontend/vue-app/src/services/customerExperienceService.js`
- `frontend/vue-app/src/locales/en.json`
- `frontend/vue-app/src/locales/zh.json`
- `frontend/vue-app/src/locales/ko.json`
- `frontend/vue-app/src/locales/ar.json`
- `docs/PARTY_EVENT_CULTURAL_DIETARY_TRUST_SPRINT_V1_20260517.md`

## 4. What Changed

### Venue Finder

Added dietary and cultural planning filters:

- Halal-friendly planning
- No pork menu planning
- No alcohol family setting
- Vegetarian-friendly options
- Eggless cake possible
- Allergy-aware review
- Private / family area

Venue cards, comparison cards, and venue detail now show cultural fit tags and notes. These tags are deliberately phrased as planning filters and manual-review items, not final guarantees.

### Venue Fixture Data

Each local/staging venue now includes cultural-fit booleans and notes. Blank-canvas/function venues are marked as better candidates for halal/no pork/no alcohol planning because supplier choice can be controlled, while restaurant/bar-style venues remain unverified unless appropriate.

### Quote Flow

Quote inquiry form now includes a dedicated `Cultural / religious requirements` field. Venue Finder prefill carries selected cultural filters into Quote notes and manual review guidance.

The Quote page now displays:

- Food checks
- Allergy checks
- Cultural fit tags
- Cultural planning notes
- Manual verification checklist

### Admin Quote Detail

Admin Quote detail now displays captured cultural/religious requirements in the Family Requirements Review panel. The local fallback quote includes an example halal/no pork/no alcohol review note, so operations can see the intended workflow without backend dependency.

### Customer Fixture Mapping

Local inquiry-derived quotes now carry `cultural_requirements` in `customer_requirements`, so customer and admin local/staging flows preserve the field.

### Multilingual Trust Labels

Added basic translations for the new cultural/religious requirement field in:

- English
- Chinese
- Korean
- Arabic

## 5. Validation

### Static Checks

- `node --check` for touched JS files: passed.
- Vue SFC parse for `VenueFinder.vue`, `QuotePage.vue`, `AdminQuoteDetail.vue`: passed.
- `npm run check:i18n`: passed with `p0=0`, `p1=0`, `p2=0`.
- `git diff --check`: passed.

### Build

Command:

```bash
npm run build -- --outDir /tmp/partyonce_cultural_dietary_trust_build --emptyOutDir
```

Result: passed.

### Browser QA

Evidence path:

```text
/tmp/party_event_cultural_dietary_trust_sprint_v1_20260517/
```

Checked routes:

- `/venue-finder`
- `/venue-finder/research-marrickville-pavilion`
- `/quote?source=venue_finder&venue=research-marrickville-pavilion&area=Marrickville&adults=10&kids=20&budget=25_45&halal=1&noPork=1&noAlcohol=1&vegetarian=1&egglessCake=1&allergyAware=1&privateFamilyArea=1`
- `/admin/quotes/1` with local admin fixture

Results:

- HTTP status: 200 for tested routes.
- Console errors: 0.
- Page errors: 0.
- Broken images: 0.
- Venue Finder cultural filters visible: passed.
- Venue results show halal/no pork/no alcohol/vegetarian fit where appropriate: passed.
- Venue detail shows dietary/cultural notes: passed.
- Quote prefill shows cultural fit and cultural planning notes: passed.
- Quote inquiry form includes cultural/religious requirements field: passed.
- Admin Quote detail shows cultural/religious requirements with local admin fixture: passed.

Note: direct `/admin/quotes/1` without local admin fixture redirects by expected auth guard. This is expected and was not treated as a product bug.

## 6. Remaining Risks

- Halal/no pork/no alcohol suitability is still not verified real venue data. The UI now makes manual confirmation explicit.
- Real Muslim-family readiness requires real venue/caterer verification, menu review, and clear operations policy.
- Arabic/Korean full-page translation quality still needs periodic consumer review even though i18n residue is clean.
- This sprint does not add real supplier data, real restaurant API integration, payment changes, or outbound notifications.

## 7. Next Recommendations

1. Build a real venue/caterer verification checklist for halal, no pork, no alcohol, vegetarian, eggless, and allergy handling.
2. Add a public “Family needs we support” trust section on Venue Finder / Quote after copy review.
3. Import 3-5 real candidate venues with verified food/cultural policies.
4. Run a second virtual family panel with Muslim, vegetarian, allergy-sensitive, and multicultural families.
5. Only after real venue data exists, consider showing stronger trust badges. Until then, keep labels as “planning / needs confirmation.”

## 8. Safety

- `.env.production`: not read or modified.
- `frontend/vue-app/dist`: not written or staged.
- No production deploy.
- No payment / Stripe / PaymentIntent.
- No webhook / n8n.
- No email / SMS / WhatsApp.
- No production DB or migration.
- No external venue, map, or restaurant API.
