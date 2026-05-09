# PartyOnce Stage 2 Step 6.1 Quote API Contract And Skeleton Plan

Date: 2026-05-10

Scope: planning only for a narrow Quote API contract and skeleton

## 1. Current Starting Point

Stage 2 Step 5 is complete for local/staging persistent Lead intake.

Accepted Lead path:

```text
/quote visible form
-> localStorage.inquirySubmissions
-> POST /api/leads
-> local SQLite customers/leads persistence
-> backend restart preserves Lead
```

Current accepted Lead API surface:

```text
POST /api/leads
GET /api/leads
GET /api/leads/{lead_id}
PATCH /api/leads/{lead_id}
```

Current accepted storage scope:

```text
customers
leads
follow_ups
```

Current Lead persistence mode:

```text
memory by default
sqlite_local only when explicitly enabled in a safe local/staging profile
```

Step 6 must start from this accepted Lead foundation. It must not skip into Order, payment, deployment, or production database work.

## 2. Existing Quote Code Caution

The backend already contains historical Quote-related models and endpoints. Those existing areas need a separate review before they can be treated as part of the current Stage 2 path.

This Step 6.1 plan does not approve broad reuse of historical Quote code as production-ready behavior.

Before any implementation, the next engineering pass should decide whether to:

```text
reuse a minimal subset of existing Quote code
wrap existing Quote code behind the Stage 2 Lead-to-Quote contract
or create a narrower skeleton path that avoids unrelated historical behavior
```

The safe default is to treat Step 6 as a new narrow contract around Lead-to-Quote only.

## 3. Step 6 Product Boundary

Quote means a priced proposal created from a qualified Lead.

Quote does not mean:

```text
raw inquiry
localStorage-only estimate
confirmed booking
Order
payment request
Stripe checkout
supplier assignment
contract
external notification
```

Step 6 should only cover:

```text
Quote draft skeleton
Quote status skeleton
Quote detail skeleton
Quote relationship to Lead
```

Step 6 must not:

```text
create Order
connect Stripe/payment
trigger webhook / n8n
send email / SMS / WhatsApp
deploy
push
modify .env.production
submit frontend/vue-app/dist
```

## 4. Lead To Quote Boundary

Lead remains the intake and sales opportunity record.

Quote begins only after:

```text
Lead exists in backend
Lead has enough customer and event context
admin or manager intentionally creates a draft Quote
server stores a priced proposal snapshot
```

Lead should not automatically become Quote at `/quote` form submission time.

The current `/quote` form should continue to create Lead intake. The name of the page is historical and customer-facing, but the accepted backend behavior remains:

```text
/quote -> Lead
not /quote -> Quote
not /quote -> Order
```

## 5. Quote Object Contract

Recommended minimum Quote fields:

```text
id
lead_id
customer_id
quote_number
status
currency
subtotal
discount_total
tax_total
final_total
line_items_json
selection_snapshot_json
valid_until
sent_at
accepted_at
created_by_user_id
created_at
updated_at
```

Required relationships:

```text
Quote belongs to Lead
Quote belongs to Customer
Lead may have multiple Quotes over time
Customer may have multiple Quotes
Quote may later convert to Order, but Step 6 does not implement Order creation
```

Required snapshots:

```text
selection_snapshot_json keeps the theme/package/venue/add-on selection as quoted
line_items_json keeps priced line items as quoted
pricing totals are stored on Quote, not recalculated from mutable frontend state
```

## 6. Quote Status Contract

Allowed Quote status values:

```text
draft
sent
accepted
rejected
expired
converted_to_order
```

Step 6 skeleton may define all statuses for contract compatibility, but implementation should only actively support:

```text
draft
sent
accepted
rejected
expired
```

`converted_to_order` should remain a future state until Order work is explicitly approved.

Status ownership:

```text
admin/manager can create draft Quote
admin/manager can move draft to sent
admin/manager can mark rejected or expired
customer acceptance can be planned later, but not coupled to payment in Step 6
system must not auto-create Order when status becomes accepted
```

## 7. API Contract Draft

### POST /api/quotes

Purpose:

Create a draft Quote from an existing Lead.

Recommended request fields:

```json
{
  "lead_id": "",
  "currency": "AUD",
  "line_items": [],
  "selection_snapshot": {},
  "valid_until": "",
  "created_by_user_id": ""
}
```

Recommended response fields:

