# PartyOnce Stage 2 Backend Lead / Quote / Order Contract Plan

Date: 2026-05-09  
Scope: planning only  
Repository: `/Users/aiagentkevin/.openclaw/workspace/projects/PartyOnce`

## 0. Planning Boundary

Stage 1 has reached a local demonstrable flow. Stage 2 should turn the local browser demo model into a formal backend contract, but this document does not implement code, migrations, database changes, payment, webhook, messaging, deployment, or production configuration.

## 1. Current Local Demo Data Inventory

### `/quote`

Current role:

- Shows a local quote preview based on route query values such as `theme`, `scene`, and `package`.
- Allows saving a draft-like quote into browser `localStorage.savedQuote`.
- Allows submitting an inquiry into browser `localStorage.inquirySubmissions`.

Current local quote fields:

- `theme`
- `scene`
- `package`
- `addons`
- `totalPrice`
- `timestamp`

Current submitted inquiry fields:

- `customerInfo.name`
- `customerInfo.contact`
- `customerInfo.preferredDate`
- `customerInfo.notes`
- `selection.themeId`
- `selection.themeName`
- `selection.sceneId`
- `selection.sceneName`
- `selection.packageId`
- `selection.packageName`
- `selection.addons[]`
- `pricing.packagePrice`
- `pricing.sceneFee`
- `pricing.addonsTotal`
- `pricing.finalTotal`
- `submitTime`
- `status`

Backend mapping:

- `customerInfo` should become Customer contact fields and Lead intake fields.
- `selection` should become Lead selection snapshot first, then Quote line inputs once qualified.
- `pricing` should become Quote estimate fields only after quote creation. The current local estimate can be stored as a lead estimate snapshot before formal pricing is approved.
- `status` should map to Lead status while the record is still an inquiry/lead.

### `/my/inquiries`

Current role:

- Reads browser `localStorage.inquirySubmissions`.
- Displays customer, contact, preferred date, selected plan, pricing, submit time, and local status.
- Allows local status updates to `pending`, `contacted`, and `closed`.
- Allows deleting a browser-local inquiry record.

Backend mapping:

- Should become a customer-facing inquiry/lead history view after login.
- Customer should only see their own Lead and Quote records.
- Delete should not be a hard delete in the backend. Use cancel/withdraw/archive semantics later.

### `/admin/local-leads`

Current role:

- Reads browser `localStorage.inquirySubmissions`.
- Displays local lead records for operations review.
- Supports search, status filter, priority, owner, next action, and note.
- Writes operation edits back to `localStorage.inquirySubmissions`.
- Does not call backend, payment, webhook, n8n, email, SMS, WhatsApp, or any external system.

Current follow-up fields:

- `followUp.priority`
- `followUp.owner`
- `followUp.nextAction`
- `followUp.note`
- `followUp.updatedAt`

Backend mapping:

- Should become an authenticated admin lead queue.
- `followUp` should become either a latest follow-up summary on Lead or separate FollowUp records, with audit-friendly timestamps and author IDs.
- Owner should become a user/admin foreign key instead of free text.

### Local Browser Data vs Backend Data

Local-only demo data:

- `localStorage.savedQuote`
- `localStorage.inquirySubmissions`
- Browser-only status changes from `/my/inquiries`
- Browser-only follow-up edits from `/admin/local-leads`

Future backend data:

- Customers and contact identities.
- Lead records created from inquiry submissions.
- Quote records created after a lead is qualified or a customer requests a formal quote.
- Order records created only after a quote is accepted and the business is ready to track deposit/confirmation.
- FollowUp records for admin/customer communication history.
- Supplier, SupplierApplication, Package, Theme, and Venue reference records.

## 2. Formal Backend Object Recommendations

### Customer

Purpose:

- Represents the person or account requesting party services.

Key fields:

- `id`
- `name`
- `email`
- `phone`
- `wechat_or_other_contact`
- `preferred_contact_method`
- `created_at`
- `updated_at`

Relationships:

- Has many Leads.
- Has many Quotes through Leads or direct quote requests.
- Has many Orders after accepted Quotes.

Demo mapping:

- `customerInfo.name` -> `Customer.name`
- `customerInfo.contact` -> `phone`, `email`, or `wechat_or_other_contact` after parsing/normalization.
- `customerInfo.notes` stays on Lead intake notes, not Customer profile by default.

