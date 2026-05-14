# Party Event Owner Recheck Direct Fix 20260514

## Scope

This workpack only addressed the two direct Owner Preview Review Gate issues:

1. `/admin/quotes` triggered a remote staging API request failure on Vercel Preview (`net::ERR_ABORTED`).
2. `/my/quotes` and `/my/orders` could render as pure empty states when the preview had an admin/demo fixture instead of the customer fixture.

No new business module was added. No payment, Stripe, PaymentIntent, webhook, n8n, email, SMS, WhatsApp, production deploy, production database, or `.env.production` work was performed.

## Modified Files

- `frontend/vue-app/src/views/AdminQuotes.vue`
- `frontend/vue-app/src/services/customerExperienceService.js`
- `docs/PARTY_EVENT_OWNER_RECHECK_DIRECT_FIX_20260514.md`

## `/admin/quotes` API Failure Cause

The Vercel Preview guard in `AdminQuotes.vue` was intended to avoid remote API calls during static preview review, but the hostname regex was over-escaped:

```js
/vercel\\.app$/i
```

That pattern did not reliably match the Preview hostname, so the page still called:

```text
GET https://partyonce-staging-api.onrender.com/api/quotes?limit=100&offset=0
```

When the staging API request aborted or was unavailable, the owner saw a backend request failure even though the page itself should have been using preview-safe demo data.

## Fix

`AdminQuotes.vue` now:

- Uses the corrected Preview hostname guard:

```js
/vercel\.app$/i
```

- Keeps the local Vite static preview guard for `417x` ports.
- Shows a safe static preview demo quote instead of calling the remote staging API unless `VITE_ENABLE_REMOTE_QUOTE_API=true`.
- Displays a clear warning that the quote is static preview data and that no payment, webhook, n8n, or outbound action is triggered.

## Fallback Strategy

For Vercel Preview and local static preview:

- `/admin/quotes` does not call the remote quote API by default.
- It renders one safe demo quote row:
  - `PE-Q-0501`
  - Ava Thompson
  - Castle Princess Premium
  - Restaurant A
  - line items for venue, decor, supplier, labor, and service fee
- The row is marked through the page message as static preview data.

This does not hide the underlying production/staging API dependency. It keeps owner review clean while still documenting that real backend quote data requires the staging API to be explicitly enabled.

## Demo Quote / Order Data Source

Customer demo data comes from existing local/staging fixtures:

- `quote-local-501` in `customerExperienceService.js`
- `order-local-1001` in `adminOrders.js`

The identity guard was adjusted so an admin/manager preview fixture does not filter customer pages down to zero records. Admin-like fixtures now use `customer-local-41` for customer read-only preview views unless a specific `customer_fixture_id` is provided.

This is staging/demo sample data only and is not real customer data.

## Browser Evidence

Evidence directory:

```text
/tmp/party_event_owner_recheck_direct_fix_20260514/
```

Generated evidence:

- `browser_check_summary.json`
- `console_errors.json`
- `broken_images.json`
- `contact-sheet.png`
- page screenshots for each checked route

## Browser Check Results

| Route | HTTP | Console errors | Request failures | Broken images | Demo/context visible | Owner suitable |
|---|---:|---:|---:|---:|---|---|
| `/` | 200 | 0 | 0 | 0 | Yes | Yes |
| `/themes` | 200 | 0 | 0 | 0 | Yes | Yes |
| `/suppliers` | 200 | 0 | 0 | 0 | Yes | Yes |
| `/my/quotes` | 200 | 0 | 0 | 0 | Yes | Yes |
| `/my/orders` | 200 | 0 | 0 | 0 | Yes | Yes |
| `/my/quotes/quote-local-501` | 200 | 0 | 0 | 0 | Yes | Yes |
| `/my/orders/order-local-1001` | 200 | 0 | 0 | 0 | Yes | Yes |
| `/admin/quotes` | 200 | 0 | 0 | 0 | Yes | Yes |
| `/admin/orders` | 200 | 0 | 0 | 0 | Yes | Yes |
| `/payment/deposit` | 200 | 0 | 0 | 0 | Payment readiness only | Yes |
| `/admin/notifications/dry-run` | 200 | 0 | 0 | 0 | Dry-run only | Yes |

## Validation

- `git diff --check`: passed
- Vue SFC parse:
  - `AdminQuotes.vue`: passed
  - `MyQuotes.vue`: passed
  - `MyOrders.vue`: passed
- Frontend build:

```text
npm run build -- --outDir /tmp/party_event_owner_recheck_direct_fix_build --emptyOutDir
```

Result: passed. Build output was written to `/tmp`, not `frontend/vue-app/dist`.

## Pages Now Suitable For Owner Recheck

Owner can recheck:

- `/`
- `/themes`
- `/suppliers`
- `/my/quotes`
- `/my/orders`
- `/my/quotes/quote-local-501`
- `/my/orders/order-local-1001`
- `/admin/quotes`
- `/admin/orders`
- `/payment/deposit`
- `/admin/notifications/dry-run`

## Pages Still Not For Free Investor Clicking

The app remains a controlled staging/preview demo. Investor navigation should still be guided around:

- Real payment expectations
- Production backend expectations
- Any assumption that static preview demo rows are real customer records
- Any assumption that notification dry-run sends real messages

## External Systems

No external systems were triggered.

- Payment / Stripe / PaymentIntent: No
- Webhook / n8n: No
- Email / SMS / WhatsApp: No
- Production deploy: No
- Production database: No
- `.env.production` read or modified: No
- `frontend/vue-app/dist` submitted: No

## Recommendation

Yes, owner can reopen the Preview for a direct recheck after this commit is pushed and Vercel finishes redeploying the release-candidate branch. The next larger pass should remain a visual装修 pass, not another expansion of business scope.
