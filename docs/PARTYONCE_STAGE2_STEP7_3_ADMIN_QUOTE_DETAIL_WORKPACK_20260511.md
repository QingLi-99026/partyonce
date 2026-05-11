# PartyOnce Stage 2 Step 7.3 Admin Quote Detail Workpack

Date: 2026-05-11

Scope: minimal frontend skeleton for admin Quote detail review

## 1. Work Completed

Added a local/staging admin Quote detail page:

```text
frontend/vue-app/src/views/AdminQuoteDetail.vue
```

Updated route registration:

```text
frontend/vue-app/src/router/index.js
```

Updated the admin Quote queue with one detail action:

```text
frontend/vue-app/src/views/AdminQuotes.vue
```

## 2. Implemented Route

New route:

```text
/admin/quotes/:quoteId
```

Route metadata:

```text
requiresAuth: true
requiresAdmin: true
```

This follows the existing Stage 2 admin Quote queue guard.

## 3. Admin Quote Detail Behavior

The page calls:

```text
GET /api/quotes/{quote_id}
PATCH /api/quotes/{quote_id}
```

The page shows:

```text
quote_number
status
lead_id
customer summary
amount summary
line_items snapshot
selection snapshot
created / updated / sent / accepted timestamps
skeleton notice
```

The page supports:

```text
return to Quote Review
return to Lead Review
status update for allowed skeleton statuses
```

Allowed UI statuses:

```text
draft
sent
accepted
rejected
expired
```

The UI intentionally does not offer:

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

This work did not:

```text
push
deploy
trigger external systems
read production environment configuration
```

## 5. Validation Performed

Performed limited static checks only in this workpack:

```text
AdminQuoteDetail.vue exists
/admin/quotes/:quoteId route exists
AdminQuotes.vue has a View action to the detail route
converted_to_order is not offered as a UI option
```

Build was not run because this workpack is a narrow frontend skeleton step and repository dist remains excluded from submission.

## 6. Remaining Work

Next recommended work:

```text
Step 7.3A: Admin Quote detail route acceptance
```

The acceptance should use the safe local backend profile, seed a persistent Lead and Quote, open the browser as an admin user, navigate from `/admin/quotes` to `/admin/quotes/{quote_id}`, and confirm detail data plus allowed status update.

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
