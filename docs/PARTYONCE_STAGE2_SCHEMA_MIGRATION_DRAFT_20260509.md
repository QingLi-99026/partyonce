# PartyOnce Stage 2 Schema / Migration Draft

Date: 2026-05-09  
Scope: schema and migration draft only  
Repository: `/Users/aiagentkevin/.openclaw/workspace/projects/PartyOnce`

## 1. Schema Principles

This document is a planning artifact only. It does not create migration files, execute migrations, connect to a database, modify backend code, or change frontend code.

Core principles:

- Stage 1 browser `localStorage` demo data should migrate into backend `customers`, `leads`, and `follow_ups` first.
- Current `localStorage.inquirySubmissions` records are Leads, not Orders.
- A Quote is not the same as an inquiry. A Quote should be created only after the Lead has enough detail for a formal proposal.
- An Order can be created only from an accepted Quote.
- Payment fields in `orders` are placeholders only. They must not trigger Stripe or any real payment flow in this stage.
- Webhook, n8n, email, SMS, WhatsApp, production deployment, and production configuration remain blocked.
- Default deletion behavior should preserve business history. Prefer soft status changes or archive flags over hard delete for Customer, Lead, Quote, and Order records.

## 2. Suggested Tables

### `customers`

Purpose:

- Store customer identity and contact information used by Leads, Quotes, and Orders.

| Field | Type | Nullable | Default | Notes |
|---|---|---:|---|---|
| `id` | UUID or integer primary key | No | generated | Primary key. |
| `name` | varchar(160) | No | none | From `customerInfo.name`. |
| `email` | varchar(255) | Yes | null | Parsed from `customerInfo.contact` when email-like. |
| `phone` | varchar(50) | Yes | null | Parsed from `customerInfo.contact` when phone-like. |
| `wechat_or_other_contact` | varchar(160) | Yes | null | Fallback for WeChat or mixed contact text. |
| `preferred_contact_method` | varchar(40) | Yes | null | `email`, `phone`, `wechat`, `other`, later normalized. |
| `created_at` | datetime/timestamp | No | current timestamp | Record creation time. |
| `updated_at` | datetime/timestamp | No | current timestamp | Updated on write. |

Indexes:

- `idx_customers_email` on `email`.
- `idx_customers_phone` on `phone`.
- `idx_customers_other_contact` on `wechat_or_other_contact`.
- Optional composite duplicate-check index on `(name, phone)` after data normalization.

Foreign keys:

- Referenced by `leads.customer_id`, `quotes.customer_id`, and `orders.customer_id`.

Status enum:

- None for initial version.

Demo mapping:

- `customerInfo.name` -> `customers.name`.
- `customerInfo.contact` -> `customers.email`, `customers.phone`, or `customers.wechat_or_other_contact`.

### `leads`

Purpose:

- Store inquiry and sales opportunity records before a formal Quote or Order exists.

| Field | Type | Nullable | Default | Notes |
|---|---|---:|---|---|
| `id` | UUID or integer primary key | No | generated | Primary key. |
| `customer_id` | FK to `customers.id` | No | none | Lead owner/customer. |
| `source` | varchar(80) | No | `local_demo` or `web_quote` | Origin of the inquiry. |
| `status` | enum/string | No | `new` | See Lead status enum. |
| `priority` | enum/string | No | `Medium` | `High`, `Medium`, `Low` for first version. |
| `owner_user_id` | FK to users/admin table | Yes | null | Current owner; target table depends on existing auth model. |
| `preferred_event_date` | date | Yes | null | From `customerInfo.preferredDate`. |
| `intake_notes` | text | Yes | null | From `customerInfo.notes`. |
| `selection_snapshot_json` | json/text | Yes | null | Full local `selection` snapshot. |
| `pricing_snapshot_json` | json/text | Yes | null | Full local `pricing` snapshot. |
| `submitted_at` | datetime/timestamp | No | current timestamp | From `submitTime` when present. |
| `created_at` | datetime/timestamp | No | current timestamp | Record creation time. |
| `updated_at` | datetime/timestamp | No | current timestamp | Updated on write. |

Indexes:

- `idx_leads_customer_id` on `customer_id`.
- `idx_leads_status` on `status`.
- `idx_leads_owner_user_id` on `owner_user_id`.
- `idx_leads_priority` on `priority`.
- `idx_leads_submitted_at` on `submitted_at`.
- Composite `idx_leads_status_owner_submitted` on `(status, owner_user_id, submitted_at)`.

Foreign keys:

