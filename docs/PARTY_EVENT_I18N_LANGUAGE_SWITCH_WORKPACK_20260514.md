# Party Event I18N Language Switch Workpack 20260514

## Scope

Implemented a local/staging-only frontend language switch foundation for PartyOnce. No external translation API, payment, webhook, n8n, production database, production deploy, or outbound messaging was used.

## Implemented Languages

- Chinese: `zh`
- English: `en`
- Korean: `ko`
- Arabic: `ar`

## Language Switch Entry Points

- Global navigation: `frontend/vue-app/src/components/NavHeader.vue`
- Investor homepage top navigation: `frontend/vue-app/src/views/HomePage.vue`

Both entry points use `frontend/vue-app/src/components/LanguageSwitcher.vue`.

## Persistence

The selected language is persisted with:

```text
localStorage key: partyonce_locale
```

Invalid saved locale values fall back to `zh`.

## RTL Handling

Arabic sets:

```text
document.documentElement.dir = rtl
#app dir = rtl
```

Chinese, English, and Korean use:

```text
dir = ltr
```

The root language attribute is also updated on `document.documentElement` and `#app`.

## Translated Surface Area

First-stage translated scope:

- HomePage investor hero and homepage navigation
- HomePage “Plan myself / AI recommends” entry buttons
- Castle / Space / Forest theme card names and descriptions
- Basic / Standard / Premium labels through locale keys
- Core NavHeader menu and auth/demo labels
- AI voice intake hero and primary entry actions
- Quote page title, summary flow, current selection labels, and price summary labels
- Common empty-state keys for future page expansion

## Not Yet Fully Translated

The following remain intentionally partial for the first i18n foundation pass:

- Full admin pages
- Full customer quote/order detail pages
- Supplier and venue detail long-form body copy
- Deep package explanation, line-item explanation, and generated recommendation copy from data/services
- Element Plus component locale switching beyond the existing Chinese Element Plus locale

## Validation

Evidence path:

```text
/tmp/party_event_i18n_language_switch_20260514/
```

Included files:

- `browser_check_summary.json`
- `locale_switch_result.json`
- `console_errors.json`
- `broken_images.json`
- `contact-sheet.png`
- `homepage-chrome-zh.png`
- `homepage-chrome-en.png`
- `homepage-chrome-ko.png`
- `homepage-chrome-ar.png`
- WebKit homepage screenshots for all four locales

## Chrome Results

Routes checked:

- `/`
- `/themes`
- `/ai-voice-intake`
- `/quote`

Result:

```text
Chrome passed: true
locale switching: passed
refresh persistence: passed
console errors: 0
broken images: 0
Arabic RTL: passed
non-blank pages: passed
```

## Safari/WebKit Results

Routes checked:

- `/`
- `/themes`
- `/ai-voice-intake`
- `/quote`

Result:

```text
WebKit passed: true
locale switching: passed
refresh persistence: passed
console errors: 0
broken images: 0
Arabic RTL: passed
non-blank pages: passed
```

## External Systems

```text
Triggered external translation API: No
Triggered OpenAI/Gemini/DeepSeek/Claude API: No
Triggered payment/Stripe/PaymentIntent: No
Triggered webhook/n8n: No
Triggered email/SMS/WhatsApp: No
Production deploy: No
Production database: No
Read or modified .env.production: No
Submitted dist: No
```

## Notes

This work establishes the i18n framework and the first visible user-facing translation pass. Future passes should translate the remaining customer/admin operational screens incrementally instead of mixing broad translation with unrelated feature work.
