-- PartyOnce Stage 2 Step 5.3 Lead Storage MySQL Draft
-- Date: 2026-05-10
-- Scope: MySQL compatibility draft only; do not execute without owner approval.
--
-- Purpose:
--   MySQL-compatible version of backend/migrations/001_create_lead_storage.sql.
--
-- Boundaries:
--   - Review artifact only.
--   - Not placed in backend/migrations.
--   - Do not run against production.
--   - Does not create Quote or Order tables.
--   - Does not add payment, Stripe, webhook, n8n, or outbound messaging tables.

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- 001_create_customers
-- ============================================================

CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(160) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    wechat_or_other_contact VARCHAR(160),
    preferred_contact_method VARCHAR(40),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    INDEX idx_customers_email (email),
    INDEX idx_customers_phone (phone),
    INDEX idx_customers_other_contact (wechat_or_other_contact)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 002_create_leads
-- ============================================================

CREATE TABLE IF NOT EXISTS leads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    source VARCHAR(80) DEFAULT 'web_quote' NOT NULL,
    status VARCHAR(40) DEFAULT 'new' NOT NULL,
    priority VARCHAR(20) DEFAULT 'Medium' NOT NULL,
    owner_user_id INT,
    preferred_event_date DATE,
    intake_notes TEXT,
    selection_snapshot_json JSON,
    pricing_snapshot_json JSON,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
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
        CHECK (priority IN ('High', 'Medium', 'Low')),
    INDEX idx_leads_customer_id (customer_id),
    INDEX idx_leads_status (status),
    INDEX idx_leads_owner_user_id (owner_user_id),
    INDEX idx_leads_priority (priority),
    INDEX idx_leads_submitted_at (submitted_at),
    INDEX idx_leads_status_owner_submitted (status, owner_user_id, submitted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 003_create_follow_ups
-- ============================================================

CREATE TABLE IF NOT EXISTS follow_ups (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lead_id INT NOT NULL,
    author_user_id INT,
    type VARCHAR(60) DEFAULT 'note' NOT NULL,
    note TEXT,
    next_action VARCHAR(255),
    due_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_follow_ups_lead_id
        FOREIGN KEY (lead_id)
        REFERENCES leads (id),
    INDEX idx_follow_ups_lead_id (lead_id),
    INDEX idx_follow_ups_created_at (created_at),
    INDEX idx_follow_ups_lead_created (lead_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Rollback draft
-- ============================================================
-- DROP TABLE follow_ups;
-- DROP TABLE leads;
-- DROP TABLE customers;
