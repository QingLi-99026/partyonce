# PartyOnce Stage 2 Step 7.1 Quote Admin UX Implementation Plan

Date: 2026-05-10

Scope: implementation planning only for admin Quote queue and detail UX

## 1. Current State

Step 7 planning is complete:

```text
fd47c0ad3a5671deacc4ef851b3c5710547e9fd3
Add stage 2 quote review UX workflow plan
```

Backend Quote skeleton is already accepted for local/staging:

```text
POST /api/quotes
GET /api/quotes
GET /api/quotes/{quote_id}
PATCH /api/quotes/{quote_id}
```

The current frontend repository has admin-oriented pages such as:

```text
frontend/vue-app/src/views/LocalLeadReview.vue
frontend/vue-app/src/views/AdminSuppliers.vue
frontend/vue-app/src/views/admin/Partners.vue
frontend/vue-app/src/views/admin/Templates.vue
```

The current router has `/admin/local-leads`, `/admin/suppliers`, `/admin/partners`, and `/admin/templates` style admin routes, but there is no committed `/admin/quotes` page yet.

This Step 7.1 document does not implement frontend code.

## 2. Implementation Goal

The next implementation workpack should add a minimal admin Quote review experience:

```text
/admin/quotes
/admin/quotes/:quote_id
```

The UX should allow admin/manager operators to:

```text
view Quote queue
filter by status
search by quote number / customer / lead id
open Quote detail
inspect linked Lead/customer context
inspect selection and pricing snapshots
patch allowed Quote statuses
```

It must not expose:

```text
converted_to_order operation
payment operation
send email/SMS/WhatsApp operation
webhook/n8n trigger
customer self-service acceptance
public Quote link
```

## 3. Recommended Frontend File Scope

Recommended new files:

```text
frontend/vue-app/src/views/AdminQuotes.vue
frontend/vue-app/src/views/AdminQuoteDetail.vue
```

Recommended modified files:

```text
frontend/vue-app/src/router/index.js
frontend/vue-app/src/components/NavHeader.vue
```

Optional only if existing API helper style requires it:

```text
frontend/vue-app/src/api/index.js
```

Implementation should avoid unrelated frontend files because the working tree contains historical dirty frontend changes.

## 4. Route Plan

Add routes:

```text
/admin/quotes
/admin/quotes/:quote_id
```

Recommended route metadata:

```text
requiresAuth: true
requiresAdmin: true
title: Quote Management / Quote Detail
```

Routing must not change existing `/ai-planner`, payment, Order, or supplier routes.

The route implementation should follow existing admin route style where possible.

## 5. Navigation Plan

Recommended minimal navigation change:

```text
add Quote Review or Quotes under the existing admin/support navigation area
```

Do not add multiple duplicate Quote entries.

Do not remove existing admin menu items.

Do not expose customer-facing Quote review navigation in this step.

## 6. Admin Quote Queue Page

Recommended component:

```text
AdminQuotes.vue
```

Recommended API call:

```text
GET /api/quotes
```

Recommended query controls:

```text
status
search
limit
offset
```

If backend does not yet support all query filters, the page should degrade safely:

```text
use available list response
filter locally only for the visible local/staging skeleton if needed
show a clear local/staging skeleton note
```

Recommended table columns:

```text
quote_number
status
customer name
customer contact
lead_id
currency
final_total
created_at
updated_at
```

Recommended row actions:

```text
open detail
copy quote_number
```

Allowed status controls on queue:

```text
draft
sent
accepted
rejected
expired
```

Disallowed controls:

```text
converted_to_order
payment
send notification
```

## 7. Admin Quote Detail Page

Recommended component:

```text
AdminQuoteDetail.vue
```

Recommended API calls:

```text
GET /api/quotes/{quote_id}
PATCH /api/quotes/{quote_id}
```

Recommended sections:

```text
Quote summary
Customer summary
Linked Lead summary
Selection snapshot
Pricing snapshot
Line items snapshot
Status operation panel
Local/staging limitations panel
```

Recommended Quote summary fields:

```text
quote_number
status
currency
subtotal
discount_total
tax_total
final_total
valid_until
sent_at
accepted_at
created_at
updated_at
```

Recommended Lead/customer context:

```text
lead_id
customer_id
customer name
customer contact
lead status if returned
source if returned
```

