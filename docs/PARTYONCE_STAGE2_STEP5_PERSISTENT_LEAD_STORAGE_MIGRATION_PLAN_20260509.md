# PartyOnce Stage 2 Step 5 Persistent Lead Storage / Migration Plan

Date: 2026-05-09

Scope: planning only for persistent Lead storage and controlled migration

## 1. Background

Stage 2 Step 4 has locally accepted the bridge from `/quote` to `POST /api/leads`.

Confirmed behavior:

- `/quote` still saves the inquiry to browser localStorage first.
- Explicit local/staging mode can sync the same inquiry to `POST /api/leads`.
- The Lead API skeleton returns `201` and a Lead ID.
- The current Lead API skeleton still stores records in memory.

Related commits:

```text
7ea8e1ed5f44f1e7c37201f78222b2a8bb5679b0
Add quote to lead bridge

09887f1c5832e17e2bf1bd1f38bbac6d27542ba8
Add step 4 real lead bridge acceptance
```

This Step 5 plan defines how to move from in-memory Lead skeleton storage to persistent Customer, Lead, and FollowUp storage without expanding into Quote API, Order API, payment, external messaging, or production deployment.

## 2. Planning Boundary

This document does not:

- Create migration files.
- Modify backend code.
- Modify frontend code.
- Connect to a database.
- Run migration commands.
- Change `.env.production`.
- Submit `frontend/vue-app/dist`.
- Start Quote API or Order API work.
- Touch Stripe or payment flows.
- Trigger webhook, n8n, email, SMS, WhatsApp, or other outbound systems.
- Deploy.
- Push.

## 3. Current State

### Current frontend intake

`/quote` produces inquiry data with:

```text
customerInfo
selection
pricing
submitTime
status
```

Default behavior remains:

```text
localStorage.inquirySubmissions
```

Optional local/staging bridge behavior:

```text
POST /api/leads
```

### Current backend Lead API skeleton

Existing endpoints:

```text
POST /api/leads
GET /api/leads
GET /api/leads/{lead_id}
PATCH /api/leads/{lead_id}
```

Current limitations:

- Records live in `LEAD_API_SKELETON_STORE`.
- Records disappear on backend restart.
- No `customers`, `leads`, or `follow_ups` tables are used.
- No duplicate detection.
- No rate limiting.
- No persistent admin follow-up history.

## 4. Step 5 Goal

Step 5 should persist only the Lead intake and operator follow-up surface.

Minimum persistent objects:

```text
customers
leads
follow_ups
```

Deferred objects:

```text
quotes
orders
supplier backend expansion
payment records
contract records
external notification logs
```

Step 5 success means:

- `POST /api/leads` writes a Customer and Lead to the local/staging database.
- `GET /api/leads` reads persistent Leads.
- `GET /api/leads/{lead_id}` reads one persistent Lead.
- `PATCH /api/leads/{lead_id}` updates persistent Lead operations fields.
- Follow-up note and next action writes create or update persistent follow-up data.
- Existing localStorage demo fallback remains usable.

## 5. Recommended Schema Subset

Use the Stage 2 schema draft, but only implement the lead subset first.

### `customers`

Purpose:

- Store customer identity and contact data submitted through `/quote`.

Minimum fields:

```text
id
name
email
phone
wechat_or_other_contact
preferred_contact_method
created_at
updated_at
```

Indexes:

```text
email
phone
wechat_or_other_contact
```

Contact parsing:

- Email-like input goes to `email`.
- Phone-like input goes to `phone`.
- Other text goes to `wechat_or_other_contact`.
- Preserve original contact meaning where possible.

### `leads`

Purpose:

- Store inquiry and sales opportunity records before Quote or Order creation.

Minimum fields:

```text
id
customer_id
source
status
priority
owner_user_id
preferred_event_date
intake_notes
selection_snapshot_json
pricing_snapshot_json
submitted_at
created_at
updated_at
```

Status enum:

```text
new
pending
contacted
qualified
unqualified
converted_to_quote
closed
```

Priority enum:

```text
High
Medium
Low
```

Indexes:

```text
customer_id
status
owner_user_id
priority
submitted_at
(status, owner_user_id, submitted_at)
```

### `follow_ups`

Purpose:

- Store operator note, next action, and follow-up history for Leads.

Minimum fields:

```text
id
lead_id
author_user_id
type
note
next_action
due_at
created_at
updated_at
```

Indexes:

```text
lead_id
created_at
(lead_id, created_at)
```

Step 5 should not require `quote_id` or `order_id` in follow-ups yet. Those can be added later when Quote and Order APIs are approved.

## 6. Demo Field Mapping

Use the current Step 4 bridge mapping and persist it as follows:

```text
customerInfo.name -> customers.name
customerInfo.contact -> customers.email / phone / wechat_or_other_contact
customerInfo.preferredDate -> leads.preferred_event_date
customerInfo.notes -> leads.intake_notes
selection -> leads.selection_snapshot_json
pricing -> leads.pricing_snapshot_json
source -> leads.source
submitTime -> leads.submitted_at
status -> leads.status, normalized to allowed Lead status
```

Admin queue fields:

```text
priority -> leads.priority
owner_user_id -> leads.owner_user_id
intake_notes -> leads.intake_notes
next_action -> follow_ups.next_action
note -> follow_ups.note
```

Rules:

- Public `POST /api/leads` cannot set owner.
- Public `POST /api/leads` cannot set priority above default.
- Public `POST /api/leads` cannot set Quote or Order state.
- Admin `PATCH /api/leads/{lead_id}` can update operations fields only.

## 7. Migration Strategy

Recommended first migration batch:

```text
001_create_customers
002_create_leads
003_create_follow_ups
004_add_lead_indexes_and_constraints
```

Do not include Quote or Order tables in the first persistent Lead batch.

### `001_create_customers`

Purpose:

- Create the Customer table needed by persistent Lead intake.

Dependencies:

- Existing backend user/auth table decision is not required.

Acceptance:

- Table exists.
- Contact indexes exist.
- `name` is required.

Rollback note:

- Drop table only if no Lead migration has been applied or after dropping dependent Leads.

Risk:

- Low to medium. Contact parsing and duplicate detection are not fully solved yet.

### `002_create_leads`

Purpose:

- Create persistent Lead records linked to Customers.

Dependencies:

- `customers`.

Acceptance:

- Lead status defaults to `new`.
- Priority defaults to `Medium`.
- Customer foreign key exists.
- Selection and pricing snapshots can store JSON/text safely.

Rollback note:

- Drop Leads before dropping Customers.

Risk:

- Medium. Existing backend startup currently calls table verification, so implementation must avoid uncontrolled production schema changes.

### `003_create_follow_ups`

Purpose:

- Persist admin notes and next actions for Leads.

Dependencies:

- `leads`.
- Admin user table relationship can remain nullable until owner confirms final auth mapping.

Acceptance:

- Follow-up records can attach to a Lead.
- Query by Lead ID returns ordered follow-ups.
- Notes and next actions persist across backend restart.

Rollback note:

- Drop FollowUps before Leads.

Risk:

- Low to medium. Risk mainly depends on how admin identity is represented.

### `004_add_lead_indexes_and_constraints`

Purpose:

- Add operational indexes after core tables exist.

Dependencies:

- `customers`
- `leads`
- `follow_ups`

Acceptance:

- Lead queue filters on status, owner, priority, and submitted time have indexes.
- Follow-up list by Lead ID and created time has indexes.

Rollback note:

- Drop indexes before dropping tables.

Risk:

- Low in local/staging; confirm database engine syntax before production migration.

## 8. Implementation Sequence

### Step 5.1: Confirm migration tool and database target

Input:

- Current backend stack.
- Existing database startup behavior.
- Owner decision on local/staging database target.

Output:

- Confirmed migration mechanism.
- Confirmed dev/staging database target.
- Explicit instruction for whether Alembic, raw SQL, or current SQLAlchemy create-all should be used.

Acceptance:

- No production DB touched.
- `.env.production` unchanged.
- No migration executed yet.

Codex automation:

- Allowed for read-only inspection and planning.
- Not allowed to execute migration without owner confirmation.

### Step 5.2: Draft real migration files

Input:

- Approved table subset.
- Confirmed migration tool.

Output:

- Migration files for `customers`, `leads`, `follow_ups`, indexes, and constraints.

Acceptance:

- Migration diff is reviewable.
- No Quote or Order tables included.
- Rollback path is documented.

Codex automation:

- Allowed only after owner approves Step 5.1.

### Step 5.3: Local/staging migration dry run

Input:

- Migration files.
- Safe local/staging profile.

Output:

- Migration applied to local/staging database.
- Tables verified.
- Rollback tested if practical.

Acceptance:

- No production DB touched.
- No external services triggered.
- Runtime artifacts remain outside git unless explicitly requested.

Codex automation:

- Allowed only in a safe local profile similar to Step 4 acceptance.

### Step 5.4: Persist `POST /api/leads`

Input:

- Tables exist.
- Lead API skeleton contract.

Output:

- Public `POST /api/leads` writes Customer and Lead transactionally.

Acceptance:

- Name and contact validation retained.
- Customer is created or matched by conservative duplicate logic.
- Lead is persisted.
- Response remains compatible with current `LeadResponse`.
- No Quote or Order created.

Codex automation:

- Allowed after migrations pass locally.

### Step 5.5: Persist admin Lead queue operations

Input:

- Persistent Leads.
- Existing admin guard.

Output:

- `GET /api/leads`, `GET /api/leads/{lead_id}`, and `PATCH /api/leads/{lead_id}` use persistent storage.
- `PATCH` updates status, priority, owner, notes, and next action.
- Follow-up notes are persisted.

