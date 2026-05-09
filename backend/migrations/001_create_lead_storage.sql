-- PartyOnce Stage 2 Step 5.2
-- Migration: 001_create_lead_storage
-- Scope: persistent Customer, Lead, and FollowUp storage only.
--
-- Safety boundary:
--   - Do not run against production without owner approval.
--   - Does not create Quote or Order tables.
--   - Does not add payment, Stripe, webhook, n8n, or outbound messaging tables.
--   - Intended first dry run target: local/staging SQLite.
--   - Review MySQL compatibility before any MySQL execution.

PRAGMA foreign_keys = ON;

-- ============================================================
-- 001_create_customers
-- ============================================================

CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY,
    name VARCHAR(160) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    wechat_or_other_contact VARCHAR(160),
    preferred_contact_method VARCHAR(40),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_customers_email
    ON customers (email);

CREATE INDEX IF NOT EXISTS idx_customers_phone
    ON customers (phone);

CREATE INDEX IF NOT EXISTS idx_customers_other_contact
    ON customers (wechat_or_other_contact);

-- ============================================================
-- 002_create_leads
-- ============================================================

CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY,
    customer_id INTEGER NOT NULL,
    source VARCHAR(80) DEFAULT 'web_quote' NOT NULL,
    status VARCHAR(40) DEFAULT 'new' NOT NULL,
    priority VARCHAR(20) DEFAULT 'Medium' NOT NULL,
    owner_user_id INTEGER,
    preferred_event_date DATE,
    intake_notes TEXT,
    selection_snapshot_json TEXT,
    pricing_snapshot_json TEXT,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_leads_customer_id
        FOREIGN KEY (customer_id)
        REFERENCES customers (id),
    CONSTRAINT ck_leads_status
        CHECK (status IN (
            'new',
            'pending',
            'contacted',
            'qualified',
            'unqualified',
            'converted_to_quote',
            'closed'
        )),
    CONSTRAINT ck_leads_priority
        CHECK (priority IN ('High', 'Medium', 'Low'))
);

CREATE INDEX IF NOT EXISTS idx_leads_customer_id
    ON leads (customer_id);

CREATE INDEX IF NOT EXISTS idx_leads_status
    ON leads (status);

CREATE INDEX IF NOT EXISTS idx_leads_owner_user_id
    ON leads (owner_user_id);

CREATE INDEX IF NOT EXISTS idx_leads_priority
    ON leads (priority);

CREATE INDEX IF NOT EXISTS idx_leads_submitted_at
    ON leads (submitted_at);

CREATE INDEX IF NOT EXISTS idx_leads_status_owner_submitted
    ON leads (status, owner_user_id, submitted_at);

-- ============================================================
-- 003_create_follow_ups
-- ============================================================

CREATE TABLE IF NOT EXISTS follow_ups (
    id INTEGER PRIMARY KEY,
    lead_id INTEGER NOT NULL,
    author_user_id INTEGER,
    type VARCHAR(60) DEFAULT 'note' NOT NULL,
    note TEXT,
    next_action VARCHAR(255),
    due_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_follow_ups_lead_id
        FOREIGN KEY (lead_id)
        REFERENCES leads (id)
);

CREATE INDEX IF NOT EXISTS idx_follow_ups_lead_id
    ON follow_ups (lead_id);

CREATE INDEX IF NOT EXISTS idx_follow_ups_created_at
    ON follow_ups (created_at);

CREATE INDEX IF NOT EXISTS idx_follow_ups_lead_created
    ON follow_ups (lead_id, created_at);