Snapshot rendering should be readonly.

If JSON snapshots are incomplete, the UI should show a readable empty state rather than failing.

## 8. Status Operation Rules

Frontend should only allow these statuses:

```text
draft
sent
accepted
rejected
expired
```

Frontend must not show:

```text
converted_to_order
```

Backend already blocks `converted_to_order`; the UI should still avoid presenting that option.

Recommended UX copy:

```text
Accepted means sales approval only in this skeleton. It does not create an order or collect payment.
```

## 9. Error And Empty States

Queue empty state:

```text
No Quotes yet. Create a persistent Lead first, then create a draft Quote from the backend skeleton.
```

Unauthorized state:

```text
This local/staging Quote queue requires admin access.
```

Backend disabled state:

```text
Quote API skeleton is disabled unless the safe local SQLite profile is enabled.
```

Network failure state:

```text
Could not load Quotes from the local/staging backend.
```

Snapshot missing state:

```text
No snapshot data is available for this Quote.
```

These messages should avoid implying production readiness.

## 10. API Integration Boundary

Frontend implementation may call only:

```text
GET /api/quotes
GET /api/quotes/{quote_id}
PATCH /api/quotes/{quote_id}
```

This admin UX step should not add `POST /api/quotes` UI unless separately approved, because creation remains tied to Lead workflow acceptance.

Do not call:

```text
Order API
payment API
Stripe endpoints
webhook endpoints
n8n endpoints
notification endpoints
```

## 11. Local/Staging Acceptance Plan

Safe backend profile:

```text
PYTHON_DOTENV_DISABLED=1
DATABASE_URL=sqlite local /tmp dummy app database
PARTYONCE_LEAD_STORAGE_MODE=sqlite_local
PARTYONCE_LEAD_SQLITE_PATH=/tmp/...
host=127.0.0.1
```

Acceptance prerequisites:

```text
apply 001 lead storage migration
apply 002 quote storage migration
create persistent Lead
create draft Quote through existing backend skeleton
login as admin fixture
```

Frontend acceptance checks:

```text
/admin/quotes route loads
Quote queue shows at least one Quote
status filter works at local/staging level
search works at local/staging level
open detail route works
detail page shows Quote summary
detail page shows customer/Lead context
detail page shows selection/pricing snapshots or readable empty states
PATCH status to sent works
converted_to_order is not offered in UI
regular user cannot access admin route
anonymous user cannot access admin route
```

Do not run:

```text
production deployment
production migration
Stripe/payment
webhook/n8n
email/SMS/WhatsApp
Order creation
```

## 12. Build And Test Guidance

Recommended checks for the implementation workpack:

```text
npm run build if existing frontend blockers allow it
dev server route check for /admin/quotes
dev server route check for /admin/quotes/:quote_id
browser smoke test with safe local backend profile
```

If existing unrelated frontend blockers prevent build, record the blocker and do not fix unrelated files in the Quote UX workpack.

Do not submit `frontend/vue-app/dist`.

## 13. Staging Boundary For Future Implementation

Expected whitelist for Step 7.2 / 7.3 implementation may include:

```text
frontend/vue-app/src/views/AdminQuotes.vue
frontend/vue-app/src/views/AdminQuoteDetail.vue
frontend/vue-app/src/router/index.js
frontend/vue-app/src/components/NavHeader.vue
frontend/vue-app/src/api/index.js only if needed
docs/PARTYONCE_STAGE2_STEP7_2_ADMIN_QUOTE_QUEUE_WORKPACK_20260510.md
```

Must exclude:

```text
frontend/vue-app/dist
frontend/vue-app/.env.production
.DS_Store
node_modules
test_evidence
unrelated historical frontend dirty files
backend/main.py unless a verified API blocker requires it
backend/migrations
```

Continue to avoid:

```text
git add .
```

## 14. Recommended Next Step

Proceed next with:

```text
Step 7.2: Admin Quote queue route/page skeleton
```

Recommended implementation starting point:

```text
create AdminQuotes.vue
add /admin/quotes route
add one navigation entry
use existing GET /api/quotes skeleton
show local/staging limitations clearly
```

Do not start:

```text
Order API
payment
Stripe
webhook/n8n
customer self-service acceptance
public Quote link
production deployment
```
