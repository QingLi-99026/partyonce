const DRY_RUN_LOG_KEY = 'partyonce_notification_dry_run_evidence_v1'

export const notificationTriggers = [
  {
    id: 'lead_created',
    label: 'Lead created',
    audience: 'operations',
    channel: 'n8n_webhook',
    condition: 'A new inquiry / Lead enters local staging storage.',
    template: 'New PartyOnce lead {{lead.lead_number}} from {{customer.name}} needs triage.',
    severity: 'info'
  },
  {
    id: 'quote_sent',
    label: 'Quote sent',
    audience: 'customer',
    channel: 'email',
    condition: 'Admin marks a Quote as sent.',
    template: 'Your PartyOnce quote {{quote.quote_number}} is ready. Total: {{quote.amount}} {{quote.currency}}.',
    severity: 'info'
  },
  {
    id: 'order_pending_deposit',
    label: 'Order pending deposit',
    audience: 'customer',
    channel: 'email',
    condition: 'Order moves to pending_deposit business status.',
    template: 'Your PartyOnce order {{order.order_number}} is prepared. Deposit remains test-mode/readiness only.',
    severity: 'warning'
  },
  {
    id: 'supplier_application_reviewed',
    label: 'Supplier application reviewed',
    audience: 'supplier',
    channel: 'email',
    condition: 'Admin updates supplier application status or review note.',
    template: 'Your supplier application {{supplier.company_name}} is now {{supplier.status}}.',
    severity: 'info'
  }
]

const clone = (value) => JSON.parse(JSON.stringify(value))

const sampleContext = {
  lead: {
    id: 'lead-local-1001',
    lead_number: 'PO-L-1001',
    source: 'local/staging',
    status: 'new'
  },
  customer: {
    id: 'customer-local-41',
    name: 'Ava Thompson',
    contact: 'ava.parent@example.test',
    preferred_contact_method: 'email'
  },
  quote: {
    id: 'quote-local-501',
    quote_number: 'PE-Q-0501',
    status: 'sent',
    amount: 1680,
    currency: 'AUD',
    valid_until: '2026-05-25'
  },
  order: {
    id: 'order-local-1001',
    order_number: 'PE-O-1001',
    status: 'pending_deposit',
    total_amount: 1680,
    deposit_amount: 420,
    currency: 'AUD'
  },
  supplier: {
    id: 'partner-local-1001',
    company_name: 'Little Star Styling',
    status: 'approved',
    review_note: 'Approved in local/staging dry-run.'
  }
}

const readLog = () => {
  if (typeof window === 'undefined') return []
  try {
    const parsed = JSON.parse(window.localStorage.getItem(DRY_RUN_LOG_KEY) || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    return []
  }
}

const writeLog = (items) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(DRY_RUN_LOG_KEY, JSON.stringify(items))
}

const resolvePath = (context, path) => {
  return path.split('.').reduce((value, key) => value?.[key], context) ?? ''
}

export const renderDryRunTemplate = (template, context = sampleContext) => {
  return String(template || '').replace(/\{\{\s*([^}]+)\s*\}\}/g, (_, path) => String(resolvePath(context, path.trim())))
}

export const buildDryRunPayload = (triggerId, context = sampleContext) => {
  const trigger = notificationTriggers.find((item) => item.id === triggerId) || notificationTriggers[0]
  const renderedMessage = renderDryRunTemplate(trigger.template, context)
  return {
    dry_run: true,
    dispatch_blocked: true,
    event_id: `dryrun-${trigger.id}-${Date.now()}`,
    event_type: trigger.id,
    channel: trigger.channel,
    audience: trigger.audience,
    severity: trigger.severity,
    condition: trigger.condition,
    template: trigger.template,
    rendered_message: renderedMessage,
    context: clone(context),
    target: {
      webhook_url: null,
      n8n_workflow_id: null,
      email_to: trigger.audience === 'customer' ? context.customer.contact : null,
      sms_to: null,
      whatsapp_to: null
    },
    blocked_reasons: [
      'Dry-run mode only.',
      'No webhook URL is configured.',
      'No n8n workflow execution is allowed.',
      'No email, SMS, or WhatsApp provider is connected.'
    ],
    created_at: new Date().toISOString()
  }
}

export const runNotificationDryRun = (triggerId) => {
  const payload = buildDryRunPayload(triggerId)
  const log = readLog()
  const nextLog = [payload, ...log].slice(0, 50)
  writeLog(nextLog)
  return payload
}

export const listNotificationDryRunEvidence = () => readLog()

export const clearNotificationDryRunEvidence = () => {
  writeLog([])
  return []
}
