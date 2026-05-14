-- PartyOnce Quote Line Item Backend Persistence Skeleton V1
-- Migration: 004_create_quote_line_item_storage
-- Scope: local/staging Quote line item draft persistence only.
--
-- Safety boundary:
--   - Do not run against production without owner approval.
--   - Depends on 001_create_lead_storage.sql and 002_create_quote_storage.sql.
--   - Creates quote_line_items only.
--   - Does not create invoice, contract, payment, Stripe, webhook, n8n, or outbound messaging tables.
--   - Intended dry-run target: local/staging SQLite under /tmp.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS quote_line_items (
    id INTEGER PRIMARY KEY,
    quote_id INTEGER NOT NULL,
    client_item_id VARCHAR(120),
    schema_version VARCHAR(80) DEFAULT 'quote_line_items_v1' NOT NULL,
    line_item_type VARCHAR(40) NOT NULL,
    label VARCHAR(180) NOT NULL,
    amount DECIMAL(12, 2) DEFAULT 0.00 NOT NULL,
    amount_basis TEXT,
    customer_explanation TEXT,
    admin_edit_hint TEXT,
    party_scene_config_path VARCHAR(160),
    is_optional INTEGER DEFAULT 0 NOT NULL,
    is_selected INTEGER DEFAULT 1 NOT NULL,
    display_order INTEGER DEFAULT 0 NOT NULL,
    raw_json TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_quote_line_items_quote_id
        FOREIGN KEY (quote_id)
        REFERENCES quotes (id)
        ON DELETE CASCADE,
    CONSTRAINT ck_quote_line_items_type
        CHECK (line_item_type IN (
            'venue_fee',
            'decor_fee',
            'supplier_fee',
            'labor_fee',
            'transport_fee',
            'service_fee',
            'optional_upgrade'
        )),
    CONSTRAINT ck_quote_line_items_amount_non_negative
        CHECK (amount >= 0),
    CONSTRAINT ck_quote_line_items_is_optional
        CHECK (is_optional IN (0, 1)),
    CONSTRAINT ck_quote_line_items_is_selected
        CHECK (is_selected IN (0, 1))
);

CREATE INDEX IF NOT EXISTS idx_quote_line_items_quote_id
    ON quote_line_items (quote_id);

CREATE INDEX IF NOT EXISTS idx_quote_line_items_quote_order
    ON quote_line_items (quote_id, display_order, id);

CREATE INDEX IF NOT EXISTS idx_quote_line_items_type
    ON quote_line_items (line_item_type);
