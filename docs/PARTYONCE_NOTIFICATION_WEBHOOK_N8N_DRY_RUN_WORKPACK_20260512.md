# PartyOnce Notification / Webhook / n8n Dry-Run Workpack 20260512

## 1. Workpack Goal

Design notification, webhook, and n8n dry-run payloads without triggering any real external dispatch.

This workpack covers:

- trigger conditions;
- payload schema;
- message templates;
- rendered message preview;
- dry-run evidence;
- local/staging admin review surface.

## 2. Modified / Added Files

- `frontend/vue-app/src/services/notificationDryRunService.js`
- `frontend/vue-app/src/views/AdminNotificationDryRun.vue`
- `frontend/vue-app/src/router/index.js`
- `frontend/vue-app/src/components/NavHeader.vue`
- `docs/PARTYONCE_NOTIFICATION_WEBHOOK_N8N_DRY_RUN_WORKPACK_20260512.md`

## 3. Trigger Catalog

The dry-run catalog includes:

| Trigger | Audience | Channel plan | Condition |
|---|---|---|---|
| `lead_created` | operations | `n8n_webhook` | A new inquiry / Lead enters local staging storage. |
| `quote_sent` | customer | `email` | Admin marks a Quote as sent. |
| `order_pending_deposit` | customer | `email` | Order moves to pending_deposit business status. |
| `supplier_application_reviewed` | supplier | `email` | Admin updates supplier application status or review note. |

## 4. Payload Shape

Dry-run payload fields:

```json
{
  "dry_run": true,
  "dispatch_blocked": true,
  "event_id": "dryrun-...",
  "event_type": "quote_sent",
  "channel": "email",
  "audience": "customer",
  "severity": "info",
  "condition": "Admin marks a Quote as sent.",
  "template": "Your PartyOnce quote {{quote.quote_number}} is ready.",
  "rendered_message": "Your PartyOnce quote PE-Q-0501 is ready.",
  "context": {},
  "target": {
    "webhook_url": null,
    "n8n_workflow_id": null,
    "email_to": "ava.parent@example.test",
    "sms_to": null,
    "whatsapp_to": null
  },
  "blocked_reasons": [],
  "created_at": "ISO timestamp"
}
```

## 5. Templates

Templates use `{{path.to.value}}` placeholders and are rendered against a local/staging sample context.

Examples:

- `New PartyOnce lead {{lead.lead_number}} from {{customer.name}} needs triage.`
- `Your PartyOnce quote {{quote.quote_number}} is ready. Total: {{quote.amount}} {{quote.currency}}.`
- `Your PartyOnce order {{order.order_number}} is prepared. Deposit remains test-mode/readiness only.`
- `Your supplier application {{supplier.company_name}} is now {{supplier.status}}.`

## 6. Dry-Run Evidence

Evidence is written only to browser localStorage:

```text
partyonce_notification_dry_run_evidence_v1
```

The Admin page is:

```text
/admin/notifications/dry-run
```

It supports:

- selecting a trigger;
- previewing payload JSON;
- generating dry-run evidence;
- viewing evidence rows;
- clearing local evidence.

## 7. Safety Boundary

This workpack does not:

- call a webhook URL;
- execute n8n;
- send email;
- send SMS;
- send WhatsApp;
- modify production config;
- deploy;
- push.

All payload targets are null or local placeholders.

## 8. Validation Result

### SFC / JS Checks

SFC parse passed for:

```text
frontend/vue-app/src/views/AdminNotificationDryRun.vue
frontend/vue-app/src/components/NavHeader.vue
```

JS syntax check passed for:

```text
frontend/vue-app/src/services/notificationDryRunService.js
```

`git diff --check` passed for the workpack files.

### Browser Smoke

Local Vite server:

```text
http://127.0.0.1:4178/
```

Checked route:

```text
/admin/notifications/dry-run 200
```

Functional checks:

```text
Main page rendered: yes
Dry-run evidence saved locally: yes
Blocked dispatch copy visible: yes
Browser console errors: 0
```

## 9. Environment / Build Boundary

- `.env.production` was not read or modified.
- `frontend/vue-app/dist` was not submitted.
- No external URL was called.
- No production database was used.

## 10. Blockers

No blocker for dry-run design.

Real notification execution remains blocked until a separate workpack defines provider credentials, webhook signing, n8n workflow ids, retry rules, idempotency, audit logs, and opt-out/compliance handling.

## 11. Commit Hash

Recorded in final handoff after local commit.

## 12. Next Step

Create a backend dry-run API skeleton that stores notification audit records in local/staging SQLite without dispatching, then compare frontend dry-run payloads against backend schema.