Must keep:

- Name and at least one contact channel.

Later extensions:

- Marketing consent, account user ID, child profile, address, timezone, language, duplicate matching.

### Lead

Purpose:

- Represents an inquiry or sales opportunity before a formal quote/order exists.

Key fields:

- `id`
- `customer_id`
- `source`
- `status`
- `priority`
- `owner_user_id`
- `preferred_event_date`
- `intake_notes`
- `selection_snapshot_json`
- `pricing_snapshot_json`
- `submitted_at`
- `created_at`
- `updated_at`

Relationships:

- Belongs to Customer.
- May have one or many Quotes.
- Has many FollowUps.
- May convert to an Order through an accepted Quote.

Demo mapping:

- `customerInfo.preferredDate` -> `preferred_event_date`
- `customerInfo.notes` -> `intake_notes`
- `selection` -> `selection_snapshot_json`
- `pricing` -> `pricing_snapshot_json`
- `status` -> Lead `status`
- `followUp.priority` -> `priority`
- `followUp.owner` -> `owner_user_id` after admin user mapping

Must keep:

- Customer link, source, status, selected theme/package snapshot, submitted time, contactability.

Later extensions:

- Lead score, campaign attribution, duplicate detection, assignment SLA, lost reason.

### Quote

Purpose:

- Represents a priced proposal that can be reviewed, sent, accepted, rejected, expired, or converted to an order.

Key fields:

- `id`
- `lead_id`
- `customer_id`
- `quote_number`
- `status`
- `currency`
- `subtotal`
- `discount_total`
- `tax_total`
- `final_total`
- `line_items_json`
- `selection_snapshot_json`
- `valid_until`
- `sent_at`
- `accepted_at`
- `created_by_user_id`
- `created_at`
- `updated_at`

Relationships:

- Belongs to Lead and Customer.
- May become one Order.
- Uses Package, Theme, Venue, Supplier, and item snapshots.

Demo mapping:

- `/quote` local pricing is an estimate. It should create a Quote only when user submits for formal quote or admin qualifies the Lead.
- `pricing.finalTotal` -> initial quote `final_total` only after server-side validation.
- `selection.addons` -> quote line items.

Must keep:

- Quote number, status, final total, line items, customer/lead references.

Later extensions:

- Versioning, approval workflow, margin, supplier cost, PDF proposal, expiry reminders.

### Order

Purpose:

- Represents a committed booking or event execution record after a quote is accepted.

Key fields:

- `id`
- `quote_id`
- `customer_id`
- `order_number`
- `status`
- `event_date`
- `event_location`
- `currency`
- `total_amount`
- `deposit_amount`
- `deposit_status`
- `payment_reference`
- `confirmed_at`
- `created_at`
- `updated_at`

Relationships:

- Belongs to Quote and Customer.
- May reference Supplier assignments later.
- May have payment records later, but payment is out of scope for this stage.

Demo mapping:

- No current local inquiry should directly become an Order.
- Order can be created only from accepted Quote in later implementation.

Must keep:

- Quote link, customer link, order number, status, event date, amount.

Later extensions:

- Payment schedule, contracts, timeline tasks, supplier fulfillment, change orders.

### FollowUp

Purpose:

- Records operational follow-up actions and notes for a Lead, Quote, or Order.

Key fields:

- `id`
- `lead_id`
- `quote_id`
- `order_id`
- `author_user_id`
- `type`
- `note`
- `next_action`
- `due_at`
- `created_at`
- `updated_at`

Relationships:

- Usually belongs to Lead.
- Can later attach to Quote or Order for post-quote service.

Demo mapping:

- `followUp.note` -> `FollowUp.note`
- `followUp.nextAction` -> `FollowUp.next_action`
- `followUp.updatedAt` -> `updated_at`
- `followUp.priority` and `followUp.owner` should remain on Lead as current assignment summary.

Must keep:

- Author, note/action, timestamp, parent record.

Later extensions:

- Call outcome, communication channel, reminder task, visibility to customer.

### Supplier

Purpose:

- Represents an approved service provider that can fulfill party services.

Key fields:

- `id`
- `name`
- `service_categories`
- `contact_name`
- `contact_email`
- `contact_phone`
- `status`
- `coverage_area`
- `created_at`
- `updated_at`

Relationships:

- May be created from SupplierApplication.
- Can be attached to packages, venues, quote line items, or orders later.

Demo mapping:

- Public supplier showcase and application pages indicate future supplier data, but local lead flow does not currently create supplier records.

Must keep:

- Supplier name, category, contact, approval status.

Later extensions:

- Availability, pricing, rating, contract, insurance, compliance files.

### SupplierApplication

Purpose:

- Captures a potential supplier's onboarding submission before approval.

Key fields:

- `id`
- `supplier_id`
- `applicant_name`
- `business_name`
- `contact`
- `service_categories`
- `documents_json`
- `status`
- `review_note`
- `reviewed_by_user_id`
- `submitted_at`
- `reviewed_at`

Relationships:

- May create or update Supplier after approval.
- Reviewed by admin.

Demo mapping:

- `/partner/apply` and `/partner/status` become supplier onboarding surfaces.

Must keep:

- Applicant/business identity, contact, service category, status.

Later extensions:

- Document verification, scoring, owner approval, audit trail.

### Package

Purpose:

- Represents a purchasable or quotable service bundle.

Key fields:

- `id`
- `theme_id`
- `name`
- `description`
- `base_price`
- `currency`
- `status`
- `included_items_json`

Relationships:

- Belongs to Theme.
- Used by Lead selection snapshots and Quote line items.

Demo mapping:

- `selection.packageId` -> `Package.id`
- `selection.packageName` -> package snapshot name.
- `pricing.packagePrice` -> package pricing snapshot.

Must keep:

- ID, name, base price, status.

Later extensions:

- Versioning, age bands, party size ranges, supplier cost model.

### Theme

Purpose:

- Represents the party concept/category selected by the customer.

Key fields:

- `id`
- `name`
- `slug`
- `description`
- `status`
- `media_json`

Relationships:

- Has many Packages.
- Can be compatible with Venues.

Demo mapping:

- `selection.themeId` -> `Theme.id`
- `selection.themeName` -> theme snapshot name.

Must keep:

- ID, name, status.

Later extensions:

- Age group, seasonality, inventory dependencies, localization.

### Venue

Purpose:

- Represents a location or venue option for party delivery.

Key fields:

- `id`
- `name`
- `address`
- `capacity`
- `base_fee`
- `status`
- `features_json`

Relationships:

- Can be selected by Lead/Quote.
- May be compatible with Theme and Package.

Demo mapping:

- Current local `sceneId`/`sceneName` can be treated as a scene/venue-like selection snapshot. Stage 2 should decide whether "scene" is a Venue, a layout, or a package context.
- `pricing.sceneFee` can become a venue/scene fee line item after server-side validation.

Must keep:

- ID, name, fee/capacity if venue is real.

Later extensions:

- Availability calendar, partner venue contract, location zones.

## 3. Lead / Quote / Order Boundary

Lead:

- A Lead is a customer inquiry or sales opportunity.
- It may include rough selection and pricing snapshots.
- It is not a binding quote and not a booking.
- Current `inquirySubmissions` records should first map to Lead.

Quote:

- A Quote is a formal or semi-formal priced proposal.
- It should be created from a qualified Lead or a customer request for a formal estimate.
- It can be revised, sent, accepted, rejected, expired, or converted to Order.
- A local `/quote` price preview is not automatically a Quote until saved/submitted to the backend contract.

Order:

- An Order is a committed booking/execution record.
- It should be created only after a Quote is accepted and the business is ready to track event delivery.
- Deposit/payment can be linked later, but payment is not part of this planning implementation.

Conversion rules:

- Lead -> Quote when the customer has enough contact data, event intent, and package/selection detail for a proposal.
- Quote -> Order when the customer accepts the quote and admin confirms it is ready for booking.
- Inquiry should not become Order when contact data is incomplete, pricing is only a preview, date/venue is not confirmed, or admin has not qualified the request.

Future `/admin/local-leads` mapping:

- Should become an authenticated admin Lead Queue.
- The first backend version should preserve the current operations shape: search, status filter, priority, owner, next action, and notes.

## 4. API Contract Draft

### `POST /api/leads`

