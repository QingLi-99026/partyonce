# Party Event Trust & Conversion Sprint V1

Date: 2026-05-18

## Scope

Virtual team execution for the next consumer trust and conversion sprint. This work stayed inside the Party Event frontend and docs. It did not touch backend code, production configuration, live payment, webhook/n8n, messaging, deployment, or real supplier photo ingestion.

## Virtual Team Roles

- PM / Scheduler: converted the owner feedback into a scoped trust-conversion workpack.
- PM / Scheduler: kept Phase 1 limited to trust, package clarity, payment safety, and share reward clarity.
- i18n Developer: added trust-conversion translation namespaces for Chinese, English, Korean, and Arabic.
- Fixer: repaired theme detail, package guide, quote, payment readiness, and share reward copy so the Chinese path no longer exposes raw keys or obvious English package/payment/reward labels.
- QA / Release Gate: verified JSON parsing, frontend build, and browser route rendering for the critical Chinese-mode routes.

## Changed Files

- `frontend/vue-app/src/locales/zh.json`
- `frontend/vue-app/src/locales/en.json`
- `frontend/vue-app/src/locales/ko.json`
- `frontend/vue-app/src/locales/ar.json`
- `frontend/vue-app/src/views/ThemeDetail.vue`
- `frontend/vue-app/src/views/PackageGuide.vue`
- `frontend/vue-app/src/views/QuotePage.vue`
- `frontend/vue-app/src/views/PaymentDeposit.vue`
- `frontend/vue-app/src/views/MyRewards.vue`
- `docs/PARTY_EVENT_TRUST_CONVERSION_SPRINT_V1_20260517.md`

## Implementation Summary

- Added `trustConversionV1` i18n namespaces across `zh`, `en`, `ko`, and `ar` for package comparison, quote review timeline, payment safety, share reward rules, age/guest labels, and venue verification.
- Updated `ThemeDetail.vue` to keep the full package description visible, add age/guest fit, price range, upgrade value, and quote CTA for each tier.
- Added defensive localization fallback in `ThemeDetail.vue` so raw keys such as `tiers.heading` or `tiers.basicDescription` are not exposed to customers if a translation key fails to load.
- Localized the staging family-choice samples on `/packages` for Chinese users.
- Localized the package explanation labels on `/quote` so Chinese mode replaces `Basic`, `Standard`, and `Premium` with `基础套餐`, `标准套餐`, and `高级套餐` where they appear in customer-visible explanatory copy.
- Localized `/payment/deposit` trust, payment safety, quote-to-deposit timeline, and blocker boundary copy for Chinese, English, Korean, and Arabic.
- Localized `/share` / `MyRewards` core customer reward flow, proof submission labels, fixed reward options, rules, table headers, and voucher placeholders for Chinese, English, Korean, and Arabic.
- Kept package comparison content sourced from existing locale keys instead of introducing a separate English-only data module, so the Chinese/Korean/Arabic UI does not regress.

## Owner-Reported Issue Addressed

Owner observed that Chinese mode showed raw keys and English package names in the lower package tier cards:

- `tiers.heading`
- `tiers.basicDescription`
- `Basic`
- `Standard`
- `Premium`

Fix result:

- Chinese mode now shows `基础 / 标准 / 高级`.
- Package cards show `基础套餐`, `标准套餐`, `高级套餐`.
- Descriptions are preserved rather than removed.
- Cards include age/guest fit, price range, upgrade value, and quote entry.
- Browser check confirmed no raw `tiers.*` keys and no English `Basic/Standard/Premium` names on `/themes/castle-princess` in Chinese mode.
- Browser smoke also checked `/packages`, `/quote`, `/payment/deposit`, and `/share` in Chinese mode for raw i18n keys, obvious English package/payment/reward labels, broken images, console errors, and page errors.

## Safety Boundaries

- No real payment or Stripe action.
- No webhook/n8n workflow.
- No email, SMS, WhatsApp, WeChat, or outbound message.
- No production deploy.
- No `.env.production` read or modification.
- No real supplier photo copied into the repo.
- Real venue photos and supplier claims remain owner-approval gated.
- A separate package-comparison data module was not kept in this commit candidate because the first draft was English-only and would be unsafe for multilingual UI until fully localized.

## Verification

- Locale JSON parse for `zh/en/ko/ar`: passed.
- `npm run build -- --outDir /tmp/partyonce_virtual_team_phase1_build --emptyOutDir`: passed.
- Local browser check on `http://127.0.0.1:5185/themes/castle-princess` in Chinese mode:
  - raw `tiers.heading`: false
  - raw `tiers.*Description`: false
  - Chinese heading visible: true
  - Chinese descriptions visible: true
  - English `Basic/Standard/Premium` tier names visible: false
  - broken images: none
  - console errors: none
  - screenshot: `/tmp/partyonce_theme_detail_zh_check.png`
- Local browser smoke on Chinese mode:
  - `/themes/castle-princess`: nonblank, no raw keys, no checked English leakage, no broken images, no console/page errors
  - `/packages`: nonblank, no raw keys, no checked English leakage, no broken images, no console/page errors
  - `/quote`: nonblank, no raw keys, no checked English leakage, no broken images, no console/page errors
  - `/payment/deposit`: nonblank, no raw keys, no checked English leakage, no broken images, no console/page errors
  - `/share`: nonblank, no raw keys, no checked English leakage, no broken images, no console/page errors

## Remaining Gated Work

- Replace concept images with real venue photos only after owner confirms usage permission or supplier authorization.
- Real venue database expansion should continue as a curated ingestion workflow, not by copying random web photos into the app.
- Share reward production redemption remains disabled until owner approves final rules, anti-abuse policy, and payment/accounting handling.
- Wider virtual user QA should be upgraded to require node-by-node checks, including language, route, CTA, downstream context, visual clarity, and "did the page reduce content instead of fixing it" checks.