- `customer_id` references `customers.id`.
- `owner_user_id` should reference the existing admin/user table once owner confirms the auth model.

Status enum:

- `new`
- `pending`
- `contacted`
- `qualified`
- `unqualified`
- `converted_to_quote`
- `closed`

Demo mapping:

- `customerInfo.preferredDate` -> `leads.preferred_event_date`.
- `customerInfo.notes` -> `leads.intake_notes`.
- `selection` -> `leads.selection_snapshot_json`.
- `pricing` -> `leads.pricing_snapshot_json`.
- `status` -> `leads.status`.
- `followUp.priority` -> `leads.priority`.
- `followUp.owner` -> `leads.owner_user_id` after owner text is mapped to a real admin user.

### `quotes`

Purpose:

- Store priced proposals created from qualified Leads.

| Field | Type | Nullable | Default | Notes |
|---|---|---:|---|---|
| `id` | UUID or integer primary key | No | generated | Primary key. |
| `lead_id` | FK to `leads.id` | Yes | null | Nullable only for future direct quote drafts; should be required in Stage 2 if created from Lead. |
| `customer_id` | FK to `customers.id` | No | none | Quote customer. |
| `quote_number` | varchar(80) | No | generated | Human-readable unique quote number. |
| `status` | enum/string | No | `draft` | See Quote status enum. |
| `currency` | char(3) | No | `AUD` | Confirm currency with owner if needed. |
| `subtotal` | decimal(12,2) | No | `0.00` | Before discount/tax. |
| `discount_total` | decimal(12,2) | No | `0.00` | Initial placeholder. |
| `tax_total` | decimal(12,2) | No | `0.00` | Initial placeholder. |
| `final_total` | decimal(12,2) | No | `0.00` | Server-approved total. |
| `line_items_json` | json/text | Yes | null | Quote line item snapshot. |
| `selection_snapshot_json` | json/text | Yes | null | Selection snapshot used to create quote. |
| `valid_until` | date/datetime | Yes | null | Quote expiry. |
| `sent_at` | datetime/timestamp | Yes | null | When sent/visible to customer. |
| `accepted_at` | datetime/timestamp | Yes | null | When accepted. |
| `created_by_user_id` | FK to users/admin table | Yes | null | Admin/creator. |
| `created_at` | datetime/timestamp | No | current timestamp | Record creation time. |
| `updated_at` | datetime/timestamp | No | current timestamp | Updated on write. |

Indexes:

- Unique `uq_quotes_quote_number` on `quote_number`.
- `idx_quotes_lead_id` on `lead_id`.
- `idx_quotes_customer_id` on `customer_id`.
- `idx_quotes_status` on `status`.
- Composite `idx_quotes_customer_status` on `(customer_id, status)`.

Foreign keys:

- `lead_id` references `leads.id`.
- `customer_id` references `customers.id`.
- `created_by_user_id` references the existing admin/user table after auth model confirmation.

Status enum:

- `draft`
- `sent`
- `accepted`
- `rejected`
- `expired`
- `converted_to_order`

Demo mapping:

- Current `/quote` values should not directly become a Quote unless the Lead is qualified or customer/admin requests a formal quote.
- `pricing.finalTotal` can map to `quotes.final_total` only after server-side validation.
- `selection.addons` should become part of `line_items_json`.

### `orders`

Purpose:

- Store committed booking/execution records created from accepted Quotes.

| Field | Type | Nullable | Default | Notes |
|---|---|---:|---|---|
| `id` | UUID or integer primary key | No | generated | Primary key. |
| `quote_id` | FK to `quotes.id` | No | none | Source accepted Quote. |
| `customer_id` | FK to `customers.id` | No | none | Order customer. |
| `order_number` | varchar(80) | No | generated | Human-readable unique order number. |
| `status` | enum/string | No | `draft` | See Order status enum. |
| `event_date` | date | Yes | null | Confirmed event date. |
| `event_location` | varchar(255) | Yes | null | Venue/address snapshot. |
| `currency` | char(3) | No | `AUD` | Confirm currency with owner if needed. |
| `total_amount` | decimal(12,2) | No | `0.00` | Copied/approved from Quote. |
| `deposit_amount` | decimal(12,2) | No | `0.00` | Placeholder only in this stage. |
| `deposit_status` | enum/string | No | `not_required` | Placeholder, no Stripe connection. |
| `payment_reference` | varchar(160) | Yes | null | Placeholder; do not populate from real payment yet. |
| `confirmed_at` | datetime/timestamp | Yes | null | When admin confirms booking. |
| `created_at` | datetime/timestamp | No | current timestamp | Record creation time. |
| `updated_at` | datetime/timestamp | No | current timestamp | Updated on write. |

