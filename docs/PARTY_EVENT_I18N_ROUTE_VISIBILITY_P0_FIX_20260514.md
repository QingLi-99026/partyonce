# Party Event I18N Route Visibility P0 Fix 20260514

## P0 Issues

Owner review after commit `921cb628` found two blocking issues:

- The language switcher existed in code but was not clearly visible on the first viewport. The global nav had a long horizontal menu, so the compact selector could be visually squeezed near the login actions and did not show a clear language label.
- `/themes` reused the full homepage instead of a dedicated theme catalogue, and theme detail routes such as `/themes/castle-princess`, `/themes/space-explorer`, and `/themes/forest-adventure` did not exist. This made “Plan myself / 自己来策划” and theme browsing feel broken or blank to manual review.

## Fix Summary

- Made the NavHeader language control explicit with a visible `语言 / Language / 언어 / اللغة` label and current-language select.
- Adjusted NavHeader layout so the language selector stays visible to the left of login/register on desktop and mobile.
- Added a dedicated `/themes` catalogue page showing Castle Princess, Space Explorer, and Forest Adventure cards.
- Added theme detail routes:
  - `/themes/castle-princess`
  - `/themes/space-explorer`
  - `/themes/forest-adventure`
- Added fallback detail content for each theme:
  - theme name
  - theme introduction
  - Basic / Standard / Premium package cards
  - back-to-themes link
  - quote entry button
- Updated HomePage theme card click behavior to route to detail pages instead of only switching the homepage theme state.

## Files Changed

- `frontend/vue-app/src/components/LanguageSwitcher.vue`
- `frontend/vue-app/src/components/NavHeader.vue`
- `frontend/vue-app/src/router/index.js`
- `frontend/vue-app/src/views/HomePage.vue`
- `frontend/vue-app/src/views/Themes.vue`
- `frontend/vue-app/src/views/ThemeDetail.vue`
- `docs/PARTY_EVENT_I18N_ROUTE_VISIBILITY_P0_FIX_20260514.md`

## Validation

Evidence path:

```text
/tmp/party_event_i18n_route_visibility_p0_fix_20260514/
```

Evidence files:

- `browser_check_summary.json`
- `locale_visibility_result.json`
- `route_click_result.json`
- `console_errors.json`
- `page_errors.json`
- `broken_images.json`
- `contact-sheet.png`
- homepage screenshots for `zh`, `en`, `ko`, `ar`
- `/themes` screenshot
- three theme detail screenshots

## Chrome Results

Routes checked:

- `/`
- `/themes`
- `/themes/castle-princess`
- `/themes/space-explorer`
- `/themes/forest-adventure`
- `/ai-voice-intake`
- `/quote`

Result:

```text
Chrome passed: true
HTTP status: 200 for all checked routes
body non-blank: true
language selector visible: true
language label visible: true
zh/en/ko/ar switch: true
Arabic RTL: true
console errors: 0
page errors: 0
broken images: 0
home Plan myself click: passed
Castle / Space / Forest card clicks: passed
```

## Safari/WebKit Results

Routes checked:

- `/`
- `/themes`
- `/themes/castle-princess`
- `/themes/space-explorer`
- `/themes/forest-adventure`
- `/ai-voice-intake`
- `/quote`

Result:

```text
WebKit passed: true
HTTP status: 200 for all checked routes
body non-blank: true
language selector visible: true
language label visible: true
zh/en/ko/ar switch: true
Arabic RTL: true
console errors: 0
page errors: 0
broken images: 0
home Plan myself click: passed
Castle / Space / Forest card clicks: passed
```

## Remaining Blank Screen / Broken Image Risk

No blank screen was found in this validation set.

No broken image was found in this validation set.

## Preview Recommendation

Owner should review Preview again after this commit is pushed/redeployed, focusing on:

- visible language selector in the first viewport
- `/themes`
- `/themes/castle-princess`
- `/themes/space-explorer`
- `/themes/forest-adventure`
- homepage “自己来策划” click path

## External Systems

```text
Triggered external translation API: No
Triggered AI API: No
Triggered payment/Stripe/PaymentIntent: No
Triggered webhook/n8n: No
Triggered email/SMS/WhatsApp: No
Production deploy: No
Production database: No
Read or modified .env.production: No
Submitted dist: No
```
