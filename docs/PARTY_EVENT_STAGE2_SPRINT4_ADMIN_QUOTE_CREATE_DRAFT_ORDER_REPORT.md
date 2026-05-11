# Party Event / 派对活动 Stage 2 Sprint 4 Report

## Scope

Sprint 4 adds the local-only Admin Quote Detail action for creating a draft Order from an accepted Quote.

This sprint does not implement Order payment, Quote-to-Order production automation, webhook/n8n, outbound messaging, production deployment, or any real payment flow.

## Modified Files

```text
frontend/vue-app/src/views/AdminQuoteDetail.vue
frontend/vue-app/src/services/adminOrderService.js
```

## New Files

```text
docs/PARTY_EVENT_STAGE2_SPRINT4_ADMIN_QUOTE_CREATE_DRAFT_ORDER_REPORT.md
```

## Implemented Behavior

- `AdminQuoteDetail.vue` now shows a `Create Draft Order` action.
- The action is enabled only when the Quote status is `accepted`.
- The status dropdown still excludes `converted_to_order`.
- The action calls the local/staging Order API skeleton through `POST /api/orders`.
- On successful Order creation, the page navigates to `/admin/orders/:orderId`.
- Payment, Stripe, webhook/n8n, and outbound-message boundaries remain visible in the UI copy.
- If the backend local Order API is unavailable or rejects the request, the page shows a warning instead of pretending a production Order was created.

## API Behavior

The new frontend service helper is:

```text
createDraftOrderFromQuote(quote)
```

It sends:

```text
POST /api/orders
```

Payload fields:

```text
quote_id
event_date
event_location
internal_notes
```

The helper intentionally does not:

```text
create payment
trigger Stripe
trigger webhook/n8n
send email/SMS/WhatsApp/WeChat/WeCom
create fallback success when backend creation fails
```

## Local Fallback / Error Behavior

The create action is intentionally stricter than the read-only Order Queue fallback:

- Read views can fall back to local/mock data.
- Draft Order creation requires the safe local backend Order API skeleton to respond.
- If the API call fails, the UI shows a warning and keeps the operator on the Quote detail page.
- If the backend reports an existing Order or converted state, the UI sends the operator to `/admin/orders` for review.

This avoids accidentally treating a mock-only fallback as a real draft Order creation.

## Browser / Route Acceptance

Checked route:

```text
/admin/quotes/quote-accepted-sprint4
```

Observed result:

- The route returned HTTP 200 from the local Vite dev server.
- Final route check used `http://127.0.0.1:3002/admin/quotes/quote-accepted-sprint4` and returned HTTP 200.
- The Admin Quote Detail page rendered for an accepted Quote through browser route mocking.
- `Create Draft Order` was visible and enabled for the accepted Quote.
- The page showed local/staging safety copy blocking payment, Stripe, webhook/n8n, and outbound messages.

Evidence:

```text
.playwright-cli/page-2026-05-11T08-55-21-176Z.yml
```

Note: `.playwright-cli` is evidence only and must not be staged.

The final automated click-and-snapshot step was blocked because the local Playwright CLI attempted to resolve `@playwright/cli` from the network and the environment has restricted network access. The code path and rendered action were verified, but the browser click-through is recorded as partial acceptance rather than full pass.

## Static Checks

Passed:

```text
node --check frontend/vue-app/src/services/adminOrderService.js
Vue SFC parse: frontend/vue-app/src/views/AdminQuoteDetail.vue
git diff --check -- frontend/vue-app/src/views/AdminQuoteDetail.vue frontend/vue-app/src/services/adminOrderService.js
```

Safety scan:

```text
No new PaymentIntent, Stripe execution, webhook/n8n execution, outbound messaging execution, dist handling, or .env.production handling was added.
```

## Blockers

- Full browser click-through acceptance could not be completed because the Playwright CLI tried to fetch a package over the network.
- No production backend, payment, webhook, notification, or deployment path was touched.

## Risk Notes

- The action depends on the safe local/staging Order API skeleton.
- It should not be promoted to production behavior until auth, persistence, Order lifecycle, and payment boundaries are reviewed separately.
- The UI intentionally does not allow `converted_to_order` status changes from Quote Detail.

## Suggested Whitelist Staging

If Sprint 4 is accepted, whitelist only:

```text
frontend/vue-app/src/views/AdminQuoteDetail.vue
frontend/vue-app/src/services/adminOrderService.js
docs/PARTY_EVENT_STAGE2_SPRINT4_ADMIN_QUOTE_CREATE_DRAFT_ORDER_REPORT.md
/Users/aiagentkevin/Documents/New project 2/handoff/party-event/CLI_PROGRESS_LATEST.md
```

Do not stage:

```text
frontend/vue-app/.env.production
frontend/vue-app/dist
.DS_Store
node_modules
test_evidence
.playwright-cli
backend/main.py
backend/migrations
payment files
webhook/n8n files
historical dirty files
```

## Next Recommendation

Enter limited App review for Sprint 4. If accepted, continue with a narrow follow-up to complete browser click-through evidence using an already-installed browser automation path or a manually controlled local browser session.