Purpose:

- Create a Lead from a public inquiry or logged-in customer flow.

Request fields:

- `customer.name`
- `customer.contact`
- `preferred_event_date`
- `intake_notes`
- `selection`
- `pricing_snapshot`
- `source`

Return fields:

- `lead.id`
- `lead.status`
- `lead.submitted_at`
- `customer.id`

Auth:

- Anonymous allowed for public inquiry creation with rate limits and validation.
- Login optional.
- Admin not required.

Stage:

- Implement early in Stage 2.

Risk:

- Medium. Public endpoint needs spam protection and validation.

### `GET /api/leads`

Purpose:

- Admin lead queue list.

Request fields:

- Query: `status`, `owner_user_id`, `priority`, `search`, `created_from`, `created_to`, `limit`, `offset`.

Return fields:

- List of Lead summaries with customer contact, selection summary, status, priority, owner, timestamps.

Auth:

- Login required.
- Admin required.
- Anonymous forbidden.

Stage:

- Implement after Lead creation.

Risk:

- High if exposed without admin auth because it contains customer contact data.

### `GET /api/leads/:id`

Purpose:

- Fetch Lead detail.

Request fields:

- Path: `id`.

Return fields:

- Lead detail, Customer summary, selection snapshot, pricing snapshot, latest follow-ups.

Auth:

- Admin required for operations view.
- Customer view can be added later for own records only.
- Anonymous forbidden.

Stage:

- Implement with admin queue.

Risk:

- High due to personal contact and notes.

### `PATCH /api/leads/:id`

Purpose:

- Update Lead status, priority, owner, intake notes, or qualification fields.

Request fields:

- `status`
- `priority`
- `owner_user_id`
- `intake_notes`
- `qualified_reason`
- `unqualified_reason`

Return fields:

- Updated Lead.

Auth:

- Admin required.
- Anonymous forbidden.

Stage:

- Implement with admin queue.

Risk:

- High because bad updates can corrupt sales workflow.

### `POST /api/quotes`

Purpose:

- Create a formal Quote, usually from a qualified Lead.

Request fields:

- `lead_id`
- `customer_id`
- `selection`
- `line_items`
- `currency`
- `valid_until`
- `notes`

Return fields:

- `quote.id`
- `quote.quote_number`
- `quote.status`
- totals and line items.

Auth:

- Admin required for first backend version.
- Customer-created quote drafts can be considered later.
- Anonymous forbidden.

Stage:

- Plan after Lead API and admin queue.

Risk:

- Medium-high because pricing must be server-validated.

### `GET /api/quotes/:id`

Purpose:

- Fetch Quote detail.

Request fields:

- Path: `id`.

Return fields:

- Quote detail, line items, status, customer, lead reference.

Auth:

- Admin can access.
- Logged-in customer can access own quote.
- Anonymous forbidden unless a later signed share link is approved.

Stage:

- Implement with Quote draft API.

Risk:

- Medium-high due to pricing and customer data.

### `PATCH /api/quotes/:id`

Purpose:

- Update Quote status, expiry, notes, and draft line items.

Request fields:

- `status`
- `line_items`
- `valid_until`
- `notes`

Return fields:

- Updated Quote.

Auth:

- Admin required for most updates.
- Customer may accept/reject own quote in a later guarded endpoint.
- Anonymous forbidden.

Stage:

- Implement after Quote creation.

Risk:

- High if customers can mutate pricing or status without strict rules.

### `POST /api/orders`

Purpose:

- Create an Order from an accepted Quote.

Request fields:

- `quote_id`
- `event_date`
- `event_location`
- `notes`

Return fields:

- `order.id`
- `order.order_number`
- `order.status`
- linked quote/customer.

Auth:

- Admin required for first version.
- Anonymous forbidden.

Stage:

- Skeleton only in Stage 2; no payment integration.

Risk:

- High because it implies operational commitment.

### `GET /api/orders/:id`

Purpose:

- Fetch Order detail.

Request fields:

- Path: `id`.

Return fields:

- Order detail, quote summary, event status, amounts, deposit status placeholder.

Auth:

- Admin can access.
- Logged-in customer can access own order.
- Anonymous forbidden.

Stage:

- Skeleton after order creation.

Risk:

- High due to event and payment-adjacent data.

