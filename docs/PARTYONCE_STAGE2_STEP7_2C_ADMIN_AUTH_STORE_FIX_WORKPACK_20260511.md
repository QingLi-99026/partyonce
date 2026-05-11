# PartyOnce Stage 2 Step 7.2C Admin Auth Store Fix Workpack

Date: 2026-05-11

Scope: limited frontend store fix for admin and partner route guards

## 1. Work Completed

Updated:

```text
frontend/vue-app/src/store/index.js
```

Added computed fields returned by `useUserStore`:

```text
isAdmin
isPartner
```

This directly addresses the Step 7.2B blocker where `/admin/quotes` redirected to home because the router guard checked `userStore.isAdmin`, but the inspected setup store did not expose that field.

## 2. Behavior

Admin guard now uses:

```text
isAdmin = role is admin or manager
```

Partner guard now uses:

```text
isPartner = role is partner
```

This preserves the existing router guard design:

```text
requiresAdmin -> userStore.isAdmin
requiresPartner -> userStore.isPartner
```

## 3. Files Changed

Changed:

```text
frontend/vue-app/src/store/index.js
```

Added this report:

```text
docs/PARTYONCE_STAGE2_STEP7_2C_ADMIN_AUTH_STORE_FIX_WORKPACK_20260511.md
```

## 4. Boundaries

This work did not modify:

```text
backend/main.py
backend/migrations
Quote API
Order API
payment / Stripe
webhook / n8n
email / SMS / WhatsApp
frontend/vue-app/.env.production
frontend/vue-app/dist
```

This work did not:

```text
push
deploy
trigger external systems
```

## 5. Validation Plan

Immediate validation should confirm:

```text
admin userInfo role=admin can pass /admin/quotes route guard
manager userInfo role=manager can pass admin route guard
partner userInfo role=partner can pass partner route guard
non-admin cannot pass /admin/quotes route guard
```

Step 7.2D should retry the Admin Quote Queue browser acceptance:

```text
safe local backend profile
seed persistent Lead and Quote
admin browser session opens /admin/quotes
Quote row is visible
PATCH status update works from UI
```

## 6. Remaining Blockers

Known unrelated frontend warnings may still appear:

```text
NavHeader unresolved icon components
UserFilled render warning
Home unresolved icon component
```

They are not fixed in this workpack because they are unrelated to admin route authorization.

## 7. Next Recommendation

Proceed next with:

```text
Step 7.2D: Admin Quote Queue browser acceptance retry
```

Still blocked:

```text
Order API
Stripe/payment
webhook/n8n
email/SMS/WhatsApp
production deployment
.env.production changes
frontend/vue-app/dist submission
```
