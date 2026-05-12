-- PartyOnce Stage 2 Step 6.4A
-- Migration: 002_create_quote_storage
-- Scope: persistent Quote storage only.
--
-- Safety boundary:
--   - Do not run against production without owner approval.
--   - Depends on 001_create_lead_storage.sql.
--   - Creates the quotes table only.
--   - Uses line_items_json for the first Quote skeleton.
--   - Does not create quote_items, Order, payment, Stripe, webhook, n8n, or outbound messaging tables.
--   - Intended first dry run target: local/staging SQLite under /tmp.
--   - Review MySQL compatibility before any MySQL execution.

PRAGMA foreign_keys = ON;

-- ============================================================
-- 002_create_quotes
-- ============================================================

CREATE TABLE IF NOT EXISTS quotes (
    id INTEGER PRIMARY KEY,
    lead_id INTEGER NOT NULL,
    customer_id INTEGER NOT NULL,
    quote_number VARCHAR(80) NOT NULL,
    status VARCHAR(40) DEFAULT 'draft' NOT NULL,
    currency CHAR(3) DEFAULT 'AUD' NOT NULL,
    subtotal DECIMAL(12, 2) DEFAULT 0.00 NOT NULL,
    discount_total DECIMAL(12, 2) DEFAULT 0.00 NOT NULL,
    tax_total DECIMAL(12, 2) DEFAULT 0.00 NOT NULL,
    final_total DECIMAL(12, 2) DEFAULT 0.00 NOT NULL,
    line_items_json TEXT,
    selection_snapshot_json TEXT,
    valid_until DATETIME,
    owner_user_id INTEGER,
    owner_label VARCHAR(120),
    next_action TEXT,
    internal_note TEXT,
    sent_at DATETIME,
    accepted_at DATETIME,
    created_by_user_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_quotes_quote_number
        UNIQUE (quote_number),
    CONSTRAINT fk_quotes_lead_id
        FOREIGN KEY (lead_id)
        REFERENCES leads (id),
    CONSTRAINT fk_quotes_customer_id
        FOREIGN KEY (customer_id)
        REFERENCES customers (id),
    CONSTRAINT ck_quotes_status
        CHECK (status IN (
            'draft',
            'sent',
            'accepted',
            'rejected',
            'expired',
            'converted_to_order'
        )),
    CONSTRAINT ck_quotes_currency
        CHECK (length(currency) = 3)
);

CREATE INDEX IF NOT EXISTS idx_quotes_lead_id
    ON quotes (lead_id);

CREATE INDEX IF NOT EXISTS idx_quotes_customer_id
    ON quotes (customer_id);

CREATE INDEX IF NOT EXISTS idx_quotes_status
    ON quotes (status);

CREATE INDEX IF NOT EXISTS idx_quotes_created_at
    ON quotes (created_at);

CREATE INDEX IF NOT EXISTS idx_quotes_lead_status
    ON quotes (lead_id, status);

CREATE INDEX IF NOT EXISTS idx_quotes_customer_status
    ON quotes (customer_id, status);