### `PATCH /api/orders/:id`

Purpose:

- Update Order status and operational metadata.

Request fields:

- `status`
- `event_date`
- `event_location`
- `internal_note`

Return fields:

- Updated Order.

Auth:

- Admin required.
- Supplier/customer update rights should wait for owner approval.
- Anonymous forbidden.

Stage:

- Skeleton only. Do not connect payment.

Risk:

- High because status affects fulfillment.

### `POST /api/follow-ups`

Purpose:

- Create a follow-up note/action for Lead, Quote, or Order.

Request fields:

- `lead_id`
- `quote_id`
- `order_id`
- `type`
- `note`
- `next_action`
- `due_at`

Return fields:

- FollowUp record with `id`, author, timestamps.

Auth:

- Admin required for operations notes.
- Anonymous forbidden.

Stage:

- Implement with admin lead queue.

Risk:

- Medium due to operational/customer notes.

### `GET /api/follow-ups?lead_id=`

Purpose:

- Fetch follow-up history for a Lead.

Request fields:

- Query: `lead_id`.

Return fields:

- List of FollowUp records sorted by created time.

Auth:

- Admin required.
- Customer visibility should be separate and filtered later.
- Anonymous forbidden.

Stage:

- Implement with follow-up creation.

Risk:

- Medium-high because notes may contain sensitive context.

## 5. Data State Flow

### Lead Status

| Status | Meaning | Who can modify |
|---|---|---|
| `new` | Newly created by backend, not yet reviewed. | System, admin |
| `pending` | Waiting for operational follow-up. | Admin |
| `contacted` | Customer has been contacted. | Admin |
| `qualified` | Enough intent/detail exists to prepare a quote. | Admin |
| `unqualified` | Not currently a viable opportunity. | Admin |
| `converted_to_quote` | A Quote has been created from this Lead. | System, admin |
| `closed` | No further action expected. | Admin |

### Quote Status

| Status | Meaning | Who can modify |
|---|---|---|
| `draft` | Quote is being prepared. | Admin |
| `sent` | Quote has been sent or made visible to customer. | Admin |
| `accepted` | Customer accepted the Quote. | Customer or admin-confirmed action |
| `rejected` | Customer rejected the Quote. | Customer or admin |
| `expired` | Quote validity ended. | System, admin |
| `converted_to_order` | Order has been created. | System, admin |

### Order Status

| Status | Meaning | Who can modify |
|---|---|---|
| `draft` | Order skeleton exists but is not committed. | Admin |
| `pending_deposit` | Waiting for deposit process. | Admin, system later |
| `deposit_paid` | Deposit recorded. | System later, admin manual override only with approval |
| `confirmed` | Booking is confirmed. | Admin |
| `in_progress` | Event preparation or fulfillment is underway. | Admin |
| `completed` | Event is completed. | Admin |
| `cancelled` | Order is cancelled. | Admin |

## 6. Permission Boundary

Anonymous users can:

- Submit public Lead inquiries through `POST /api/leads`.
- View public Theme, Package, Venue, and Supplier showcase data.

Logged-in customers can:

- View their own Leads, Quotes, and Orders.
- Request a quote.
- Accept or reject their own Quote in a later guarded endpoint.
- They must not see other customers' records.

Admins can:

- View and update Lead queue.
- Assign owner, priority, status, and follow-up records.
- Create and revise Quotes.
- Create Order skeletons from accepted Quotes.
- Manage SupplierApplication review when that module is approved.

Suppliers can:

- Submit or update their own application/profile after the supplier module is approved.
- View only assigned future fulfillment tasks after owner approval.
- They must not access customer lead queues by default.

Anonymous access must be forbidden for:

- `GET /api/leads`
- `GET /api/leads/:id`
- `PATCH /api/leads/:id`
- `POST /api/quotes`
- `GET /api/quotes/:id`
- `PATCH /api/quotes/:id`
- `POST /api/orders`
- `GET /api/orders/:id`
- `PATCH /api/orders/:id`
- `POST /api/follow-ups`
- `GET /api/follow-ups?lead_id=`

Owner approval required before opening:

- Customer self-serve quote acceptance.
- Supplier task access.
- Payment-adjacent order status changes.
- Any public quote share link.
- Any notification or outbound message trigger.

