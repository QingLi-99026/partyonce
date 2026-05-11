# PartyOnce Stage 2 Step 7.2 Admin Quote Queue Workpack

Date: 2026-05-11

Scope: minimal frontend skeleton for admin Quote queue

## 1. Work Completed

Added a local/staging admin Quote queue page:

```text
frontend/vue-app/src/views/AdminQuotes.vue
```

Updated route registration:

```text
frontend/vue-app/src/router/index.js
```

Updated navigation with one Quote Review entry:

```text
frontend/vue-app/src/components/NavHeader.vue
```

## 2. Implemented Route

New route:

```text
/admin/quotes
```

Route metadata:

```text
requiresAuth: true
requiresAdmin: true
```

This follows the existing admin route style used by supplier/template admin pages.

## 3. Admin Quote Queue Behavior

The page calls:

```text
GET /api/quotes
PATCH /api/quotes/{quote_id}
```

The page shows:

```text
quote_number
status
customer summary
lead_id
currency
final_total
selection snapshot summary
line item count
created_at
```

The page supports:

```text
status filter
search by quote number / customer / contact / lead id
refresh
status patch for allowed skeleton statuses
```

Allowed UI statuses:

```text
draft
sent
accepted
rejected
expired
```

The UI does not offer:

```text
converted_to_order
```

## 4. Safety Boundaries

This work did not add:

```text
Order API
Order creation
Stripe/payment
webhook/n8n
email/SMS/WhatsApp
public Quote link
customer self-service Quote acceptance
supplier Quote access
```

This work did not modify:

```text
backend/main.py
backend/migrations
frontend/vue-app/.env.production
frontend/vue-app/dist
```

## 5. Known Limitation

The current router guard checks:

```text
userStore.isAdmin
```

The existing store file in this working tree does not visibly expose `isAdmin` in the inspected snippet. This may affect runtime access to admin routes, but it is not fixed in this workpack because that would broaden the scope beyond the Quote queue skeleton.

If admin auth blocks local acceptance, the next step should record it as an auth fixture/store blocker or fix it in a separate limited workpack.

## 6. Validation Performed

Performed limited static checks only.

Confirmed markers:

```text
AdminQuotes.vue exists
/admin/quotes route exists
Quote Review nav entry exists
converted_to_order is not offered as a UI option
```

Build was not run in this workpack because the repository has known historical frontend dirty state and dist must not be submitted.

## 7. Remaining Work

Next recommended work:

```text
Step 7.3: Admin Quote detail route/page skeleton
```

Before browser acceptance, confirm or isolate:

```text
admin auth fixture
userStore.isAdmin behavior
safe local backend profile
seed persistent Lead and Quote
```

Still blocked:

```text
Order API
payment
Stripe
webhook/n8n
email/SMS/WhatsApp
production deployment
.env.production changes
frontend/vue-app/dist submission
```
