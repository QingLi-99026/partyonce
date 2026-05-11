# PartyOnce Stage 2 Step 9 Admin Order UX Planning

Date: 2026-05-11

Scope: planning only for Admin Order Queue and Admin Order Detail UX

## 1. Current State

Stage 2 Order API skeleton has been implemented and accepted locally:

```text
41a0c05e7317af887a4c8fb204471ac4e07e28b7
Add order API skeleton
```

The Step 8.5 acceptance summary has also been recorded:

```text
90c0c0e126354b3df83b46b3d2c103b30e3cd24a
Add order API acceptance summary
```

Current backend Order skeleton endpoints:

```text
POST /api/orders
GET /api/orders
GET /api/orders/{order_id}
PATCH /api/orders/{order_id}
```

Verified backend behavior:

```text
accepted Quote -> draft Order skeleton
Order persists in SQLite local profile
Order remains after backend restart
Order creation is admin-only through require_admin
Order creation does not collect payment
Order creation does not trigger webhook/n8n or outbound messages
```

Current frontend state:

```text
/admin/quotes exists as the admin Quote queue skeleton
/admin/quotes/:quoteId exists as the admin Quote detail skeleton
/admin/orders is not registered as a Stage 2 admin Order route yet
/admin/orders/:orderId is not registered yet
```

This document does not implement frontend code, backend code, migrations, payment, deployment, or external integrations.

## 2. Step 9 Goal

Step 9 should add a minimal admin Order management UX after planning is approved.

Target routes:

```text
/admin/orders
/admin/orders/:orderId
```

Target purpose:

```text
let admin/manager operators review Orders created from accepted Quotes
let admin/manager operators inspect linked Quote, Lead, and Customer context
let admin/manager operators update allowed operational Order status fields
keep deposit/payment actions clearly blocked
keep external automation and outbound messaging blocked
```

Step 9 should not create customer-facing Order portal features.

## 3. Recommended File Scope For Later Implementation

Recommended new frontend files:

```text
frontend/vue-app/src/views/AdminOrders.vue
frontend/vue-app/src/views/AdminOrderDetail.vue
```

Recommended modified frontend files:

```text
frontend/vue-app/src/router/index.js
frontend/vue-app/src/components/NavHeader.vue
```

Optional only if existing API helper conventions require it:

```text
frontend/vue-app/src/api/index.js
```

Do not modify backend API code during the first Admin Order UX implementation unless a verified frontend blocker requires a minimal backend patch.

Do not modify:

```text
backend/migrations
frontend/vue-app/dist
frontend/vue-app/.env.production
payment pages
Stripe-related code
webhook/n8n code
```

## 4. Route Plan

Add routes:

```text
/admin/orders
/admin/orders/:orderId
```

Recommended route metadata:

```text
requiresAuth: true
requiresAdmin: true
title: Order Review / Order Detail
```

Route rules:

```text
Do not modify /ai-planner.
Do not modify payment routes.
Do not modify public /orders customer route in this step.
Do not remove existing Quote, Lead, Supplier, or Local Demo routes.
Do not add customer-facing Order acceptance routes.
```

## 5. Navigation Plan

Recommended minimal navigation change:

```text
Add one Admin Order Review entry near the existing Quote Review entry.
```

Preferred label:

```text
Order Review
```

Preferred target:

```text
/admin/orders
```

Navigation constraints:

```text
Do not add duplicate Order entries.
Do not expose payment wording in the nav.
Do not route admin users to the existing customer /orders page.
Do not remove existing nav entries.
```

## 6. Admin Order Queue UX Plan

Recommended page:

```text
AdminOrders.vue
```

Recommended API call:

```text
GET /api/orders
```

Recommended query controls:

```text
status
quote_id
lead_id
customer_id
search
limit
offset
```

If the backend supports only part of the query surface, the page should degrade safely by using the available list response and applying local filters only for visible local/staging skeleton data.

Recommended summary cards:

```text
Total Orders
Visible Orders
Allowed Operational States
External Systems Blocked
```

Recommended table columns:

```text
order_number
status
customer name
customer contact
quote_id
lead_id
event_date
event_location
total_amount
deposit_amount
deposit_status
created_at
updated_at
```

Recommended row actions:

```text
Open detail
Copy order_number
Open linked Quote detail if quote_id is available
```

Allowed queue status update controls:

```text
draft
pending_deposit
confirmed
in_progress
completed
cancelled
```

Disallowed queue controls:

```text
deposit_paid
payment capture
payment retry
Stripe checkout
webhook trigger
n8n trigger
email/SMS/WhatsApp send
supplier dispatch
contract generation
```

Important UX copy:

```text
Local/staging Order skeleton only. Deposit and payment actions are intentionally blocked.
```

## 7. Admin Order Detail UX Plan

Recommended page:

```text
AdminOrderDetail.vue
```

Recommended API calls:

```text
GET /api/orders/{order_id}
PATCH /api/orders/{order_id}
```

Recommended sections:

```text
Order summary
Customer summary
Linked Quote summary
Linked Lead summary if returned by backend or recoverable through Quote context
Event details
Amount summary
Deposit placeholder summary
Operational status controls
Skeleton limitations panel
```

Recommended Order summary fields:

```text
order_number
status
event_date
event_location
currency
total_amount
deposit_amount
deposit_status
confirmed_at
created_at
updated_at
```

Recommended linked Quote fields:

