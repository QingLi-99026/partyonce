-- PartyOnce 字段补丁 SQL
-- 修复 partner_contracts 和 wallet_ledger 表缺失字段

-- ============================================
-- 1. 修复 partner_contracts 表
-- ============================================

-- 检查并添加 contract_code 字段
SET @exist := (SELECT COUNT(*) FROM information_schema.columns 
WHERE table_schema = 'partyonce' AND table_name = 'partner_contracts' AND column_name = 'contract_code');

SET @sql := IF(@exist = 0, 
    'ALTER TABLE partner_contracts ADD COLUMN contract_code VARCHAR(100) NULL AFTER id',
    'SELECT "contract_code 已存在"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 检查并添加 contract_type 字段
SET @exist := (SELECT COUNT(*) FROM information_schema.columns 
WHERE table_schema = 'partyonce' AND table_name = 'partner_contracts' AND column_name = 'contract_type');

SET @sql := IF(@exist = 0, 
    'ALTER TABLE partner_contracts ADD COLUMN contract_type VARCHAR(50) NULL AFTER content_url',
    'SELECT "contract_type 已存在"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 检查并添加 is_mandatory 字段
SET @exist := (SELECT COUNT(*) FROM information_schema.columns 
WHERE table_schema = 'partyonce' AND table_name = 'partner_contracts' AND column_name = 'is_mandatory');

SET @sql := IF(@exist = 0, 
    'ALTER TABLE partner_contracts ADD COLUMN is_mandatory BOOLEAN DEFAULT TRUE AFTER is_active',
    'SELECT "is_mandatory 已存在"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 检查并添加 variables_schema 字段
SET @exist := (SELECT COUNT(*) FROM information_schema.columns 
WHERE table_schema = 'partyonce' AND table_name = 'partner_contracts' AND column_name = 'variables_schema');

SET @sql := IF(@exist = 0, 
    'ALTER TABLE partner_contracts ADD COLUMN variables_schema JSON NULL AFTER is_mandatory',
    'SELECT "variables_schema 已存在"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 更新现有记录的 contract_code
UPDATE partner_contracts SET contract_code = CONCAT('CTR', id) WHERE contract_code IS NULL;

-- ============================================
-- 2. 修复 wallet_ledger 表
-- ============================================

-- 检查并添加 source_type 字段
SET @exist := (SELECT COUNT(*) FROM information_schema.columns 
WHERE table_schema = 'partyonce' AND table_name = 'wallet_ledger' AND column_name = 'source_type');

SET @sql := IF(@exist = 0, 
    'ALTER TABLE wallet_ledger ADD COLUMN source_type VARCHAR(50) NULL AFTER balance_after',
    'SELECT "source_type 已存在"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 检查并添加 source_id 字段
SET @exist := (SELECT COUNT(*) FROM information_schema.columns 
WHERE table_schema = 'partyonce' AND table_name = 'wallet_ledger' AND column_name = 'source_id');

SET @sql := IF(@exist = 0, 
    'ALTER TABLE wallet_ledger ADD COLUMN source_id INTEGER NULL AFTER source_type',
    'SELECT "source_id 已存在"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT '补丁应用完成' AS message;
