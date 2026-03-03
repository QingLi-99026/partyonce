-- 紧急修复：同步数据库表结构与代码模型
-- 执行此脚本修复表结构不匹配问题

-- ============================================
-- 1. 删除旧表（如果存在结构冲突）
-- ============================================
-- 注意：这会删除数据，仅在开发环境使用！

DROP TABLE IF EXISTS partner_contract_acceptances;
DROP TABLE IF EXISTS partner_contracts;
DROP TABLE IF EXISTS entity_media_links;
DROP TABLE IF EXISTS media_assets;
DROP TABLE IF EXISTS template_bom;
DROP TABLE IF EXISTS template_3d_configs;
DROP TABLE IF EXISTS templates;
DROP TABLE IF EXISTS event_albums;
DROP TABLE IF EXISTS event_tasks;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS user_referrals;
DROP TABLE IF EXISTS share_events;
DROP TABLE IF EXISTS shares;
DROP TABLE IF EXISTS wallet_ledger;
DROP TABLE IF EXISTS wallets;
DROP TABLE IF EXISTS reward_rules;
DROP TABLE IF EXISTS supplier_scores;
DROP TABLE IF EXISTS partners;

-- ============================================
-- 2. 重建 partners 表（匹配代码模型）
-- ============================================
CREATE TABLE partners (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  company_legal_name VARCHAR(255) NULL,
  business_registration_number VARCHAR(64) NULL,
  tax_id VARCHAR(64) NULL,
  contact_name VARCHAR(128) NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(64) NOT NULL,
  business_type VARCHAR(64) NULL,
  service_categories JSON NULL,
  service_areas JSON NULL,
  business_license_url VARCHAR(1024) NULL,
  id_document_url VARCHAR(1024) NULL,
  portfolio_urls JSON NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'pending',
  rejection_reason VARCHAR(255) NULL,
  reviewed_by BIGINT NULL,
  reviewed_at DATETIME NULL,
  commission_rate DECIMAL(5,4) DEFAULT 0.10,
  settlement_cycle INT DEFAULT 7,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_partners_user (user_id),
  KEY idx_partners_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 3. 重建 contracts 表
-- ============================================
CREATE TABLE partner_contracts (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  version VARCHAR(32) NOT NULL,
  content_type VARCHAR(16) NOT NULL DEFAULT 'html',
  content_html LONGTEXT NULL,
  pdf_url VARCHAR(1024) NULL,
  status VARCHAR(16) NOT NULL DEFAULT 'active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_contract_title_version (title, version),
  KEY idx_contract_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE partner_contract_acceptances (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  partner_id BIGINT NOT NULL,
  contract_id BIGINT NOT NULL,
  accepted_by_user_id BIGINT NOT NULL,
  accepted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(64) NULL,
  user_agent VARCHAR(255) NULL,
  snapshot_version VARCHAR(32) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_partner_contract (partner_id, contract_id),
  KEY idx_accept_partner (partner_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 4. 重建 media 表
-- ============================================
CREATE TABLE media_assets (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  owner_type VARCHAR(32) NOT NULL,
  owner_id BIGINT NOT NULL,
  media_type VARCHAR(16) NOT NULL,
  mime_type VARCHAR(64) NOT NULL,
  storage_key VARCHAR(512) NOT NULL,
  url VARCHAR(1024) NOT NULL,
  cover_url VARCHAR(1024) NULL,
  width INT NULL,
  height INT NULL,
  duration_sec INT NULL,
  size_bytes BIGINT NOT NULL,
  checksum_hash VARCHAR(64) NULL,
  visibility VARCHAR(16) NOT NULL DEFAULT 'private',
  license_marketing BOOLEAN DEFAULT FALSE,
  status VARCHAR(16) NOT NULL DEFAULT 'uploaded',
  reject_reason VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_media_owner (owner_type, owner_id),
  KEY idx_media_type (media_type),
  KEY idx_media_visibility (visibility),
  KEY idx_media_status (status),
  UNIQUE KEY uk_storage_key (storage_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE entity_media_links (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  entity_type VARCHAR(32) NOT NULL,
  entity_id BIGINT NOT NULL,
  media_asset_id BIGINT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_entity_media (entity_type, entity_id, media_asset_id),
  KEY idx_entity (entity_type, entity_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 5. 重建 templates 表（匹配代码模型）
-- ============================================
CREATE TABLE templates (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  template_code VARCHAR(64) NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  category VARCHAR(64) NULL,
  subcategory VARCHAR(64) NULL,
  style_tags JSON NULL,
  suitable_for JSON NULL,
  guest_count_min INT NULL,
  guest_count_max INT NULL,
  budget_range_min INT NULL,
  budget_range_max INT NULL,
  base_price INT NULL,
  market_price INT NULL,
  cover_image_id BIGINT NULL,
  gallery_media_ids JSON NULL,
  preview_video_id BIGINT NULL,
  scene_config JSON NULL,
  status VARCHAR(16) NOT NULL DEFAULT 'published',
  is_recommended BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  view_count INT DEFAULT 0,
  order_count INT DEFAULT 0,
  rating_average DECIMAL(3,2) DEFAULT 5.00,
  rating_count INT DEFAULT 0,
  created_by VARCHAR(64) NULL,
  created_by_type VARCHAR(32) NULL,
  partner_id BIGINT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  published_at DATETIME NULL,
  KEY idx_templates_category (category),
  KEY idx_templates_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE template_3d_configs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  template_id BIGINT NOT NULL,
  three_scene_json LONGTEXT NOT NULL,
  asset_refs JSON NULL,
  lighting_preset JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_template_3d (template_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE template_bom (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  template_id BIGINT NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  qty INT NOT NULL DEFAULT 1,
  cost_estimate INT NOT NULL DEFAULT 0,
  category VARCHAR(64) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_bom_template (template_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 6. 重建 events 表
-- ============================================
CREATE TABLE events (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  order_id BIGINT NULL,
  template_id BIGINT NULL,
  venue_id BIGINT NULL,
  event_date DATE NULL,
  guest_count INT NULL,
  status VARCHAR(16) NOT NULL DEFAULT 'active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_events_user (user_id),
  KEY idx_events_date (event_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE event_albums (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  event_id BIGINT NOT NULL,
  media_asset_id BIGINT NOT NULL,
  caption VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_event_albums_event (event_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE event_tasks (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  event_id BIGINT NOT NULL,
  task_type VARCHAR(16) NOT NULL,
  status VARCHAR(16) NOT NULL DEFAULT 'pending',
  due_at DATETIME NOT NULL,
  completed_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_tasks_event (event_id),
  KEY idx_tasks_due (due_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 7. 重建 shares 表
-- ============================================
CREATE TABLE shares (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  share_code VARCHAR(32) NOT NULL,
  share_type VARCHAR(32) NULL,
  owner_user_id BIGINT NOT NULL,
  object_type VARCHAR(16) NOT NULL,
  object_id BIGINT NOT NULL,
  channel VARCHAR(16) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_share_code (share_code),
  KEY idx_shares_owner (owner_user_id),
  KEY idx_shares_object (object_type, object_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE share_events (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  share_id BIGINT NOT NULL,
  event_type VARCHAR(16) NOT NULL,
  user_id BIGINT NULL,
  order_id BIGINT NULL,
  ip_address VARCHAR(64) NULL,
  user_agent VARCHAR(255) NULL,
  device_id VARCHAR(64) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_share_events_share (share_id),
  KEY idx_share_events_type_time (event_type, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE user_referrals (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  share_id BIGINT NOT NULL,
  referred_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user_ref (user_id),
  KEY idx_ref_share (share_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 8. 重建 wallets 表（匹配代码模型）
-- ============================================
CREATE TABLE wallets (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  owner_id BIGINT NOT NULL,
  owner_type VARCHAR(32) NOT NULL,
  available_balance DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  frozen_balance DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  total_earned DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  total_withdrawn DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  currency VARCHAR(8) NOT NULL DEFAULT 'AUD',
  status VARCHAR(16) NOT NULL DEFAULT 'active',
  withdrawal_method VARCHAR(32) NULL,
  withdrawal_account VARCHAR(255) NULL,
  last_activity_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_wallet_owner (owner_id, owner_type),
  KEY idx_wallet_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE wallet_ledger (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  wallet_id BIGINT NOT NULL,
  transaction_type VARCHAR(32) NOT NULL,
  direction VARCHAR(16) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(8) NOT NULL DEFAULT 'AUD',
  balance_before DECIMAL(12,2) NOT NULL,
  balance_after DECIMAL(12,2) NOT NULL,
  description VARCHAR(255) NULL,
  reference_type VARCHAR(64) NULL,
  reference_id BIGINT NULL,
  reference_number VARCHAR(128) NULL,
  status VARCHAR(16) NOT NULL DEFAULT 'completed',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_ledger_wallet_time (wallet_id, created_at),
  KEY idx_ledger_ref (reference_type, reference_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE reward_rules (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  trigger_event_type VARCHAR(16) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  daily_cap INT NULL,
  per_share_cap INT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_rules_enabled (enabled),
  KEY idx_rules_trigger (trigger_event_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 9. 初始化数据
-- ============================================
INSERT INTO partner_contracts (title, version, content_html, status) VALUES
('PartyOnce 供应商合作协议', '1.0', '<h2>供应商合作协议</h2><p>1. 合作期限...</p>', 'active');

INSERT INTO reward_rules (trigger_event_type, amount, daily_cap, per_share_cap, enabled) VALUES
('click', 0.05, 10, NULL, TRUE),
('signup', 1.00, NULL, NULL, TRUE),
('deposit', 20.00, NULL, 1, TRUE);

-- ============================================
-- 10. 添加模板示例数据
-- ============================================
INSERT INTO templates (name, description, category, status, is_featured, base_price, market_price) VALUES
('中式婚礼经典方案', '传统中式婚礼布置，包含红毯、喜字、灯笼等元素', 'wedding', 'published', TRUE, 800, 1200),
('生日派对欢乐方案', '适合儿童和成人的生日派对布置', 'birthday', 'published', FALSE, 300, 500),
('企业年会大气方案', '适合企业年会、周年庆的正式布置', 'corporate', 'published', TRUE, 1500, 2000);

SELECT '数据库结构修复完成！' AS message;
