# Party Event / Party Activities Payment Readiness and Blockers

Date: 2026-05-12

Project name for new planning: Party Event / Party Activities

Historical repository path: `/Users/aiagentkevin/.openclaw/workspace/projects/PartyOnce`

## Current Decision

Payment is not connected in the final delivery candidate.

The current Stage 2 flow stops at a local/staging-only Order skeleton:

```text
Lead -> Quote -> accepted Quote -> Order skeleton -> pending_deposit status
```

`pending_deposit` is a business lifecycle status only. It is not proof of payment, does not create a checkout session, does not create a PaymentIntent, and does not mark any deposit as paid.

## Explicit Blockers

- No real Stripe integration in this candidate.
- No real payment collection.
- No PaymentIntent creation.
- No checkout session creation.
- No webhook or n8n trigger.
- No email, SMS, WhatsApp, or outbound notification.
- No production deployment.
- No production database migration.
- No `.env.production` read or modification.
- No `frontend/vue-app/dist` submission.

## Future Payment Entry Point

The future payment entry point should be from a customer-facing Order surface, such as:

- My Orders
- Order Detail
- Customer payment handoff screen

Payment should not be initiated automatically by accepting a Quote or creating an Order skeleton.

## Required Future Approval

Owner approval is required before any of the following:

- Stripe test mode credentials are configured.
- Any `.env` payment key is read, added, or changed.
- A payment API endpoint is implemented.
- A checkout or PaymentIntent flow is enabled.
- Any webhook endpoint is enabled.
- n8n is allowed to consume payment or order lifecycle events.
- Payment success, cancel, or failure behavior is connected to Order status.

## Future Dry-run Sequence

Recommended future sequence:

1. Payment contract design only.
2. Local dry-run endpoint shape review.
3. Stripe test mode design review.
4. Owner approval for test credentials.
5. Local/staging test mode implementation.
6. Success, cancel, and failed payment browser acceptance.
7. Webhook dry-run review.
8. Owner approval before any real webhook or production deployment.

## Required Behavior Before Payment Can Be Enabled

- Order must exist before payment begins.
- Payment must be linked to an Order, not directly to a Quote.
- Quote acceptance can create an Order skeleton, but cannot collect payment.
- `deposit_status` must remain explicit and separate from `status`.
- `pending_deposit` must not be treated as `deposit_paid`.
- Failed payment must not confirm an Order.
- Cancelled checkout must leave the Order recoverable.
- Webhook replay and idempotency must be designed before any webhook is enabled.

## Current Final Candidate Boundary

The current final delivery candidate is suitable for local/staging business review of:

- Lead persistence
- Admin Lead Queue
- Quote creation and status management
- accepted Quote to Order skeleton
- Admin Order Queue and Detail
- Order status review

It is not suitable for payment, production launch, deployment, or real customer collection.

