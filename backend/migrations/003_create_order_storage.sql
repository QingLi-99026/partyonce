-- PartyOnce Stage 2 Step 8.2
-- Migration: 003_create_order_storage
-- Scope: persistent Order skeleton storage only.
--
-- Safety boundary:
--   - Do not run against production without owner approval.
--   - Depends on 001_create_lead_storage.sql and 002_create_quote_storage.sql.
--   - Creates the orders table only.
--   - Requires an accepted Quote before Order skeleton creation at the API/service layer.
--   - Does not create payment, Stripe, webhook, n8n, supplier assignment, contract, or outbound messaging tables.
--   - deposit_status and payment_reference are placeholders only; this migration does not enable payment.
--   - Intended first dry run target: local/staging SQLite under /tmp.
--   - Review MySQL compatibility before any MySQL execution.

PRAGMA foreign_keys = ON;

-- ============================================================
-- 003_create_orders
-- ============================================================

CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY,
    quote_id INTEGER NOT NULL,
    lead_id INTEGER NOT NULL,
    customer_id INTEGER NOT NULL,
    order_number VARCHAR(80) NOT NULL,
    status VARCHAR(40) DEFAULT 'draft' NOT NULL,
    event_date DATE,
    event_location VARCHAR(255),
    currency CHAR(3) DEFAULT 'AUD' NOT NULL,
    total_amount DECIMAL(12, 2) DEFAULT 0.00 NOT NULL,
    deposit_amount DECIMAL(12, 2) DEFAULT 0.00 NOT NULL,
    deposit_status VARCHAR(40) DEFAULT 'not_started' NOT NULL,
    payment_reference VARCHAR(160),
    selection_snapshot_json TEXT,
    line_items_json TEXT,
    customer_snapshot_json TEXT,
    internal_notes TEXT,
    created_by_user_id INTEGER,
    confirmed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_orders_order_number
        UNIQUE (order_number),
    CONSTRAINT uq_orders_quote_id
        UNIQUE (quote_id),
    CONSTRAINT fk_orders_quote_id
        FOREIGN KEY (quote_id)
        REFERENCES quotes (id),
    CONSTRAINT fk_orders_lead_id
        FOREIGN KEY (lead_id)
        REFERENCES leads (id),
    CONSTRAINT fk_orders_customer_id
        FOREIGN KEY (customer_id)
        REFERENCES customers (id),
    CONSTRAINT ck_orders_status
        CHECK (status IN (
            'draft',
            'pending_deposit',
            'confirmed',
            'in_progress',
            'completed',
            'cancelled'
        )),
    CONSTRAINT ck_orders_deposit_status
        CHECK (deposit_status IN (
            'not_started',
            'pending',
            'paid',
            'failed',
            'refunded',
            'waived'
        )),
    CONSTRAINT ck_orders_currency
        CHECK (length(currency) = 3),
    CONSTRAINT ck_orders_total_amount_non_negative
        CHECK (total_amount >= 0),
    CONSTRAINT ck_orders_deposit_amount_non_negative
        CHECK (deposit_amount >= 0)
);

CREATE INDEX IF NOT EXISTS idx_orders_quote_id
    ON orders (quote_id);

CREATE INDEX IF NOT EXISTS idx_orders_lead_id
    ON orders (lead_id);

CREATE INDEX IF NOT EXISTS idx_orders_customer_id
    ON orders (customer_id);

CREATE INDEX IF NOT EXISTS idx_orders_status
    ON orders (status);

CREATE INDEX IF NOT EXISTS idx_orders_created_at
    ON orders (created_at);

CREATE INDEX IF NOT EXISTS idx_orders_customer_status
    ON orders (customer_id, status);

CREATE INDEX IF NOT EXISTS idx_orders_lead_status
    ON orders (lead_id, status);