```text
quote_id
quote_number
quote_status
lead_id
```

Recommended customer fields:

```text
customer_id
customer name
customer contact
```

Allowed detail actions:

```text
Update operational status to draft / pending_deposit / confirmed / in_progress / completed / cancelled
Update event_date if backend PATCH allows it
Update event_location if backend PATCH allows it
Navigate back to Order Review
Navigate to linked Quote Detail
```

Blocked detail actions:

```text
Mark deposit as paid
Create checkout session
Open Stripe
Send customer notification
Trigger webhook/n8n
Create supplier assignment
Generate contract
Create or mutate payment_reference
```

## 8. Accepted Quote To Order UX Placement

The backend already supports:

```text
POST /api/orders with quote_id
```

Recommended UX placement for creating an Order from an accepted Quote:

```text
Admin Quote Detail should eventually show a guarded Create Draft Order action only when Quote status is accepted.
```

However, Step 9 first implementation can defer this action if necessary.

Safer implementation order:

```text
Step 9.1: Admin Order Queue route/page skeleton
Step 9.2: Admin Order Detail route/page skeleton
Step 9.3: Admin Quote Detail Create Draft Order action planning
Step 9.4: Create Draft Order action implementation only after queue/detail can display the result
```

Create Draft Order action rules:

```text
Only admin/manager users
Only accepted Quote
Call POST /api/orders
On success navigate to /admin/orders/{order_id}
On failure show backend error
Do not open payment
Do not set deposit_paid
Do not trigger external messages
```

## 9. Status Rules

Backend Order statuses:

```text
draft
pending_deposit
deposit_paid
confirmed
in_progress
completed
cancelled
```

Recommended UI status controls in Step 9:

```text
draft
pending_deposit
confirmed
in_progress
completed
cancelled
```

Keep `deposit_paid` hidden or disabled in Step 9 because it should be controlled by a future payment/deposit stage, not by manual skeleton UI.

Step 9 must keep payment-related fields read-only:

```text
deposit_status
payment_reference
deposit_amount
```

## 10. Empty, Error, And Local/Staging States

Admin Order Queue empty state should say:

```text
No Orders are available yet. Create an accepted Quote first, then create a draft Order from that Quote.
```

Backend disabled state should say:

```text
Order skeleton requires the safe sqlite_local backend profile.
```

Network/API error state should say:

```text
Could not load the local/staging Order skeleton data. Check the safe local backend profile and admin auth fixture.
```

Every page should visibly state:

```text
Local/staging skeleton only. No payment, Stripe, webhook/n8n, or outbound messages are triggered.
```

## 11. Permission Boundary

Admin Order UX should assume the backend enforces:

```text
require_admin
```

UI-level route metadata should include:

```text
requiresAuth: true
requiresAdmin: true
```

Access rules:

```text
anonymous users cannot access Admin Order Queue
normal customers cannot access Admin Order Queue
suppliers cannot access Admin Order Queue
customer-facing /orders remains separate and out of scope
public Order share links are out of scope
```

If the current frontend auth fixture is unstable, the implementation workpack should record it as an acceptance limitation instead of weakening the admin boundary.

## 12. Testing Plan For Later Implementation

Safe local frontend checks:

```text
route /admin/orders returns the app shell
route /admin/orders/:orderId returns the app shell
Admin Order Queue renders empty state when no backend Orders exist
Admin Order Queue renders data from GET /api/orders
Admin Order Detail renders data from GET /api/orders/{order_id}
PATCH status updates allowed operational statuses
linked Quote navigation points to /admin/quotes/{quote_id}
```

Safe local backend setup for UX acceptance:

```text
PYTHON_DOTENV_DISABLED=1
PARTYONCE_LEAD_STORAGE_MODE=sqlite_local
PARTYONCE_LEAD_SQLITE_PATH=local temporary SQLite path
```

Recommended seed flow:

```text
POST /api/leads
PATCH /api/leads/{lead_id} to qualified
POST /api/quotes
PATCH /api/quotes/{quote_id} to accepted
POST /api/orders
GET /api/orders
GET /api/orders/{order_id}
```

Do not test:

```text
Stripe/payment
PaymentIntent
checkout sessions
webhook/n8n
email/SMS/WhatsApp
production database
production migration
production deployment
frontend dist submission
```

## 13. Recommended Step 9 Breakdown

Recommended next steps:

```text
Step 9.1: Admin Order Queue implementation plan or direct route/page skeleton if owner approves
Step 9.2: Admin Order Queue route/page skeleton
Step 9.3: Admin Order Detail route/page skeleton
Step 9.4: Admin Order browser/local acceptance
Step 9.5: Step 9 closeout summary
```

If implementation begins, keep each step small and commit separately.

## 14. Explicitly Blocked In Step 9

Step 9 must not do:

```text
Stripe/payment
PaymentIntent
checkout sessions
real deposit collection
webhook/n8n
email/SMS/WhatsApp
supplier dispatch
contract generation
customer-facing Order portal
public Order share link
production deployment
production database migration
.env.production changes
frontend/vue-app/dist submission
Quote API rewrites
Order API rewrites beyond verified blockers
```

## 15. Closeout Recommendation

Recommended next action:

```text
Step 9.1: Admin Order Queue route/page skeleton
```

The first implementation should add only the admin queue page, route, and navigation entry. It should consume the existing Order API skeleton and keep all payment, notification, supplier dispatch, contract, and production capabilities blocked.
