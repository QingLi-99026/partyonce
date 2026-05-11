# Party Event / 派对活动 Stage 2 Order Readiness Plan

Date: 2026-05-12

## 1. Purpose

This plan defines when a Stage 2 Quote can safely become a local/staging Order skeleton.

It does not authorize payment, Stripe, webhook/n8n, outbound messaging, production deployment, production database migration, supplier dispatch, contract signing, or automatic review.

## 2. Quote Preconditions

Only an accepted Quote can create an Order skeleton.

Allowed:

```text
accepted Quote -> draft Order skeleton
```

Blocked:

```text
draft Quote -> Order
sent Quote -> Order
rejected Quote -> Order
expired Quote -> Order
missing / invalid quote_id -> Order
```

After an Order skeleton is created, the source Quote may be marked as `converted_to_order` to prevent duplicate conversion.

## 3. Order Skeleton Boundary

An Order skeleton is an internal local/staging operational record. It is not a payment workflow and not a production fulfilment system.

Allowed first-stage Order states:

```text
draft
pending_deposit
confirmed
in_progress
completed
cancelled
```

Important boundary:

```text
pending_deposit is only a business status.
It does not mean deposit is paid.
It does not create PaymentIntent.
It does not open Stripe checkout.
It does not trigger webhook/n8n.
It does not send email, SMS, WhatsApp, WeChat, or WeCom.
```

## 4. API Boundary

Stage 2 Order skeleton API scope:

```text
POST  /api/orders
GET   /api/orders
GET   /api/orders/{order_id}
PATCH /api/orders/{order_id}
```

Access:

```text
admin/manager only
anonymous forbidden
supplier forbidden
customer self-service not open
```

`POST /api/orders` must:

```text
read quote_id
validate Quote exists
validate quote.status = accepted
copy customer_id from Quote
copy lead_id from Quote
copy final_total and currency from Quote
copy selection and line item snapshots
create a draft Order skeleton
leave payment_reference empty
leave deposit_status as not_started
```

## 5. Storage Boundary

The current storage target is local/staging SQLite under `/tmp` for acceptance only.

Required migration chain:

```text
001_create_lead_storage.sql
002_create_quote_storage.sql
003_create_order_storage.sql
```

Production migration is not approved by this plan.

## 6. Frontend Boundary

Admin Order Queue and Detail can show:

```text
order_number
quote_number
customer
status
total_amount
created_at
event snapshot
line item snapshot
blocked external actions
```

Frontend must not add:

```text
payment button
Stripe checkout
PaymentIntent
webhook/n8n trigger
outbound notification
supplier dispatch
contract signing
```

## 7. Acceptance Checklist

Before considering the Order skeleton closed loop complete, local/staging acceptance must show:

```text
accepted Quote can create Order
draft/sent/rejected/expired Quote cannot create Order
invalid quote_id is rejected
admin/manager access works
anonymous/non-admin/supplier access is rejected
Order list and detail return persisted data
Order status can update to an allowed state
pending_deposit does not create payment artifacts
backend restart preserves Order data
Admin Order Queue/Detail can render the local API Order
```

## 8. Next Phase Gate

The next phase after Order skeleton should be an App review, not payment.

Still requires explicit owner approval:

```text
Stripe / payment
webhook / n8n
outbound messaging
production DB
production migration
deployment
push
```