## 7. Stage 2 Implementation Order Recommendation

### Step 1: Schema / Migration Draft Only

Input:

- This contract plan.
- Existing local demo fields.
- Existing backend quote/order references.

Output:

- Migration draft or schema spec for Customer, Lead, Quote, Order, FollowUp, and reference links.

Acceptance:

- Field names, relationships, indexes, and status enums are reviewed before code changes.

Risk:

- Medium. Wrong object boundaries create future rework.

Codex auto-execution:

- Allowed only for draft docs/specs unless owner approves code changes.

### Step 2: Lead API Skeleton

Input:

- Approved Lead and Customer schema.
- Public inquiry payload from `inquirySubmissions`.

Output:

- `POST /api/leads`, `GET /api/leads`, `GET /api/leads/:id`, `PATCH /api/leads/:id`.

Acceptance:

- Anonymous can create Lead with validation.
- Admin can list, search, filter, and update Lead.
- No payment, webhook, or outbound message is triggered.

Risk:

- Medium-high. Public creation endpoint needs validation and rate limiting.

Codex auto-execution:

- Allowed after owner approves schema and endpoint scope.

### Step 3: Admin Lead Queue Backend Mapping

Input:

- Existing `/admin/local-leads` behavior.
- Lead API endpoints.

Output:

- Admin page contract for backend-backed lead queue.
- Current localStorage UI behavior mapped to backend fields.

Acceptance:

- Search, status filter, priority, owner, next action, and notes work against backend in a controlled local/staging mode.

Risk:

- Medium. Must avoid exposing customer data without admin auth.

Codex auto-execution:

- Allowed after API auth boundary is confirmed.

### Step 4: LocalStorage Demo to Backend Lead Bridge

Input:

- `/quote` inquiry payload.
- `POST /api/leads` contract.

Output:

- Controlled option to submit inquiry to backend in local/staging.
- Local-only fallback remains available for demos.

Acceptance:

- Demo can still run without backend.
- Backend mode creates Lead and returns ID.

Risk:

- Medium. Must avoid accidentally sending production data or external messages.

Codex auto-execution:

- Allowed only in local/staging mode and without production config changes.

### Step 5: Quote Draft API

Input:

- Qualified Lead.
- Selection and pricing snapshots.

Output:

- `POST /api/quotes`, `GET /api/quotes/:id`, `PATCH /api/quotes/:id`.

Acceptance:

- Admin can create a draft Quote from Lead.
- Pricing is server-side validated or clearly marked draft.
- Quote does not create Order automatically.

Risk:

- High if quote totals are trusted from the browser without validation.

Codex auto-execution:

- Allowed after pricing authority is defined.

### Step 6: Order Skeleton Without Payment

Input:

- Accepted Quote.
- Event date/location confirmation.

Output:

- `POST /api/orders`, `GET /api/orders/:id`, `PATCH /api/orders/:id`.

Acceptance:

- Order can be created only from accepted Quote.
- Payment fields remain placeholders.
- Stripe and deposit flows remain blocked.

Risk:

- High. Order status implies operational commitment.

Codex auto-execution:

- Allowed only after owner confirms no payment integration is included.

## 8. Explicit Out-of-Scope Items

Stage 2 planning and first implementation must not include:

- Stripe real payment.
- Webhook execution.
- n8n execution.
- Email, SMS, WhatsApp, or other outbound messages.
- Production deployment.
- `.env.production` modification.
- `frontend/vue-app/dist` submission.
- Complete supplier backend.
- Automatic supplier approval.
- Contract signing.
- Large-scale permission system.
- Full CRM automation.
- Public quote sharing without owner-approved security design.

## 9. Recommended Stage 2 Decision Gate

Before development starts, owner should confirm:

- Whether the first backend object is Lead only, or Lead plus Customer.
- Whether `/quote` should continue local-only until admin Lead Queue is ready.
- Which user role model already exists and can protect admin endpoints.
- Whether quote pricing can be trusted from existing frontend estimate or must be recalculated server-side.
- Whether Orders should be skeleton-only until payment is approved.

Recommended next action:

- Review and approve this contract plan.
- Then start Stage 2 with Step 1 only: schema / migration draft, no payment, no deployment, no external systems.
