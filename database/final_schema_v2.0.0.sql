-- PartyOnce 完整数据库Schema (统一字段命名版)
-- 生成时间: 2026-03-03
-- 版本: v2.0.0-final
-- 说明: 此脚本为唯一真相，后续修改请使用patch migration

-- ============================================
-- 使用说明:
-- 1. 首次部署: 直接执行此脚本
-- 2. 后续修改: 使用 database/patches/ 下的ALTER脚本
-- 3. 禁止直接修改此脚本，保持版本一致性
-- ============================================

SET FOREIGN_KEY_CHECKS = 0;
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
DROP TABLE IF EXISTS ai_plans;
DROP TABLE IF EXISTS designs;
DROP TABLE IF EXISTS quotes;
DROP TABLE IF EXISTS quote_items;
DROP TABLE IF EXISTS venues;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- 1. 用户表
-- ============================================
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  user_type VARCHAR(50) DEFAULT 'personal',
  role VARCHAR(50) DEFAULT 'user',
  phone VARCHAR(50) NULL,
  company_name VARCHAR(255) NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 2. 供应商表
-- ============================================
CREATE TABLE partners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  company_name VARCHAR(255) NOT NULL,
  company_legal_name VARCHAR(255) NULL,
  business_registration_number VARCHAR(100) NULL,
  tax_id VARCHAR(100) NULL,
  contact_name VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(50) NOT NULL,
  business_type VARCHAR(100) NULL,
  service_categories JSON NULL,
  service_areas JSON NULL,
  business_license_url VARCHAR(500) NULL,
  id_document_url VARCHAR(500) NULL,
  portfolio_urls JSON NULL,
  status VARCHAR(50) DEFAULT 'pending',
  rejection_reason TEXT NULL,
  reviewed_by INT NULL,
  reviewed_at DATETIME NULL,
  commission_rate DECIMAL(5,4) DEFAULT 0.10,
  settlement_cycle VARCHAR(50) DEFAULT 'monthly',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 3. 合同表
-- ============================================
CREATE TABLE partner_contracts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  contract_code VARCHAR(100) NOT NULL UNIQUE,
  version VARCHAR(20) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  content TEXT NOT NULL,
  content_url VARCHAR(500) NULL,
  contract_type VARCHAR(50) DEFAULT 'general',
  effective_date DATETIME NOT NULL,
  expiry_date DATETIME NULL,
  is_active BOOLEAN DEFAULT TRUE,
  is_mandatory BOOLEAN DEFAULT TRUE,
  variables_schema JSON NULL,
  created_by INT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 4. 合同签署记录表