Acceptance:

- Admin-only access remains enforced.
- Anonymous users cannot list, view, or patch Leads.
- Operations data survives backend restart.

Codex automation:

- Allowed after Step 5.4 is accepted.

### Step 5.6: Local acceptance against `/quote`

Input:

- Persistent Lead API.
- Existing `/quote` bridge.

Output:

- Real `/quote` submission writes localStorage and persistent Lead.
- Backend restart does not lose the Lead.

Acceptance:

- `POST /api/leads` returns persistent Lead ID.
- `GET /api/leads` can return the Lead after restart.
- No Quote, Order, payment, webhook, n8n, or external message triggered.

Codex automation:

- Allowed in local/staging only.

## 9. Duplicate and Contact Handling

Initial duplicate policy should be conservative.

Recommended first version:

- If contact is email and existing customer has the same email, reuse that Customer.
- If contact is phone and existing customer has the same phone, reuse that Customer.
- If contact is other text, do not aggressively merge unless exact same name and contact are found.
- Always create a new Lead for each submitted inquiry.

Do not block public intake because of possible duplicate customer records in Step 5.

## 10. Transaction Rules

`POST /api/leads` should run as one transaction:

1. Validate request.
2. Resolve or create Customer.
3. Create Lead.
4. Commit.
5. Return Lead response.

If Lead creation fails:

- Roll back Customer creation if it was part of the same transaction.
- Return a validation or server error.
- Do not create Quote.
- Do not create Order.
- Do not trigger external systems.

## 11. Security and Permission Boundary

Anonymous users:

- May call `POST /api/leads`.
- Must provide required name and contact.
- Cannot set admin-only fields.
- Cannot list Leads.
- Cannot view Lead details.
- Cannot patch Leads.

Admin or manager:

- May call `GET /api/leads`.
- May call `GET /api/leads/{lead_id}`.
- May call `PATCH /api/leads/{lead_id}` for allowed fields.

Supplier:

- No new Lead permissions in Step 5.

Owner approval required before:

- Exposing persistent admin queue outside local/staging.
- Enabling production database migrations.
- Connecting notifications.
- Changing customer-facing account behavior.

## 12. Validation Rules

Public Lead intake:

- `customer.name` required.
- `customer.contact` required.
- `source` defaults to `web_quote`.
- `status` defaults to `new`.
- `priority` defaults to `Medium`.
- `selection` and `pricing_snapshot` stored as snapshots but not trusted for final pricing.

Admin patch:

- Status must be one of allowed Lead statuses.
- Priority must be `High`, `Medium`, or `Low`.
- Owner must map to an existing admin/manager user after auth model is confirmed.
- Notes and next actions should be length-limited.

## 13. Testing Plan

Allowed tests for Step 5 implementation:

- Python syntax check for changed backend files.
- Migration dry run against `/tmp` or local-only database.
- API test for `POST /api/leads`.
- API test for admin-only `GET` and `PATCH` once auth test fixtures exist.
- Browser acceptance through `/quote` bridge in local/staging mode.
- Backend restart persistence check.

Blocked tests:

- Production migration.
- Production DB write.
- Real payment.
- Stripe webhook.
- n8n workflow.
- Email, SMS, WhatsApp sending.
- Deployment.

## 14. Risks and Blockers

Known risks:

- `backend/main.py` currently has startup table verification behavior; adding models before migration strategy is confirmed could create uncontrolled tables.
- Existing auth/admin test setup needs confirmation before persistent admin queue tests.
- Contact deduplication can become complex; first version should be conservative.
- JSON field behavior differs between SQLite, MySQL, and PostgreSQL; migration target must be confirmed.
- Current Lead API response shape must remain compatible with Step 4 frontend bridge and Step 3 admin queue behavior.

Blockers before implementation:

- Owner confirms migration tool.
- Owner confirms local/staging database target.
- Owner confirms whether current startup table verification should be disabled or bypassed for migration-managed tables.
- Owner confirms user/admin foreign key target for `owner_user_id` and `author_user_id`.

## 15. Explicitly Out of Scope

Step 5 must not include:

- Quote API.
- Order API.
- Stripe or real payment.
- Payment deposit workflow.
- Webhook execution.
- n8n execution.
- Email sending.
- SMS sending.
- WhatsApp sending.
- Production deployment.
- `.env.production` changes.
- `frontend/vue-app/dist` submission.
- Full supplier backend.
- Automatic supplier approval.
- Contract signing.
- Large permission system rewrite.

## 16. Recommended Next Action

Before coding, run a single-file review of this plan.

If accepted, the next implementation task should be:

```text
Step 5.1: confirm migration tool and database target, then draft real migration files only
```

Do not jump directly into persistent API code until the migration mechanism and database target are confirmed.