Indexes:

- Unique `uq_orders_order_number` on `order_number`.
- `idx_orders_quote_id` on `quote_id`.
- `idx_orders_customer_id` on `customer_id`.
- `idx_orders_status` on `status`.
- Composite `idx_orders_customer_status` on `(customer_id, status)`.

Foreign keys:

- `quote_id` references `quotes.id`.
- `customer_id` references `customers.id`.

Status enum:

- `draft`
- `pending_deposit`
- `deposit_paid`
- `confirmed`
- `in_progress`
- `completed`
- `cancelled`

Demo mapping:

- No current local inquiry maps directly to `orders`.
- `orders` can be created only after `quotes.status = accepted`.
- `payment_reference` and deposit fields are placeholders only.

### `follow_ups`

Purpose:

- Store operational follow-up notes and next actions for Leads first, and Quotes/Orders later.

| Field | Type | Nullable | Default | Notes |
|---|---|---:|---|---|
| `id` | UUID or integer primary key | No | generated | Primary key. |
| `lead_id` | FK to `leads.id` | Yes | null | Main Stage 2 parent. |
| `quote_id` | FK to `quotes.id` | Yes | null | Later quote follow-up parent. |
| `order_id` | FK to `orders.id` | Yes | null | Later order follow-up parent. |
| `author_user_id` | FK to users/admin table | Yes | null | Admin who wrote the note. |
| `type` | varchar(60) | No | `note` | `note`, `call`, `task`, `status_change`, etc. |
| `note` | text | Yes | null | From `followUp.note`. |
| `next_action` | varchar(255) | Yes | null | From `followUp.nextAction`. |
| `due_at` | datetime/timestamp | Yes | null | Optional reminder target. |
| `created_at` | datetime/timestamp | No | current timestamp | Record creation time. |
| `updated_at` | datetime/timestamp | No | current timestamp | Updated on write. |

Indexes:

- `idx_follow_ups_lead_id` on `lead_id`.
- `idx_follow_ups_quote_id` on `quote_id`.
- `idx_follow_ups_order_id` on `order_id`.
- `idx_follow_ups_created_at` on `created_at`.
- Composite `idx_follow_ups_lead_created` on `(lead_id, created_at)`.

Foreign keys:

- `lead_id` references `leads.id`.
- `quote_id` references `quotes.id`.
- `order_id` references `orders.id`.
- `author_user_id` references existing admin/user table after auth model confirmation.

Constraints:

- At least one of `lead_id`, `quote_id`, or `order_id` should be present.
- For Stage 2 initial implementation, require `lead_id` and leave quote/order follow-up usage for later.

Status enum:

- None required for first version.

Demo mapping:

- `followUp.nextAction` -> `follow_ups.next_action`.
- `followUp.note` -> `follow_ups.note`.
- `followUp.updatedAt` -> `follow_ups.updated_at`.

### `suppliers`

Purpose:

- Store approved or candidate service provider records. Keep light for this stage.

| Field | Type | Nullable | Default | Notes |
|---|---|---:|---|---|
| `id` | UUID or integer primary key | No | generated | Primary key. |
| `name` | varchar(180) | No | none | Supplier/business name. |
| `service_categories` | json/text | Yes | null | Category list. |
| `contact_name` | varchar(160) | Yes | null | Primary contact. |
| `contact_email` | varchar(255) | Yes | null | Email. |
| `contact_phone` | varchar(50) | Yes | null | Phone. |
| `status` | enum/string | No | `pending` | Light supplier status. |
| `coverage_area` | varchar(255) | Yes | null | Service region. |
| `created_at` | datetime/timestamp | No | current timestamp | Record creation time. |
| `updated_at` | datetime/timestamp | No | current timestamp | Updated on write. |

Indexes:

- `idx_suppliers_status` on `status`.
- `idx_suppliers_contact_email` on `contact_email`.
- Optional text/search index on `name`.

Foreign keys:

- None required initially.

Status enum:

- `pending`
- `active`
- `inactive`
- `suspended`

Demo mapping:

- Supplier showcase and application surfaces can map here later after approval.
- No current Lead demo field writes directly to `suppliers`.

### `supplier_applications`

Purpose:

- Store supplier onboarding submissions before approval.