```text
id
lead_id
customer_id
quote_number
status
currency
subtotal
discount_total
tax_total
final_total
line_items_json
selection_snapshot_json
valid_until
created_at
updated_at
```

Access:

```text
admin/manager only
not anonymous
not supplier
```

Stage 6 implementation posture:

```text
skeleton only
must validate Lead exists
must not create Order
must not trigger payment
must not trigger external systems
```

### GET /api/quotes

Purpose:

List Quote records for admin review.

Recommended query parameters:

```text
lead_id
customer_id
status
search
limit
offset
```

Access:

```text
admin/manager only
```

Stage 6 implementation posture:

```text
optional skeleton if needed for admin workflow
must not expose all customer data anonymously
```

### GET /api/quotes/{quote_id}

Purpose:

Return one Quote detail record.

Access:

```text
admin/manager only for initial skeleton
future customer access requires customer ownership checks
```

Stage 6 implementation posture:

```text
safe skeleton
no payment link
no Order creation
```

### PATCH /api/quotes/{quote_id}

Purpose:

Update a draft Quote or change Quote status within allowed bounds.

Allowed fields:

```text
status
line_items
selection_snapshot
valid_until
discount_total
tax_total
final_total
```

Access:

```text
admin/manager only
```

Stage 6 implementation posture:

```text
must not allow converted_to_order transition to create Order
must not trigger payment
must not trigger external systems
```

## 8. Data Storage Planning

Step 6 should not introduce production database migration work by default.

Recommended next implementation route:

```text
Start with a review of existing Quote tables and backend Quote code.
Decide whether current SQLite/local database structure can support a narrow Quote skeleton.
If schema changes are required, write a migration draft first.
Use local/staging SQLite only for acceptance until owner approves broader database work.
```

Do not run production migration.

Do not connect to production database.

Do not modify production configuration.

## 9. Frontend Planning

Initial Step 6 does not need a frontend rebuild.

Potential later frontend touchpoints:

```text
admin lead detail page can show Create Draft Quote
admin quote detail page can show quote status and line items
customer-facing quote view can be planned after admin skeleton works
```

Frontend work should not change the accepted `/quote -> Lead` intake behavior.

## 10. Implementation Sequence Recommendation

### Step 6.1

Create this Quote API contract and skeleton plan.

Output:

```text
planning document only
no code
```

### Step 6.2

Review existing backend Quote code and schema against this contract.

Output:

```text
reuse / isolate / replace recommendation
historical-risk report
no broad code changes
```

### Step 6.3

Write Quote skeleton implementation plan.

Output:

```text
exact allowed files
exact endpoint behavior
test plan
staging boundaries
```

### Step 6.4

Implement narrow Quote skeleton only if Step 6.2 and Step 6.3 are accepted.

Allowed behavior:

```text
create draft Quote from existing Lead
read Quote list/detail
patch Quote draft/status fields
```

Forbidden behavior:

```text
create Order
connect payment
send external notifications
deploy
touch production config
```

### Step 6.5

Run local acceptance.

Acceptance should verify:

```text
admin can create draft Quote from existing persistent Lead
Quote references Lead and Customer
Quote status changes do not create Order
Lead remains intact
payment and external systems remain untouched
```

## 11. Required Blockers

Continue blocking:

```text
Order API
Stripe/payment
webhook/n8n
email/SMS/WhatsApp
production deployment
production database migration
.env.production modification
frontend/vue-app/dist submission
full supplier backend
automatic approval
contract signing
large permission system expansion
```

## 12. Review Questions Before Code

Owner should confirm:

```text
Should Step 6 reuse the existing backend Quote model/endpoints or isolate a new narrow skeleton?
Should Quote creation require Lead status qualified, or allow contacted/pending for demo?
Should accepted Quote remain non-order in Step 6, or should accepted be blocked until Step 7?
Should quote_number use current generator or a new Stage 2 numbering format?
Should Quote persistence use the current backend database session or a Step 5-style local SQLite profile?
```

Recommended default answers:

```text
isolate a narrow Stage 2 skeleton first
require Lead status qualified for stricter flow, or allow contacted for local demo only
allow accepted status but do not create Order
use existing quote_number generator only after review
keep local/staging persistence until production DB approval
```

## 13. Final Recommendation

Proceed next to:

```text
Step 6.2: existing Quote code and schema review
```

Do not start Quote implementation until Step 6.2 identifies the safest path around historical Quote code.

Do not start Order API, payment, external messaging, deployment, or production configuration work.
