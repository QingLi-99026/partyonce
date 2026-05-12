# PartyOnce Payment / Stripe Test-Mode Readiness Workpack 20260512

## 1. Workpack Goal

Prepare the payment area for controlled Stripe test-mode validation without enabling live payment.

This workpack adds a readiness gate for:

```text
Order / deposit placeholder
-> Stripe test-mode configuration check
-> blocked-by-default readiness state
-> safe status pages
-> local/staging validation
```

## 2. Modified / Added Files

- `frontend/vue-app/src/services/paymentReadinessService.js`
- `frontend/vue-app/src/views/PaymentDeposit.vue`
- `frontend/vue-app/src/views/PaymentSuccess.vue`
- `frontend/vue-app/src/views/PaymentFailed.vue`
- `frontend/vue-app/src/views/PaymentCancelled.vue`
- `frontend/vue-app/src/router/index.js`
- `docs/PARTYONCE_PAYMENT_STRIPE_TEST_MODE_READINESS_WORKPACK_20260512.md`

## 3. Readiness Gate

`paymentReadinessService.js` checks:

- `VITE_STRIPE_TEST_MODE`
- `VITE_STRIPE_PUBLISHABLE_KEY`
- whether the publishable key starts with `pk_test_`
- whether a live key starts with `pk_live_`

Default state is blocked unless test-mode is explicitly configured.

## 4. Payment Deposit Page

`/payment/deposit` now shows:

- order snapshot;
- deposit placeholder;
- Stripe test-mode readiness checks;
- explicit blockers;
- clear safety boundary.

It does not:

- create a PaymentIntent;
- call `/api/payments/deposit`;
- call webhook;
- call n8n;
- send email / SMS / WhatsApp;
- process live payment.

The Stripe card field can only be mounted when the frontend sees a test-mode flag and `pk_test_*` publishable key. Confirmation remains disabled until a backend test PaymentIntent endpoint is approved.

## 5. Status Pages

The following routes are added as safe local/staging placeholders:

- `/payment/success`
- `/payment/failed`
- `/payment/cancelled`

They do not claim a production payment or outbound confirmation.

## 6. Backend Status

No backend payment endpoint was enabled in this workpack.

Existing order skeleton still treats `pending_deposit` as a business status only. PaymentIntent, webhook, n8n, and production payment updates remain blocked.

## 7. Validation Result

### SFC / JS Checks

SFC parse passed for:

```text
frontend/vue-app/src/views/PaymentDeposit.vue
frontend/vue-app/src/views/PaymentSuccess.vue
frontend/vue-app/src/views/PaymentFailed.vue
frontend/vue-app/src/views/PaymentCancelled.vue
```

JS syntax check passed for:

```text
frontend/vue-app/src/services/paymentReadinessService.js
```

`git diff --check` passed for the workpack files.

### Browser Smoke

Local Vite server:

```text
http://127.0.0.1:4178/
```

Checked routes:

```text
/payment/deposit?order_number=PO-TEST-001&amount=420 200 main-ok
/payment/success 200 main-ok
/payment/failed 200 main-ok
/payment/cancelled 200 main-ok
```

Functional checks:

```text
Readiness blocked or explicitly explained: yes
Readiness snapshot saved locally: yes
Browser console errors: 0
```

## 8. External Systems

No external system was triggered during implementation.

Not used:

- Stripe live mode;
- PaymentIntent creation;
- webhook;
- n8n;
- email;
- SMS;
- WhatsApp;
- deployment;
- push.

## 9. Environment / Build Boundary

- `.env.production` was not read or modified.
- `frontend/vue-app/dist` was not submitted.
- No live secret key was added.
- No production database was used.
- No production migration was created.

## 10. Blockers

Backend test PaymentIntent endpoint is still not approved or implemented.

To enter real Stripe test-mode execution later, the next workpack must explicitly define:

- test secret key storage;
- test webhook signing secret;
- local/staging-only backend endpoint;
- idempotency key strategy;
- order status update rules;
- webhook verification;
- rollback / failure handling.

## 11. Commit Hash

Recorded in final handoff after local commit.

## 12. Next Step

Build a backend local/staging-only Stripe test PaymentIntent skeleton behind explicit test-mode environment guards, then validate with Stripe test cards. Do not move to live mode until after webhook and order-state tests pass.