| Field | Type | Nullable | Default | Notes |
|---|---|---:|---|---|
| `id` | UUID or integer primary key | No | generated | Primary key. |
| `supplier_id` | FK to `suppliers.id` | Yes | null | Filled after supplier record is created/linked. |
| `applicant_name` | varchar(160) | No | none | Applicant contact. |
| `business_name` | varchar(180) | No | none | Business name. |
| `contact` | varchar(255) | No | none | Raw contact for first version. |
| `service_categories` | json/text | Yes | null | Submitted service categories. |
| `documents_json` | json/text | Yes | null | Placeholder for future document metadata. |
| `status` | enum/string | No | `pending` | See SupplierApplication status enum. |
| `review_note` | text | Yes | null | Admin review note. |
| `reviewed_by_user_id` | FK to users/admin table | Yes | null | Reviewer. |
| `submitted_at` | datetime/timestamp | No | current timestamp | Submission time. |
| `reviewed_at` | datetime/timestamp | Yes | null | Review time. |

Indexes:

- `idx_supplier_applications_status` on `status`.
- `idx_supplier_applications_submitted_at` on `submitted_at`.
- `idx_supplier_applications_supplier_id` on `supplier_id`.

Foreign keys:

- `supplier_id` references `suppliers.id`.
- `reviewed_by_user_id` references existing admin/user table after auth model confirmation.

Status enum:

- `pending`
- `reviewing`
- `approved`
- `rejected`
- `on_hold`

Demo mapping:

- `/partner/apply` submission data should eventually map here.
- `/partner/status` should read this table after backend implementation.

### `themes`

Purpose:

- Store party theme concepts.

| Field | Type | Nullable | Default | Notes |
|---|---|---:|---|---|
| `id` | UUID or integer primary key | No | generated | Primary key. |
| `name` | varchar(160) | No | none | Theme display name. |
| `slug` | varchar(160) | No | none | URL/key-safe identifier. |
| `description` | text | Yes | null | Theme description. |
| `status` | enum/string | No | `active` | Light publishing status. |
| `media_json` | json/text | Yes | null | Image/media metadata. |
| `created_at` | datetime/timestamp | No | current timestamp | Record creation time. |
| `updated_at` | datetime/timestamp | No | current timestamp | Updated on write. |

Indexes:

- Unique `uq_themes_slug` on `slug`.
- `idx_themes_status` on `status`.

Foreign keys:

- Referenced by `packages.theme_id`.

Status enum:

- `draft`
- `active`
- `archived`

Demo mapping:

- `selection.themeId` -> `themes.id` or `themes.slug`.
- `selection.themeName` -> snapshot from `themes.name`.

### `packages`

Purpose:

- Store quotable package/bundle definitions.

| Field | Type | Nullable | Default | Notes |
|---|---|---:|---|---|
| `id` | UUID or integer primary key | No | generated | Primary key. |
| `theme_id` | FK to `themes.id` | Yes | null | Theme-specific package, nullable for global package. |
| `name` | varchar(160) | No | none | Package display name. |
| `description` | text | Yes | null | Package description. |
| `base_price` | decimal(12,2) | No | `0.00` | Starting price. |
| `currency` | char(3) | No | `AUD` | Confirm with owner if needed. |
| `status` | enum/string | No | `active` | Light publishing status. |
| `included_items_json` | json/text | Yes | null | Package content snapshot. |
| `created_at` | datetime/timestamp | No | current timestamp | Record creation time. |
| `updated_at` | datetime/timestamp | No | current timestamp | Updated on write. |

Indexes:

- `idx_packages_theme_id` on `theme_id`.
- `idx_packages_status` on `status`.

Foreign keys:

- `theme_id` references `themes.id`.

Status enum:

- `draft`
- `active`
- `archived`

Demo mapping:

- `selection.packageId` -> `packages.id` or package slug.
- `selection.packageName` -> snapshot from `packages.name`.
- `pricing.packagePrice` -> package price snapshot, not necessarily live `base_price`.

### `venues`

Purpose:

- Store venue or venue-like location options.

| Field | Type | Nullable | Default | Notes |
|---|---|---:|---|---|
| `id` | UUID or integer primary key | No | generated | Primary key. |
| `name` | varchar(180) | No | none | Venue display name. |
| `address` | varchar(255) | Yes | null | Location/address. |
| `capacity` | integer | Yes | null | Approximate capacity. |
| `base_fee` | decimal(12,2) | No | `0.00` | Venue fee baseline. |
| `status` | enum/string | No | `active` | Light publishing status. |
| `features_json` | json/text | Yes | null | Facilities/features. |
| `created_at` | datetime/timestamp | No | current timestamp | Record creation time. |
| `updated_at` | datetime/timestamp | No | current timestamp | Updated on write. |

