# PartyOnce Stage 2 Step 7 Quote Review UX / Admin Workflow Plan

Date: 2026-05-10

Scope: planning only for Quote review UX and admin Quote workflow

## 1. Current Entry State

Stage 2 Step 6 is complete for local/staging Quote API skeleton acceptance.

Accepted backend path:

```text
persistent Lead
-> admin creates draft Quote through POST /api/quotes
-> Quote is stored in local SQLite
-> Lead status becomes converted_to_quote
-> admin can list, view, and patch Quote status
```

Relevant Step 6 closeout:

```text
e33a065264cdc27e983c428bbf0515ff7a73d24d
Add stage 2 quote API skeleton closeout
```

This Step 7 plan does not implement UI or API code.

## 2. Step 7 Goal

Step 7 should define how operators review and manage Quotes after a Lead has been converted into a draft Quote.

Primary UX goal:

```text
admin can find Quote records, inspect the linked Lead/customer context, review pricing snapshots, and move Quote status through allowed skeleton states
```

Secondary planning goal:

```text
prepare a future customer-facing Quote review path without opening public quote links or payment
```

## 3. Allowed Planning Scope

Allowed planning topics:

```text
admin Quote queue UX
admin Quote detail UX
Quote status operation UX
linked Lead/customer context display
selection and pricing snapshot display
server-side pricing validation plan
customer-facing Quote review planning
local/staging acceptance route planning
```

Allowed existing API surface to plan around:

```text
POST /api/quotes
GET /api/quotes
GET /api/quotes/{quote_id}
PATCH /api/quotes/{quote_id}
```

## 4. Explicit Non-Goals

Step 7 must not implement or authorize:

```text
Order API
Order creation
Stripe / payment
payment collection
webhook / n8n
email / SMS / WhatsApp
production deployment
production database migration
.env.production changes
frontend/vue-app/dist submission
full supplier backend
automatic approval
contract signing
large permission system expansion
```

Step 7 also should not modify backend API behavior unless a later implementation workpack explicitly scopes it.

## 5. Admin Quote Queue UX

Recommended route:

```text
/admin/quotes
```

Purpose:

```text
give admin/manager users a scannable queue of Quotes created from persistent Leads
```

Recommended columns:

```text
quote_number
status
customer name
customer contact
linked lead id
event date if available
theme/package summary
currency
final_total
created_at
updated_at
```

Recommended filters:

```text
status
customer search
lead id
quote number
created date range
minimum / maximum final_total
```

Recommended actions:

```text
open Quote detail
copy Quote number
change status through allowed admin states
return to linked Lead
```

States visible in queue:

```text
draft
sent
accepted
rejected
expired
```

The queue must not expose:

```text
converted_to_order action
payment action
send email action
send SMS action
send WhatsApp action
```

## 6. Admin Quote Detail UX

Recommended route:

```text
/admin/quotes/:quote_id
```

Purpose:

```text
let admin/manager review the Quote and linked Lead/customer context before any future customer-facing step
```

Recommended sections:

```text
Quote summary
Customer summary
Linked Lead summary
Event and selection snapshot
Pricing snapshot
Line items JSON view or structured readonly table
Status controls
Internal notes / next action placeholder
Audit and timestamps
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
created_by_user_id
created_at
updated_at
```

Recommended linked Lead context:

```text
lead_id
lead status
lead source
lead priority
lead intake_notes
lead preferred_event_date
customer_id
```

Recommended snapshot display:

```text
selection_snapshot_json as readonly structured details
pricing_snapshot_json as readonly estimate basis
line_items_json as readonly Quote detail
```

The detail page should make clear that server-side pricing validation is still required before production quote sending.

## 7. Quote Status UX Rules

Current allowed skeleton statuses:

```text
draft
sent
accepted
rejected
expired
converted_to_order
```

Step 7 UX should only expose:

```text
draft
sent
accepted
rejected
expired
```

Step 7 UX must not expose:

```text
converted_to_order
```

Recommended status transitions for local/staging:

```text
draft -> sent
draft -> rejected
sent -> accepted
sent -> rejected
sent -> expired
accepted -> no Order action in Step 7
rejected -> draft only if admin intentionally reopens
expired -> draft only if admin intentionally refreshes
```

UX copy should avoid implying that accepting a Quote creates an Order or charges a deposit.

## 8. Customer-Facing Quote Review Planning

Customer-facing Quote review is not implemented in Step 7.

Future route candidates:

```text
/my/quotes
/quote-review/:quote_id
```

Future customer-facing scope should remain read-only at first:

```text
view Quote summary
view selected theme/package/venue snapshot
view pricing breakdown
view validity date
request changes through manual contact
```

Future customer-facing scope must not include without separate approval:

```text
self-service acceptance
deposit payment
Stripe checkout
Order creation
public unauthenticated share links
automatic outbound notification
```

## 9. Server-Side Pricing Validation Plan

Current Quote skeleton uses pricing snapshots from the Lead as the first draft estimate.

Before production quote sending, PartyOnce needs server-side pricing validation:

```text
validate package/tier exists
validate selected theme exists
validate venue or location pricing assumptions
validate guest count and add-on inputs
calculate subtotal on the server
calculate discounts on the server
calculate tax on the server if applicable
calculate final_total on the server
store the validated calculation basis
```

Recommended next planning artifact:

```text
Step 7.1: Quote pricing validation UX and backend contract plan
```

This should still not include Order or payment.

## 10. Local/Staging Acceptance Plan

When Step 7 implementation begins, acceptance should use a safe local profile only.

Suggested checks:

```text
admin can open /admin/quotes
admin can see Quotes created through POST /api/quotes
admin can search or filter by status
admin can open Quote detail
admin can inspect linked Lead/customer context
admin can patch status to sent
admin cannot patch status to converted_to_order from the UI
regular user cannot access admin Quote queue
anonymous user cannot access admin Quote queue
```

Do not run:

```text
production database migration
Stripe/payment
webhook/n8n
email/SMS/WhatsApp
deployment
frontend production build unless separately scoped
```

## 11. Implementation Sequencing Recommendation

Recommended Step 7 breakdown:

```text
Step 7.1: Quote admin UX implementation plan
Step 7.2: Admin Quote queue route/page skeleton
Step 7.3: Admin Quote detail route/page skeleton
Step 7.4: Quote status operation UX
Step 7.5: Local/staging browser acceptance
Step 7.6: Step 7 closeout
```

Step 7.2 and later may modify frontend code, but only after separate approval and limited review.

Recommended first implementation route:

```text
/admin/quotes
```

Recommended first detail route:

```text
/admin/quotes/:quote_id
```

## 12. Review And Staging Rules

Future Step 7 changes must continue to use:

```text
limited-scope review
whitelist staging
no git add .
no frontend/vue-app/dist submission
no .env.production changes
no unrelated dirty file cleanup
```

If frontend implementation touches historical dirty files, isolate the patch before staging.

## 13. Recommendation

Proceed next with:

```text
Step 7.1: Quote admin UX implementation plan
```

Do not proceed directly to:

```text
Order API
payment
Stripe
webhook/n8n
customer self-service acceptance
production deployment
```
