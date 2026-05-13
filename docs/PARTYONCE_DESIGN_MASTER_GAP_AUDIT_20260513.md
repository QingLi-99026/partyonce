# PartyOnce Design Master Gap Audit 2026-05-13

## 1. Audit Scope

Sources checked:

- Current repository: `frontend/vue-app/src`, `frontend/vue-app/public/party-assets`, `docs`
- Current branch: `eye-lite-v2-release-candidate-20260512`
- Historical stash: `stash@{0}` inventory only
- Historical commits: visual restore reports and recovered preview files
- LaCie archive references:
  - `PARTY_EVENTS_VISUAL_STRUCTURE_v1.0.md`
  - `PARTY_EVENTS_THEME_VISUAL_REDESIGN_v1.0.md`
  - `PARTY_EVENTS_VOICEPLAYER_TECH_v1.0.md`
  - `PARTY_EVENTS_VOICE_SCRIPTS_v1.0.md`
  - `PARTY_EVENTS_VENUE_LEADS_v1.0.md`
  - `PARTY_EVENTS_SUPPLY_CHAIN_EVALUATION_v1.0.md`

## 2. Already Implemented

- Homepage visual restoration exists through `HomePage.vue`.
- Formal public assets exist under `frontend/vue-app/public/party-assets`.
- Existing public assets include homepage hero, Castle / Space / Forest theme images, private dining layout, package matrix, app mockup, and quote preview.
- Old investor preview HTML files have been restored under `frontend/vue-app/public`.
- Admin Lead / Quote / Order, customer My Quotes / My Orders, supplier light loop, payment readiness, and notification dry-run routes exist.

## 3. Weakened Areas

- AI entry existed as a conventional form-style `AIPlanner`, not as a warm customer guide.
- Voice entry was mostly a button/placeholder; no dedicated intake flow existed.
- Three-theme package differences were not exposed as a coherent customer-facing matrix.
- Restaurant rendering existed as one private dining reference, not as Restaurant A original plus theme/tier variants.
- Admin queues were operationally useful but visually sparse for investor/customer trust.

## 4. Missing / Rebuilt In This Workpack

- AI / voice gap: rebuilt as local/staging `AIVoiceIntake.vue` with Web Speech API placeholder and click-based intake.
- Visual asset gap: expanded `visualAssets.js` into a registry for homepage, three themes, nine package visuals, Restaurant A variants, venues, and suppliers.
- Restaurant rendering gap: created Restaurant A original + nine theme/tier variant records using the current dining layout asset as the shared structure reference.
- Supplier / venue database gap: added local/staging visual seed records for venues and suppliers with category, service area, theme support, price range, and notes.
- Front/back experience gap: added visual context to Quote, My Quotes, My Orders, Admin Quotes, Admin Orders, and Admin Suppliers.

## 5. Most Valuable Recovery Items

1. AI voice-style intake, because it restores the customer onboarding story.
2. Three-theme nine-package visual model, because it makes the offer understandable.
3. Restaurant A visual context, because it lets customers understand the before/after decoration promise.

## 6. Boundaries

- No `.env.production` read or modification.
- No production deploy.
- No real Stripe/payment.
- No webhook/n8n trigger.
- No outbound email/SMS/WhatsApp.
- No `frontend/vue-app/dist` submission.