Indexes:

- `idx_venues_status` on `status`.
- Optional `idx_venues_capacity` on `capacity`.

Foreign keys:

- None required initially.

Status enum:

- `draft`
- `active`
- `archived`

Demo mapping:

- Current local `selection.sceneId` and `selection.sceneName` may map to either a future venue record or a scene/layout dimension. Owner should decide before implementation.
- `pricing.sceneFee` may become a venue/scene fee snapshot.

## 3. Required Status Enum Draft

Lead statuses:

```text
new
pending
contacted
qualified
unqualified
converted_to_quote
closed
```

Quote statuses:

```text
draft
sent
accepted
rejected
expired
converted_to_order
```

Order statuses:

```text
draft
pending_deposit
deposit_paid
confirmed
in_progress
completed
cancelled
```

SupplierApplication statuses:

```text
pending
reviewing
approved
rejected
on_hold
```

Recommended implementation detail:

- Use DB-native enum only if the current backend stack already handles enum migrations cleanly.
- Otherwise use constrained string values at the application/model layer first, then add DB check constraints after behavior settles.

## 4. Migration Order Draft

Do not execute these migrations in this workpack.

### `001_create_customers`

Purpose:

- Create the customer contact foundation for Leads, Quotes, and Orders.

Depends on:

- None.

Acceptance:

- Table exists with required contact fields and timestamps.
- Contact search indexes are present.

Rollback notes:

- Can drop safely only before dependent tables exist.

Risk:

- Low-medium. Contact normalization decisions can cause later duplicate records.

### `002_create_leads`

Purpose:

- Create backend storage for current inquiry/lead demo records.

Depends on:

- `customers`.
- Existing admin/user table decision for `owner_user_id`, or keep nullable without FK until confirmed.

Acceptance:

- Lead status enum/string supports required values.
- Selection/pricing snapshots can store the current local demo payload.
- Status, owner, priority, and submitted time indexes are present.

Rollback notes:

- Do not drop after real customer inquiries are accepted. Archive/export first.

Risk:

- Medium. This is the first production-adjacent customer intake table.

### `003_create_quotes`

Purpose:

- Create quote draft/proposal storage from qualified Leads.

Depends on:

- `customers`.
- `leads`.
- Existing admin/user table decision for `created_by_user_id`, or keep nullable without FK until confirmed.

Acceptance:

- Unique `quote_number` constraint exists.
- Quote status values are supported.
- Lead/customer/status indexes are present.

Rollback notes:

- Must not drop after quotes are sent or accepted. Use feature flag or disable API before rollback.

Risk:

- Medium-high. Quote totals must not trust raw browser pricing without validation.

### `004_create_orders`

Purpose:

- Create order skeleton records from accepted Quotes only.

Depends on:

- `customers`.
- `quotes`.

Acceptance:

- Unique `order_number` constraint exists.
- Order status values are supported.
- Payment/deposit fields exist only as placeholders.

Rollback notes:

- Must not drop if any operational order record exists.

Risk:

- High. Order records imply fulfillment responsibility even without payment.

### `005_create_follow_ups`

Purpose:

- Store follow-up notes and next actions for Lead Queue.

Depends on:

- `leads`.
- `quotes` and `orders` if quote/order follow-up parent columns are included.
- Existing admin/user table decision for `author_user_id`, or keep nullable without FK until confirmed.

Acceptance:

- Follow-ups can attach to a Lead.
- `lead_id` and `created_at` indexes support admin lead detail views.
- At least one parent constraint is documented or enforced.

Rollback notes:

- Notes may contain important operational history; export before dropping.

Risk:

- Medium. Notes may contain sensitive customer context.

### `006_create_supplier_tables`

Purpose:

- Create light supplier and supplier application tables without full supplier backend automation.

Depends on:

- Existing admin/user table decision for reviewer fields, or keep nullable without FK until confirmed.

Acceptance:

- `suppliers` and `supplier_applications` exist.
- SupplierApplication status supports `pending`, `reviewing`, `approved`, `rejected`, and `on_hold`.
- No automatic approval or outbound messaging is triggered.

Rollback notes:

- Supplier application data should be exported before dropping.

Risk:

- Medium. Supplier data can become operationally sensitive.

### `007_create_theme_package_venue_tables`

Purpose:

- Create reference tables for public browsing and quote selection.

