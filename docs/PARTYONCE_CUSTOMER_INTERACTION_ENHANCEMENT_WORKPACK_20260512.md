# PartyOnce Customer Interaction Enhancement Workpack 20260512

## 1. Workpack Goal

Move the customer-facing read-only experience beyond simply viewing Quote / Order records, while staying inside a safe local/staging-only boundary.

This workpack adds:

- clearer next-step prompts on Quote and Order customer pages;
- local/staging supplement request entry for Quote and Order details;
- local/staging quote confirmation placeholder flow;
- contact guidance that makes clear no outbound message is sent;
- list-level indicators when local supplement or confirmation placeholders have been saved.

## 2. Modified Files

- `frontend/vue-app/src/services/customerExperienceService.js`
- `frontend/vue-app/src/views/MyQuotes.vue`
- `frontend/vue-app/src/views/MyQuoteDetail.vue`
- `frontend/vue-app/src/views/MyOrders.vue`
- `frontend/vue-app/src/views/MyOrderDetail.vue`
- `docs/PARTYONCE_CUSTOMER_INTERACTION_ENHANCEMENT_WORKPACK_20260512.md`

## 3. Quote Interaction Enhancement

`MyQuoteDetail.vue` now includes a non-payment quote interest confirmation placeholder.

Behavior:

- enabled only for quote statuses where customer intent makes sense: `sent` and `accepted`;
- writes only to browser `localStorage`;
- records `confirmation_placeholder_at`;
- displays a saved confirmation indicator on Quote Detail and My Quotes list;
- does not call backend APIs;
- does not accept the quote in production;
- does not create an order;
- does not start payment.

## 4. Supplement Requirements Entry

Quote Detail and Order Detail now include local/staging-only note entry:

- Quote: `Supplement Requirements`
- Order: `Update Request / Extra Notes`

The note is stored in browser `localStorage` under `partyonce_customer_interactions_v1`.

It is intended for local/staging demo review only and does not trigger:

- email;
- SMS;
- WhatsApp;
- webhook;
- n8n;
- Stripe;
- PaymentIntent;
- production customer messaging.

## 5. Contact Prompt

Quote Detail and Order Detail include contact guidance panels explaining that the current workpack captures local notes only.

No real contact channel is wired.

## 6. List-Level Indicators

`MyQuotes.vue` now shows:

- `Confirmation placeholder saved`
- `Supplement note saved`
- an `Add Requirements` entry point.

`MyOrders.vue` now shows:

- `Update note saved`
- an `Add Update Note` entry point.

## 7. Local/Staging Storage Boundary

The interaction state is stored by `customerExperienceService.js` using:

```text
partyonce_customer_interactions_v1
```

Each saved item includes:

- `type`
- `id`
- `supplement_note` where applicable
- `supplement_saved_at` where applicable
- `confirmation_placeholder` where applicable
- `confirmation_placeholder_at` where applicable
- `local_only: true`

## 8. Validation Result

### SFC Parse

SFC parse passed for:

- `frontend/vue-app/src/views/MyQuotes.vue`
- `frontend/vue-app/src/views/MyQuoteDetail.vue`
- `frontend/vue-app/src/views/MyOrders.vue`
- `frontend/vue-app/src/views/MyOrderDetail.vue`

Command:

```bash
node -e "const fs=require('fs'); const {parse,compileScript}=require('./frontend/vue-app/node_modules/@vue/compiler-sfc'); for (const file of ['frontend/vue-app/src/views/MyQuotes.vue','frontend/vue-app/src/views/MyQuoteDetail.vue','frontend/vue-app/src/views/MyOrders.vue','frontend/vue-app/src/views/MyOrderDetail.vue']) { const s=fs.readFileSync(file,'utf8'); const parsed=parse(s,{filename:file}); if(parsed.errors.length){ console.error(file, parsed.errors); process.exit(1); } compileScript(parsed.descriptor,{id:file}); console.log(file + ' SFC parse ok'); }"
```

Result:

```text
frontend/vue-app/src/views/MyQuotes.vue SFC parse ok
frontend/vue-app/src/views/MyQuoteDetail.vue SFC parse ok
frontend/vue-app/src/views/MyOrders.vue SFC parse ok
frontend/vue-app/src/views/MyOrderDetail.vue SFC parse ok
```

### Browser Smoke

Local Vite dev server:

```text
http://127.0.0.1:4178/
```

Customer fixture:

```text
customer-local-41
```

Routes checked:

```text
/my/quotes 200 main-ok
/my/quotes/quote-local-501 200 main-ok
/my/orders 200 main-ok
/my/orders/order-local-1001 200 main-ok
```

Interaction checks:

```text
Quote confirmation placeholder saved: yes
Quote supplement note saved: yes
Order update note saved: yes
Browser console errors: 0
```

## 9. External System Boundary

No external system was triggered.

Not touched:

- Stripe;
- PaymentIntent;
- webhook;
- n8n;
- email;
- SMS;
- WhatsApp;
- deployment.

## 10. Environment / Build Boundary

- `.env.production` was not read or modified.
- `frontend/vue-app/dist` was not submitted.
- No production database or production migration was used.

## 11. Blockers

No implementation blocker for the local/staging interaction enhancement.

Real customer messaging, true quote acceptance, order creation from quote acceptance, and payment remain intentionally blocked for later workpacks.

## 12. Next Step

Promote these local/staging-only customer intent records into a controlled backend read/write skeleton only after product approval for customer self-service actions. Payment / Stripe should remain a separate blocked workstream.
