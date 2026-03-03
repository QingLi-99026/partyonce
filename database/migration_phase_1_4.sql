-- PartyOnce Phase 1-4 完整数据库迁移脚本
-- 执行顺序：按表依赖顺序执行

-- ============================================
-- 1. 扩展现有 users 表（增加 role 字段）
-- ============================================
ALTER TABLE users 
MODIFY COLUMN role VARCHAR(50) DEFAULT 'user' 
COMMENT 'user/vip/business/supplier/admin';

-- ============================================
-- 2. 供应商相关表
-- ============================================

-- 供应商入驻表
CREATE TABLE IF NOT EXISTS partners (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    company_name VARCHAR(255) NOT NULL COMMENT '公司名称',
    category VARCHAR(100) NOT NULL COMMENT '类别: catering/photo/decor/entertainment/venue/equipment/other',
    contact_name VARCHAR(255) NOT NULL COMMENT '联系人姓名',
    contact_phone VARCHAR(50) NOT NULL COMMENT '联系电话',
    email VARCHAR(255) NOT NULL COMMENT '邮箱',
    service_area TEXT COMMENT '服务区域（JSON或文本）',
    abn_optional VARCHAR(50) COMMENT 'ABN（可选）',
    status VARCHAR(50) DEFAULT 'pending' COMMENT 'pending/approved/rejected/suspended',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 合同模板表
CREATE TABLE IF NOT EXISTS partner_contracts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL COMMENT '合同标题',
    version VARCHAR(50) NOT NULL DEFAULT '1.0' COMMENT '版本号',
    content_type VARCHAR(50) DEFAULT 'html' COMMENT 'html/pdf_url',
    content_html TEXT COMMENT 'HTML内容',
    pdf_url VARCHAR(500) COMMENT 'PDF链接',
    status VARCHAR(50) DEFAULT 'active' COMMENT 'active/archived',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 合同签署记录表
CREATE TABLE IF NOT EXISTS partner_contract_acceptances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    partner_id INT NOT NULL COMMENT '供应商ID',
    contract_id INT NOT NULL COMMENT '合同ID',
    accepted_by_user_id INT NOT NULL COMMENT '签署人用户ID',
    accepted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '签署时间',
    ip_address VARCHAR(50) COMMENT 'IP地址',
    user_agent TEXT COMMENT '浏览器UA',
    snapshot_version VARCHAR(50) COMMENT '合同版本快照',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE,
    FOREIGN KEY (contract_id) REFERENCES partner_contracts(id) ON DELETE CASCADE,
    FOREIGN KEY (accepted_by_user_id) REFERENCES users(id),
    UNIQUE KEY unique_partner_contract (partner_id, contract_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. 媒体素材库表
-- ============================================

-- 媒体资源元数据表
CREATE TABLE IF NOT EXISTS media_assets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    owner_type VARCHAR(50) NOT NULL COMMENT 'supplier/venue/user/admin',
    owner_id INT NOT NULL COMMENT '所有者ID',
    media_type VARCHAR(50) NOT NULL COMMENT 'image/video',
    mime_type VARCHAR(100) NOT NULL COMMENT 'MIME类型',
    storage_key VARCHAR(500) NOT NULL COMMENT '对象存储路径',
    url VARCHAR(500) COMMENT 'CDN访问地址',
    cover_url VARCHAR(500) COMMENT '视频封面（可选）',
    width INT COMMENT '图片宽度',
    height INT COMMENT '图片高度',
    duration_sec INT COMMENT '视频时长（秒）',
    size_bytes BIGINT COMMENT '文件大小（字节）',
    checksum_hash VARCHAR(64) COMMENT '文件哈希（去重用）',
    visibility VARCHAR(50) DEFAULT 'private' COMMENT 'private/partner/public',
    license_marketing BOOLEAN DEFAULT FALSE COMMENT '允许平台营销使用',
    status VARCHAR(50) DEFAULT 'uploaded' COMMENT 'uploaded/processing/ready/rejected',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_owner (owner_type, owner_id),
    INDEX idx_media_type (media_type),
    INDEX idx_visibility (visibility),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 媒体与实体关联表
CREATE TABLE IF NOT EXISTS entity_media_links (
    id INT AUTO_INCREMENT PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL COMMENT 'venue/supplier_product/template/case/post/event',
    entity_id INT NOT NULL COMMENT '实体ID',
    media_asset_id INT NOT NULL COMMENT '媒体资源ID',
    sort_order INT DEFAULT 0 COMMENT '排序',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (media_asset_id) REFERENCES media_assets(id) ON DELETE CASCADE,
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_sort (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. 模板库表
-- ============================================

-- 模板表
CREATE TABLE IF NOT EXISTS templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL COMMENT '模板名称',
    scene_type VARCHAR(100) NOT NULL COMMENT '场景: kids/school/corporate/wedding/school/other',
    style_tags JSON COMMENT '风格标签（JSON数组）',
    budget_min DECIMAL(10,2) COMMENT '预算下限',
    budget_max DECIMAL(10,2) COMMENT '预算上限',
    default_guest_count INT COMMENT '默认人数',
    cover_media_id INT COMMENT '封面图媒体ID',
    is_free BOOLEAN DEFAULT TRUE COMMENT '是否免费',
    price DECIMAL(10,2) COMMENT '模板价格（如收费）',
    description TEXT COMMENT '模板描述',
    content_items JSON COMMENT '包含内容（JSON）',
    status VARCHAR(50) DEFAULT 'active' COMMENT 'active/inactive',
    created_by VARCHAR(50) DEFAULT 'admin' COMMENT 'admin/ai',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cover_media_id) REFERENCES media_assets(id) ON DELETE SET NULL,
    INDEX idx_scene_type (scene_type),
    INDEX idx_status (status),
    INDEX idx_budget (budget_min, budget_max)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 模板3D配置表（复用现有设计）
CREATE TABLE IF NOT EXISTS template_3d_configs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    template_id INT NOT NULL COMMENT '模板ID',
    three_scene_json LONGTEXT COMMENT 'Three.js场景JSON',
    asset_refs JSON COMMENT '资源引用（JSON）',
    lighting_preset JSON COMMENT '灯光预设（JSON）',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 模板物料清单表
CREATE TABLE IF NOT EXISTS template_bom (
    id INT AUTO_INCREMENT PRIMARY KEY,
    template_id INT NOT NULL COMMENT '模板ID',
    item_name VARCHAR(255) NOT NULL COMMENT '物品名称',
    qty INT DEFAULT 1 COMMENT '数量',
    cost_estimate DECIMAL(10,2) COMMENT '预估成本',
    category VARCHAR(100) COMMENT '分类',
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 5. 我的活动表（复用/扩展orders表）
-- ============================================

-- 活动相册表
CREATE TABLE IF NOT EXISTS event_albums (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL COMMENT '关联订单ID',
    media_asset_id INT NOT NULL COMMENT '媒体资源ID',
    caption TEXT COMMENT '图片说明',
    uploaded_by_user_id INT COMMENT '上传者ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (media_asset_id) REFERENCES media_assets(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by_user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 活动任务表（确认/复盘）
CREATE TABLE IF NOT EXISTS event_tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL COMMENT '关联订单ID',
    task_type VARCHAR(50) NOT NULL COMMENT 'pre_confirm/post_review',
    status VARCHAR(50) DEFAULT 'pending' COMMENT 'pending/completed',
    due_at TIMESTAMP COMMENT '到期时间',
    completed_at TIMESTAMP COMMENT '完成时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_due (due_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 6. 分享链接与归因表
-- ============================================

-- 分享链接表
CREATE TABLE IF NOT EXISTS shares (
    id INT AUTO_INCREMENT PRIMARY KEY,
    share_code VARCHAR(100) UNIQUE NOT NULL COMMENT '短码',
    owner_user_id INT NOT NULL COMMENT '分享者用户ID',
    object_type VARCHAR(100) NOT NULL COMMENT 'event/template/case/post',
    object_id INT NOT NULL COMMENT '对象ID',
    channel VARCHAR(100) COMMENT '渠道: tiktok/ig/xhs/youtube/unknown',
    click_count INT DEFAULT 0 COMMENT '点击次数',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_user_id) REFERENCES users(id),
    INDEX idx_share_code (share_code),
    INDEX idx_owner (owner_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 分享事件表（归因）
CREATE TABLE IF NOT EXISTS share_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    share_id INT NOT NULL COMMENT '分享ID',
    event_type VARCHAR(50) NOT NULL COMMENT 'click/signup/lead/deposit',
    user_id INT COMMENT '关联用户ID（注册/下单后）',
    ip_address VARCHAR(50) COMMENT 'IP地址',
    user_agent TEXT COMMENT '浏览器UA',
    device_id VARCHAR(255) COMMENT '设备ID（可选）',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (share_id) REFERENCES shares(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_share_event (share_id, event_type),
    INDEX idx_user (user_id),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 用户推荐关系表（注册归因）
CREATE TABLE IF NOT EXISTS user_referrals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL COMMENT '被推荐用户ID',
    share_id INT COMMENT '来源分享ID',
    referrer_user_id INT COMMENT '推荐人用户ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (share_id) REFERENCES shares(id),
    FOREIGN KEY (referrer_user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 7. 钱包与返利表
-- ============================================

-- 用户钱包表
CREATE TABLE IF NOT EXISTS wallets (
    user_id INT PRIMARY KEY COMMENT '用户ID',
    balance DECIMAL(10,2) DEFAULT 0.00 COMMENT '余额',
    total_earned DECIMAL(10,2) DEFAULT 0.00 COMMENT '累计收益',
    total_withdrawn DECIMAL(10,2) DEFAULT 0.00 COMMENT '累计提现',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 钱包流水表
CREATE TABLE IF NOT EXISTS wallet_ledger (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL COMMENT '用户ID',
    amount DECIMAL(10,2) NOT NULL COMMENT '金额（正为收入，负为支出）',
    currency VARCHAR(10) DEFAULT 'AUD' COMMENT '货币',
    type VARCHAR(50) NOT NULL COMMENT 'reward/adjustment/withdraw',
    reason VARCHAR(255) COMMENT '原因: share_click_bonus/signup_bonus/deposit_bonus',
    reference_type VARCHAR(100) COMMENT '关联类型: share_event/order',
    reference_id INT COMMENT '关联ID',
    status VARCHAR(50) DEFAULT 'paid' COMMENT 'pending/approved/paid/void',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_type (type),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 返利规则表
CREATE TABLE IF NOT EXISTS reward_rules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trigger_event_type VARCHAR(50) NOT NULL COMMENT 'click/signup/deposit',
    amount DECIMAL(10,2) NOT NULL COMMENT '奖励金额',
    daily_cap INT COMMENT '日上限（次数）',
    per_share_cap INT COMMENT '单分享上限（次数）',
    enabled BOOLEAN DEFAULT TRUE,
    description TEXT COMMENT '规则描述',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 8. 供应商评分表（后续使用）
-- ============================================

CREATE TABLE IF NOT EXISTS supplier_scores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    partner_id INT UNIQUE NOT NULL COMMENT '供应商ID',
    score_total DECIMAL(5,2) DEFAULT 100.00 COMMENT '总分0-100',
    on_time_rate DECIMAL(5,2) DEFAULT 100.00 COMMENT '准时率',
    cancel_rate DECIMAL(5,2) DEFAULT 0.00 COMMENT '取消率',
    complaint_rate DECIMAL(5,2) DEFAULT 0.00 COMMENT '投诉率',
    avg_rating DECIMAL(3,2) DEFAULT 5.00 COMMENT '平均评分',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 9. 初始化数据
-- ============================================

-- 插入默认合同模板
INSERT INTO partner_contracts (title, version, content_html, status) VALUES
('PartyOnce 供应商合作协议', '1.0', '
<h2>供应商合作协议</h2>
<p>1. 合作期限：本协议自签署之日起生效，有效期一年。</p>
<p>2. 服务内容：供应商应按照约定提供场地/餐饮/摄影/装饰等服务。</p>
<p>3. 价格体系：供应商应提供具有竞争力的协议价格。</p>
<p>4. 质量要求：服务应符合行业标准，确保客户满意度。</p>
<p>5. 结算方式：平台按月结算，扣除佣金后支付。</p>
<p>6. 违约责任：如违反协议条款，平台有权暂停或终止合作。</p>
', 'active');

-- 插入返利规则（默认规则）
INSERT INTO reward_rules (trigger_event_type, amount, daily_cap, per_share_cap, description) VALUES
('click', 0.20, 10, NULL, '分享点击奖励，每日上限10次'),
('signup', 2.00, NULL, NULL, '新用户注册奖励'),
('deposit', 20.00, NULL, 1, '订单定金成交奖励，每单限一次');

-- ============================================
-- 执行完成
-- ============================================
SELECT '数据库迁移完成！共创建 19 张新表。' AS message;