Depends on:

- None for `themes` and `venues`.
- `themes` before `packages`.

Acceptance:

- Theme slug uniqueness exists.
- Packages can optionally link to Theme.
- Venue reference data can be stored without affecting current local demo.

Rollback notes:

- Safe before production catalog data is imported. Later rollback requires catalog export.

Risk:

- Low-medium. Catalog structure may need iteration once pricing rules are finalized.

### `008_add_indexes_and_constraints`

Purpose:

- Add final performance indexes, unique constraints, and optional check constraints after table shape is accepted.

Depends on:

- All prior table migrations.

Acceptance:

- Contact, status, owner, priority, submitted time, customer, quote, order, and follow-up indexes exist.
- `quote_number` and `order_number` are unique.
- Hard delete behavior is constrained by foreign key policy.

Rollback notes:

- Index drops are usually safe; unique/check constraint rollback needs duplicate-data audit.

Risk:

- Medium. Constraints can fail if seed/demo data violates assumptions.

## 5. Index and Constraint Recommendations

Customer contact lookup:

- `customers.email`
- `customers.phone`
- `customers.wechat_or_other_contact`

Lead queue:

- `leads.status`
- `leads.owner_user_id`
- `leads.priority`
- `leads.submitted_at`
- Composite `(status, owner_user_id, submitted_at)`

Quote lookup:

- `quotes.lead_id`
- `quotes.customer_id`
- `quotes.status`
- Unique `quotes.quote_number`

Order lookup:

- `orders.quote_id`
- `orders.customer_id`
- `orders.status`
- Unique `orders.order_number`

Follow-up timeline:

- `follow_ups.lead_id`
- `follow_ups.created_at`
- Composite `(lead_id, created_at)`

Foreign key deletion policy:

- Do not cascade delete Customer -> Lead/Quote/Order by default.
- Do not hard delete Customer, Lead, Quote, or Order in normal application flows.
- Prefer status updates such as `closed`, `cancelled`, `archived`, or a future `deleted_at` soft-delete field.
- For FollowUp rows, avoid cascade deletion once real notes exist. If database cascade is used during early local development, remove it before production use.

## 6. Current Demo Field Mapping

Required mapping from current local demo records:

```text
customerInfo.name -> customers.name
customerInfo.contact -> customers.email / phone / wechat_or_other_contact
customerInfo.preferredDate -> leads.preferred_event_date
customerInfo.notes -> leads.intake_notes
selection -> leads.selection_snapshot_json
pricing -> leads.pricing_snapshot_json
status -> leads.status
followUp.priority -> leads.priority
followUp.owner -> leads.owner_user_id 后续映射
followUp.nextAction -> follow_ups.next_action
followUp.note -> follow_ups.note
followUp.updatedAt -> follow_ups.updated_at
```

Additional implementation notes:

- `submitTime` should map to `leads.submitted_at`.
- `selection.themeId` can later link to `themes.id` or `themes.slug`.
- `selection.packageId` can later link to `packages.id` or a package slug.
- `selection.sceneId` needs owner decision: map to `venues.id`, a future `scenes` table, or remain only a snapshot.
- `pricing.finalTotal` should remain a Lead estimate snapshot until Quote creation validates the total server-side.

## 7. Explicitly Blocked in This Stage

This stage must not do:

```text
真实 migration 执行
数据库写入
API 实现
Stripe 支付
webhook / n8n
email / SMS / WhatsApp
生产部署
.env.production 修改
dist 提交
完整供应商后台
自动审核
合同签署
```

Additional blocked work:

- Frontend source changes.
- Backend source changes.
- Dependency installation.
- Production API configuration.
- Public quote sharing.
- Payment status automation.
- Supplier auto-approval workflow.

## 8. Owner Decisions Needed Before Step 2

Before starting Lead API skeleton, owner should confirm:

- Database engine and migration tool to target for the first real migration.
- Whether IDs should be UUID or integer primary keys.
- Which existing user/admin table should own `owner_user_id`, `created_by_user_id`, `author_user_id`, and `reviewed_by_user_id`.
- Whether `sceneId` should map to Venue, Scene, or remain a quote/lead snapshot.
- Whether first implementation creates both Customer and Lead in one `POST /api/leads` transaction.
- Whether Quote and Order tables should be created in the same migration batch or deferred until after Lead API is accepted.

Recommended next step after approval:

- Enter Stage 2 Step 2 only: Lead API skeleton, starting with Customer + Lead create/list/detail/update contracts and admin-only read/update boundaries.
