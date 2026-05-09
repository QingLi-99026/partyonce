-- PartyOnce Stage 2 Step 5.1 Lead Storage Migration Draft
-- Date: 2026-05-10
-- Scope: draft only; do not execute without owner approval.
--
-- Purpose:
--   Create persistent Customer, Lead, and FollowUp storage for the existing
--   POST /api/leads skeleton and admin lead queue.
--
-- Boundaries:
--   - Draft only, not a backend migration file yet.
--   - Do not run against production.
--   - Do not create Quote or Order tables.
--   - Do not add payment, Stripe, webhook, n8n, or outbound messaging tables.
--   - Do not rely on this draft until the final database target is confirmed.
--
-- Compatibility notes:
--   - Uses conservative SQL types that are easy to adapt for SQLite/MySQL.
--   - JSON snapshots are represented as TEXT for first-pass portability.
--   - Timestamp defaults may need database-specific adjustment before execution.

-- ============================================================
-- 001_create_customers
-- ============================================================

CREATE TABLE customers (
    id INTEGER PRIMARY KEY,
    name VARCHAR(160) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    wechat_or_other_contact VARCHAR(160),
    preferred_contact_method VARCHAR(40),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_customers_email
    ON customers (email);

CREATE INDEX idx_customers_phone
    ON customers (phone);

CREATE INDEX idx_customers_other_contact
    ON customers (wechat_or_other_contact);

-- ============================================================
-- 002_create_leads
-- ============================================================

CREATE TABLE leads (
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

CREATE INDEX idx_leads_customer_id
    ON leads (customer_id);

CREATE INDEX idx_leads_status
    ON leads (status);

CREATE INDEX idx_leads_owner_user_id
    ON leads (owner_user_id);

CREATE INDEX idx_leads_priority
    ON leads (priority);

CREATE INDEX idx_leads_submitted_at
    ON leads (submitted_at);

CREATE INDEX idx_leads_status_owner_submitted
    ON leads (status, owner_user_id, submitted_at);

-- ============================================================
-- 003_create_follow_ups
-- ============================================================

CREATE TABLE follow_ups (
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

CREATE INDEX idx_follow_ups_lead_id
    ON follow_ups (lead_id);

CREATE INDEX idx_follow_ups_created_at
    ON follow_ups (created_at);

CREATE INDEX idx_follow_ups_lead_created
    ON follow_ups (lead_id, created_at);

-- ============================================================
-- 004_add_lead_indexes_and_constraints
-- ============================================================
-- Included above for draft review simplicity.
-- Before execution, split into separate migration files if owner wants
-- a migration chain matching:
--   001_create_customers
--   002_create_leads
--   003_create_follow_ups
--   004_add_lead_indexes_and_constraints

-- ============================================================
-- Rollback draft
-- ============================================================
-- DROP TABLE follow_ups;
-- DROP TABLE leads;
-- DROP TABLE customers;