-- ============================================
CREATE TABLE partner_contract_acceptances (
  id INT AUTO_INCREMENT PRIMARY KEY,
  partner_id INT NOT NULL,
  contract_id INT NOT NULL,
  contract_version VARCHAR(20) NOT NULL,
  contract_content_snapshot TEXT NOT NULL,
  variables_values JSON NULL,
  accepted_at DATETIME NULL,
  accepted_ip VARCHAR(45) NULL,
  accepted_user_agent TEXT NULL,
  signature_image_url VARCHAR(500) NULL,
  digital_signature_hash VARCHAR(255) NULL,
  status VARCHAR(50) DEFAULT 'active',
  revoked_at DATETIME NULL,
  revocation_reason TEXT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 5. 媒体资产表
-- ============================================
CREATE TABLE media_assets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  file_name VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NULL,
  file_path VARCHAR(500) NOT NULL,
  public_url VARCHAR(500) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_category VARCHAR(50) NULL,
  file_size_bytes INT NOT NULL,
  file_size_human VARCHAR(50) NULL,
  width_px INT NULL,
  height_px INT NULL,
  duration_seconds DECIMAL(8,2) NULL,
  thumbnail_url VARCHAR(500) NULL,
  thumbnail_width INT NULL,
  thumbnail_height INT NULL,
  upload_status VARCHAR(50) DEFAULT 'pending',
  uploaded_by INT NULL,
  uploaded_at DATETIME NULL,
  uploaded_ip VARCHAR(45) NULL,
  storage_provider VARCHAR(50) DEFAULT 'r2',
  storage_bucket VARCHAR(100) NULL,
  storage_region VARCHAR(50) NULL,
  storage_etag VARCHAR(255) NULL,
  is_compliant BOOLEAN DEFAULT TRUE,
  compliance_notes TEXT NULL,
  meta_data JSON NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 6. 媒体关联表
-- ============================================
CREATE TABLE entity_media_links (
  id INT AUTO_INCREMENT PRIMARY KEY,
  media_id INT NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INT NOT NULL,
  link_type VARCHAR(50) DEFAULT 'primary',
  sort_order INT NULL,
  context VARCHAR(100) NULL,
  linked_by INT NULL,
  linked_at DATETIME NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 7. 模板表
-- ============================================
CREATE TABLE templates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  template_code VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  category VARCHAR(100) NOT NULL,
  subcategory VARCHAR(100) NULL,
  style_tags JSON NULL,
  suitable_for JSON NULL,
  guest_count_min INT NULL,
  guest_count_max INT NULL,
  budget_range_min DECIMAL(12,2) NULL,
  budget_range_max DECIMAL(12,2) NULL,
  base_price DECIMAL(12,2) NULL,
  market_price DECIMAL(12,2) NULL,
  cover_image_id INT NULL,
  gallery_media_ids JSON NULL,
  preview_video_id INT NULL,
  scene_config JSON NULL,
  status VARCHAR(50) DEFAULT 'draft',
  is_recommended BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  view_count INT DEFAULT 0,
  order_count INT DEFAULT 0,
  rating_average DECIMAL(3,2) DEFAULT 5.00,
  rating_count INT DEFAULT 0,
  created_by INT NOT NULL,
  created_by_type VARCHAR(50) DEFAULT 'admin',
  partner_id INT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  published_at DATETIME NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 8. 模板BOM表
-- ============================================
CREATE TABLE template_bom (
  id INT AUTO_INCREMENT PRIMARY KEY,
  template_id INT NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  item_category VARCHAR(100) NULL,
  item_description TEXT NULL,
  quantity DECIMAL(10,2) DEFAULT 1,
  unit VARCHAR(50) NULL,
  cost_price DECIMAL(12,2) NULL,
  list_price DECIMAL(12,2) NULL,
  supplier_partner_id INT NULL,
  supplier_item_code VARCHAR(100) NULL,
  is_required BOOLEAN DEFAULT TRUE,
  alternatives JSON NULL,
  model_3d_url VARCHAR(500) NULL,
  sort_order INT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 9. 分享表
-- ============================================
CREATE TABLE shares (
  id INT AUTO_INCREMENT PRIMARY KEY,
  share_code VARCHAR(32) NOT NULL UNIQUE,
  share_type VARCHAR(50) NOT NULL,
  target_id INT NOT NULL,
  target_data JSON NULL,
  created_by INT NOT NULL,
  created_by_type VARCHAR(50) DEFAULT 'user',
  title VARCHAR(255) NULL,
  description TEXT NULL,
  cover_image_url VARCHAR(500) NULL,
  expires_at DATETIME NULL,
  max_uses INT NULL,
  use_count INT DEFAULT 0,
  password_hash VARCHAR(255) NULL,
  is_active BOOLEAN DEFAULT TRUE,
  disabled_at DATETIME NULL,
  disable_reason TEXT NULL,
  view_count INT DEFAULT 0,
  click_count INT DEFAULT 0,
  reward_enabled BOOLEAN DEFAULT TRUE,
  reward_rule_id INT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 10. 分享事件表
-- ============================================
CREATE TABLE share_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  share_id INT NOT NULL,
  share_code VARCHAR(32) NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  visitor_ip VARCHAR(45) NOT NULL,
  visitor_user_agent TEXT NULL,
  visitor_fingerprint VARCHAR(255) NULL,
  device_type VARCHAR(50) NULL,
  browser VARCHAR(100) NULL,
  os VARCHAR(100) NULL,
  country VARCHAR(100) NULL,
  region VARCHAR(100) NULL,
  city VARCHAR(100) NULL,
  referrer_url TEXT NULL,
  utm_source VARCHAR(100) NULL,
  utm_medium VARCHAR(100) NULL,
  utm_campaign VARCHAR(100) NULL,
  user_id INT NULL,
  event_value DECIMAL(12,2) NULL,
  reward_amount DECIMAL(12,2) NULL,
  reward_status VARCHAR(50) DEFAULT 'pending',
  confirmed_at DATETIME NULL,
  event_data JSON NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 11. 钱包表
-- ============================================
CREATE TABLE wallets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  owner_id INT NOT NULL,
  owner_type VARCHAR(50) DEFAULT 'user',
  available_balance DECIMAL(12,2) DEFAULT 0.00,
  frozen_balance DECIMAL(12,2) DEFAULT 0.00,
  total_earned DECIMAL(12,2) DEFAULT 0.00,
  total_withdrawn DECIMAL(12,2) DEFAULT 0.00,
  currency VARCHAR(10) DEFAULT 'AUD',
  status VARCHAR(50) DEFAULT 'active',
  withdrawal_method VARCHAR(50) NULL,
  withdrawal_account JSON NULL,
  last_activity_at DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_wallet_owner (owner_id, owner_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 12. 钱包流水表
-- ============================================
CREATE TABLE wallet_ledger (
  id INT AUTO_INCREMENT PRIMARY KEY,
  wallet_id INT NOT NULL,
  transaction_type VARCHAR(50) NOT NULL,
  direction VARCHAR(10) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'AUD',
  balance_before DECIMAL(12,2) NOT NULL,
  balance_after DECIMAL(12,2) NOT NULL,
  source_type VARCHAR(50) NULL,
  source_id INT NULL,
  description TEXT NULL,
  reference_number VARCHAR(100) NULL,
  status VARCHAR(50) DEFAULT 'completed',
  processed_at DATETIME NULL,
  processed_by INT NULL,
  extra_data JSON NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 13. 返利规则表
-- ============================================
CREATE TABLE reward_rules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  event_type VARCHAR(50) NOT NULL,
  calculation_type VARCHAR(50) DEFAULT 'fixed',
  fixed_amount DECIMAL(12,2) NULL,
  percentage_rate DECIMAL(5,4) NULL,
  percentage_base VARCHAR(50) NULL,
  tier_config JSON NULL,
  max_reward_per_event DECIMAL(12,2) NULL,
  daily_cap INT NULL,
  monthly_cap INT NULL,
  applicable_to VARCHAR(50) DEFAULT 'all',
  applicable_user_types JSON NULL,
  effective_from DATETIME NOT NULL,
  effective_until DATETIME NULL,
  is_active BOOLEAN DEFAULT TRUE,
  priority INT DEFAULT 0,
  total_events_triggered INT DEFAULT 0,
  total_reward_amount DECIMAL(12,2) DEFAULT 0.00,
  created_by INT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 初始化数据
-- ============================================
INSERT INTO reward_rules (name, event_type, fixed_amount, daily_cap, is_active, effective_from) VALUES
('点击奖励', 'click', 0.05, 10, TRUE, NOW()),
('注册奖励', 'signup', 1.00, NULL, TRUE, NOW()),
('成交奖励', 'deposit', 20.00, NULL, TRUE, NOW());

INSERT INTO partner_contracts (contract_code, version, title, content, effective_date, is_active) VALUES
('CTR001', '1.0', 'PartyOnce供应商合作协议', '<h1>供应商合作协议</h1><p>条款内容...</p>', NOW(), TRUE);

INSERT INTO templates (template_code, name, category, status, created_by, is_recommended) VALUES
('TPL001', '中式婚礼经典方案', 'wedding', 'published', 1, TRUE),
('TPL002', '生日派对欢乐方案', 'birthday', 'published', 1, FALSE),
('TPL003', '企业年会大气方案', 'corporate', 'published', 1, TRUE);

SELECT '数据库重建完成' AS message;
