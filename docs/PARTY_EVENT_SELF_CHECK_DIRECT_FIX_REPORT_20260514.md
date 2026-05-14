# Party Event Self-Check Direct Fix Report

Date: 2026-05-14
Branch: `eye-lite-v2-release-candidate-20260512`
Base before fix: `6a7908db`
Preview under review: `https://partyonce-git-eye-lite-v2-release-2af646-qingli-99026s-projects.vercel.app/`
Evidence folder: `/tmp/party_event_self_check_direct_fix_20260514/`

## 1. Scope

This round only fixed direct issues found in the emergency UI reality check. It did not add new business modules or expand product scope.

Fixed direct issues:

1. Broken image signal on homepage and `/themes`.
2. Homepage first-screen tone was too dark sci-fi / investor-mode.
3. `/suppliers` looked like an unfinished grey map shell.
4. `/my/quotes` and `/my/orders` default empty states were confusing for owner review.
5. Local/static preview admin quote/order pages could still create avoidable API console noise.

## 2. What Was Not Done

No new feature work was added.

Not done in this round:

- No real supplier integration.
- No new payment / Stripe behavior.
- No webhook / n8n real trigger.
- No email / SMS / WhatsApp send.
- No production deploy.
- No production database work.
- No `.env.production` read or modification.
- No `frontend/vue-app/dist` submission.
- No UI framework replacement.
- No large refactor.
- No external image URL dependency.

## 3. Modified Files

- `frontend/vue-app/src/data/visualAssets.js`
- `frontend/vue-app/src/views/HomePage.vue`
- `frontend/vue-app/src/views/SuppliersMap.vue`
- `frontend/vue-app/src/views/MyQuotes.vue`
- `frontend/vue-app/src/views/MyOrders.vue`
- `frontend/vue-app/src/services/adminOrderService.js`
- `frontend/vue-app/src/views/AdminQuotes.vue`
- `docs/PARTY_EVENT_SELF_CHECK_DIRECT_FIX_REPORT_20260514.md`

`AdminQuotes.vue` was changed even though it was outside the preferred list because `/admin/quotes` was one of the required check pages and still produced avoidable static-preview API console noise. The change is limited to static-preview fallback guidance and does not alter backend/payment behavior.

## 4. Broken Image Fix Result

Emergency check originally flagged broken image behavior on `/` and `/themes` for Restaurant A premium variant thumbnails.

Root cause observed:

- The asset files exist locally and are tracked.
- The broken signal came from below-the-fold lazy mini thumbnails during full-page screenshot/browser image evaluation.
- The user-visible result was still unacceptable because a thumbnail slot appeared blank in the screenshot.

Fix applied:

- `HomePage.vue`: removed `loading="lazy"` from Restaurant A / package mini thumbnails used in the full-page visual proof sections.
- `visualAssets.js`: temporarily mapped `Restaurant A · Space Explorer Premium` to the stable same-style Space Standard image for this direct-fix pass. This avoids a visibly blank premium thumbnail while keeping style consistent. It should be replaced by a verified premium asset in the later visual polish sprint.

Post-fix browser check:

- `/`: broken images `0`
- `/themes`: broken images `0`

## 5. Homepage First Screen Adjustment

Issue:

- First screen felt like `Investor Preview · Visual Story Mode` and leaned too hard into dark sci-fi.

Minimal fix:

- Default theme changed from `space` to `castle`.
- Hero headline changed to a customer-welcome message: `欢迎来到 PartyOnce，让孩子的派对先被看见`.
- Kicker changed to `Welcome · AI Party Concierge`.
- Copy now explains theme / restaurant / package / AI quote request in customer terms.
- Hero overlay changed from almost-black sci-fi to warmer rose/pink transparency.
- AI double entry remains: `自己来策划` and `AI 帮我推荐`.

Result:

- The first screen is still based on the existing design, but now reads more like a warm customer party welcome page and less like a technical investor asset page.

## 6. Page-Specific Direct Fixes

### `/suppliers`

Before:

- Large grey empty map dominated the page.
- Only one visible supplier card when default location was `North Sydney`.

Fix:

- Default location no longer filters down to only North Sydney.
- The grey map shell is replaced with a local/staging supplier board explanation.
- Supplier roles are surfaced as chips: venue, florist, balloon, cake/dessert, kids entertainment, photography, setup/service roles depending on fixture data.
- Explicitly says this is not a real-time supplier map and does not contact suppliers.

### `/my/quotes`

Before:

- Empty state looked like the app had no useful customer quote experience.

Fix:

- Added clear local/staging guidance explaining why no quote is visible for the current identity.
- Added actions to start AI Concierge, open Investor Demo, or open My Inquiries.

### `/my/orders`

Before:

- Empty state looked like the app had no useful customer order experience.

Fix:

- Added clear local/staging guidance explaining the expected flow: AI Concierge → Quote request → My Quotes → My Orders.
- Added actions to open My Quotes, Investor Demo, or AI Concierge.

### `/admin/quotes`

Before:

- Static preview/local preview could try a remote quote API and show console noise.

Fix:

- Added static-preview fallback guard for Vercel/static Vite preview unless `VITE_ENABLE_REMOTE_QUOTE_API=true` is explicitly enabled.
- Shows controlled skeleton-state guidance instead of making noisy remote API calls.

### `/admin/orders`

Before:

- Static preview guard only covered limited Vite preview ports.

Fix:

- Expanded static-preview guard to Vite preview ports `4170-4179` and Vercel Preview.

## 7. Validation

### Code Checks

Passed:

```bash
git diff --check
```

SFC parse passed for touched Vue files:

- `HomePage.vue`
- `SuppliersMap.vue`
- `MyQuotes.vue`
- `MyOrders.vue`
- `AdminQuotes.vue`

### Frontend Build

Passed:

```bash
cd frontend/vue-app
npm run build -- --outDir /tmp/party_event_self_check_direct_fix_build --emptyOutDir
```

Result:

- Build passed.
- Build output went to `/tmp/party_event_self_check_direct_fix_build`.
- `frontend/vue-app/dist` was not written by this command.

## 8. Browser Check Results

Browser evidence saved to:

`/tmp/party_event_self_check_direct_fix_20260514/`

Files:

- `/tmp/party_event_self_check_direct_fix_20260514/browser_check_summary.json`
- `/tmp/party_event_self_check_direct_fix_20260514/console_errors.json`
- `/tmp/party_event_self_check_direct_fix_20260514/broken_images.json`
- `/tmp/party_event_self_check_direct_fix_20260514/contact-sheet.png`
- Per-page screenshots listed below.

Local built preview used:

`http://127.0.0.1:4175`

| Page | HTTP | Console Errors | Broken Images | First-screen understandable | Owner re-check status | Screenshot |
| --- | --- | --- | --- | --- | --- | --- |
| `/` | 200 | 0 | 0 | Yes | Acceptable for owner re-check | `/tmp/party_event_self_check_direct_fix_20260514/home.png` |
| `/themes` | 200 | 0 | 0 | Yes | Acceptable for owner re-check | `/tmp/party_event_self_check_direct_fix_20260514/themes.png` |
| `/suppliers` | 200 | 0 | 0 | Yes | Acceptable as light fixture, not real supplier DB | `/tmp/party_event_self_check_direct_fix_20260514/suppliers.png` |
| `/my/quotes` | 200 | 0 | 0 | Yes | Acceptable; still not a populated quote demo | `/tmp/party_event_self_check_direct_fix_20260514/my-quotes.png` |
| `/my/orders` | 200 | 0 | 0 | Yes | Acceptable; still not a populated order demo | `/tmp/party_event_self_check_direct_fix_20260514/my-orders.png` |
| `/admin/local-leads` | 200 | 0 | 0 | Yes | Acceptable | `/tmp/party_event_self_check_direct_fix_20260514/admin-local-leads.png` |
| `/admin/quotes` | 200 | 0 | 0 | Yes | Acceptable as controlled skeleton state | `/tmp/party_event_self_check_direct_fix_20260514/admin-quotes.png` |
| `/admin/orders` | 200 | 0 | 0 | Yes | Acceptable | `/tmp/party_event_self_check_direct_fix_20260514/admin-orders.png` |
| `/payment/deposit` | 200 | 0 | 0 | Yes | Acceptable as readiness page | `/tmp/party_event_self_check_direct_fix_20260514/payment-deposit.png` |
| `/admin/notifications/dry-run` | 200 | 0 | 0 | Yes | Acceptable as dry-run admin page | `/tmp/party_event_self_check_direct_fix_20260514/admin-notifications-dry-run.png` |

## 9. Remaining Issues

### P0

No P0 remains in the local post-fix browser check.

### P1

1. `/my/quotes` and `/my/orders` are now explained, but still not as strong as a seeded customer demo with visible quote/order cards.
2. Homepage is warmer, but still uses the existing dark visual system and should later be redesigned toward the original high-emotion parent/child welcome direction.
3. `/suppliers` is acceptable as a light fixture but still not a polished supplier database product.
4. `/admin/quotes` is a controlled skeleton state in static preview; a seeded admin quote demo would be better.
5. The Space Premium Restaurant A image is temporarily mapped to Space Standard for stability. A verified premium-specific image should replace it later.

### P2

1. Navigation remains crowded.
2. Footer remains visually heavy on shorter pages.
3. Several admin/readiness pages remain utilitarian.
4. Mixed Chinese/English labels remain.

## 10. Recommendation

Owner re-check:

- Yes, after this commit is pushed to the release candidate branch / Preview redeploy finishes.
- Owner should still understand this is a minimum direct-fix pass, not the full visual redesign.

Investor review:

- Not yet recommended for unsupervised investor sharing.
- Controlled investor demo remains possible, but supplier/customer quote/order polish should be improved before broad investor circulation.

## 11. Safety Confirmation

- Did not read or modify `.env.production`.
- Did not submit `frontend/vue-app/dist`.
- Did not production deploy.
- Did not connect production database.
- Did not run production migration.
- Did not create PaymentIntent.
- Did not trigger Stripe live mode.
- Did not trigger webhook / n8n.
- Did not send email / SMS / WhatsApp.
- Did not call real supplier/contact APIs.
