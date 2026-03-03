-- PartyOnce Phase 1-4 Database Migration
-- Creates 14 new tables for supplier system, media management, templates, events, sharing, and wallet

USE partyonce;

-- ============================================
-- 1. PARTNERS (供应商入驻表)
-- ============================================
CREATE TABLE partners (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,  -- 关联到users表的供应商账号
    
    -- 公司基本信息
    company_name VARCHAR(255) NOT NULL,
    company_legal_name VARCHAR(255),
    business_registration_number VARCHAR(100),
    tax_id VARCHAR(100),
    
    -- 联系信息
    contact_name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50) NOT NULL,
    
    -- 业务信息
    business_type VARCHAR(100),  -- venue, catering, decoration, photography, etc.
    service_categories JSON,  -- 服务类别列表
    service_areas JSON,  -- 服务地区列表
    
    -- 资质文件
    business_license_url VARCHAR(500),  -- 营业执照
    id_document_url VARCHAR(500),  -- 法人身份证
    portfolio_urls JSON,  -- 作品集URL列表
    
    -- 入驻申请状态
    status VARCHAR(50) DEFAULT 'pending',  -- pending, approved, rejected, suspended
    rejection_reason TEXT,
    
    -- 审核信息
    reviewed_by INT,
    reviewed_at TIMESTAMP NULL,
    
    -- 合作条款
    commission_rate DECIMAL(5, 4) DEFAULT 0.10,  -- 平台抽成比例 10%
    settlement_cycle VARCHAR(50) DEFAULT 'monthly',  -- monthly, weekly
    
    -- 元数据
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_business_type (business_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. PARTNER_CONTRACTS (合同模板表)
-- ============================================
CREATE TABLE partner_contracts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- 合同基本信息
    contract_code VARCHAR(100) UNIQUE NOT NULL,  -- 合同编号
    version VARCHAR(20) NOT NULL,  -- 版本号
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- 合同内容
    content TEXT NOT NULL,  -- 合同全文（Markdown或HTML）
    content_url VARCHAR(500),  -- 合同文件URL（PDF等）
    
    -- 生效范围
    contract_type VARCHAR(50) DEFAULT 'general',  -- general, venue, catering, etc.
    effective_date DATE NOT NULL,
    expiry_date DATE,  -- NULL表示长期有效
    
    -- 状态
    is_active BOOLEAN DEFAULT TRUE,
    is_mandatory BOOLEAN DEFAULT TRUE,  -- 是否必须签署
    
    -- 替换变量定义（JSON Schema）
    variables_schema JSON,  -- 如：{"partner_name": "string", "commission_rate": "number"}
    
    -- 元数据
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_contract_code (contract_code),
    INDEX idx_version (version),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. PARTNER_CONTRACT_ACCEPTANCES (合同签署记录表)
-- ============================================
CREATE TABLE partner_contract_acceptances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- 关联信息
    partner_id INT NOT NULL,
    contract_id INT NOT NULL,
    
    -- 签署版本内容快照
    contract_version VARCHAR(20) NOT NULL,
    contract_content_snapshot TEXT NOT NULL,  -- 签署时的合同内容快照
    
    -- 变量替换值
    variables_values JSON,  -- 实际替换的值，如：{"partner_name": "ABC公司", "commission_rate": 0.10}
    
    -- 签署信息
    accepted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accepted_ip VARCHAR(45),
    accepted_user_agent TEXT,
    
    -- 电子签名
    signature_image_url VARCHAR(500),  -- 签名图片URL
    digital_signature_hash VARCHAR(255),  -- 数字签名哈希
    
    -- 状态
    status VARCHAR(50) DEFAULT 'active',  -- active, revoked, expired
    revoked_at TIMESTAMP NULL,
    revocation_reason TEXT,
    
    -- 元数据
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE,
    FOREIGN KEY (contract_id) REFERENCES partner_contracts(id),
    UNIQUE KEY unique_partner_contract (partner_id, contract_id),
    INDEX idx_accepted_at (accepted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. MEDIA_ASSETS (媒体元数据表)
-- ============================================
CREATE TABLE media_assets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- 文件基本信息
    file_name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255),
    file_path VARCHAR(500) NOT NULL,  -- 对象存储路径
    public_url VARCHAR(500) NOT NULL,  -- CDN访问URL
    
    -- 文件类型
    mime_type VARCHAR(100) NOT NULL,  -- image/jpeg, video/mp4, etc.
    file_category VARCHAR(50),  -- image, video, audio, document
    
    -- 文件大小
    file_size_bytes BIGINT NOT NULL,
    file_size_human VARCHAR(50),  -- 如 "2.5 MB"
    
    -- 媒体属性（图片/视频特有）
    width_px INT,
    height_px INT,
    duration_seconds DECIMAL(8, 2),  -- 视频/音频时长
    
    -- 缩略图（图片/视频）
    thumbnail_url VARCHAR(500),
    thumbnail_width INT,
    thumbnail_height INT,
    
    -- 上传状态
    upload_status VARCHAR(50) DEFAULT 'pending',  -- pending, uploaded, processing, ready, failed
    
    -- 上传信息
    uploaded_by INT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    uploaded_ip VARCHAR(45),
    
    -- 存储信息
    storage_provider VARCHAR(50) DEFAULT 'r2',  -- r2, s3, oss
    storage_bucket VARCHAR(100),
    storage_region VARCHAR(50),
    storage_etag VARCHAR(255),  -- 对象存储ETag
    
    -- 视频特殊限制标记
    is_compliant BOOLEAN DEFAULT TRUE,  -- 是否符合视频规范(≤60秒, ≤100MB)
    compliance_notes TEXT,
    
    -- 元数据
    metadata JSON,  -- EXIF数据等额外信息
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (uploaded_by) REFERENCES users(id),
    INDEX idx_file_category (file_category),
    INDEX idx_upload_status (upload_status),
    INDEX idx_uploaded_by (uploaded_by),
    INDEX idx_uploaded_at (uploaded_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 5. ENTITY_MEDIA_LINKS (媒体关联表 - 多态关联)
-- ============================================
CREATE TABLE entity_media_links (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- 多态关联
    media_id INT NOT NULL,
    entity_type VARCHAR(50) NOT NULL,  -- partner, event, template, venue, user, etc.
    entity_id INT NOT NULL,
    
    -- 关联属性
    link_type VARCHAR(50) DEFAULT 'primary',  -- primary, gallery, thumbnail, banner, document
    sort_order INT DEFAULT 0,
    
    -- 使用场景
    context VARCHAR(100),  -- 具体用途描述
    
    -- 元数据
    linked_by INT,
    linked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (media_id) REFERENCES media_assets(id) ON DELETE CASCADE,
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_link_type (link_type),
    INDEX idx_media_id (media_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 6. TEMPLATES (模板库表)
-- ============================================
CREATE TABLE templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- 模板基本信息
    template_code VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- 分类
    category VARCHAR(100) NOT NULL,  -- wedding, birthday, corporate, baby_shower, etc.
    subcategory VARCHAR(100),  -- 子分类
    style_tags JSON,  -- 风格标签 ["elegant", "modern", "vintage"]
    
    -- 适用场景
    suitable_for JSON,  -- 适用场景描述
    guest_count_min INT,
    guest_count_max INT,
    budget_range_min DECIMAL(12, 2),
    budget_range_max DECIMAL(12, 2),
    
    -- 定价
    base_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,  -- 模板基础价格
    market_price DECIMAL(12, 2),  -- 市场参考价
    
    -- 媒体资源
    cover_image_id INT,
    gallery_media_ids JSON,  -- 图集媒体ID列表
    preview_video_id INT,  -- 预览视频
    
    -- 3D配置
    scene_config JSON,  -- 3D场景配置
    
    -- 状态
    status VARCHAR(50) DEFAULT 'draft',  -- draft, published, archived, disabled
    is_recommended BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    
    -- 统计
    view_count INT DEFAULT 0,
    order_count INT DEFAULT 0,
    rating_average DECIMAL(3, 2) DEFAULT 0.00,
    rating_count INT DEFAULT 0,
    
    -- 创建者（可以是平台或合作伙伴）
    created_by INT NOT NULL,
    created_by_type VARCHAR(50) DEFAULT 'admin',  -- admin, partner
    partner_id INT,  -- 如果是partner创建的
    
    -- 元数据
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    published_at TIMESTAMP NULL,
    
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (cover_image_id) REFERENCES media_assets(id),
    FOREIGN KEY (preview_video_id) REFERENCES media_assets(id),
    FOREIGN KEY (partner_id) REFERENCES partners(id),
    INDEX idx_category (category),
    INDEX idx_status (status),
    INDEX idx_is_featured (is_featured),
    INDEX idx_created_by (created_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 7. TEMPLATE_BOM (模板物料清单表)
-- ============================================
CREATE TABLE template_bom (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- 关联模板
    template_id INT NOT NULL,
    
    -- 物料信息
    item_name VARCHAR(255) NOT NULL,
    item_category VARCHAR(100),  -- decoration, furniture, lighting, flower, etc.
    item_description TEXT,
    
    -- 规格
    quantity DECIMAL(10, 2) DEFAULT 1.00,
    unit VARCHAR(50),  -- piece, meter, set, etc.
    
    -- 成本与定价
    cost_price DECIMAL(12, 2),  -- 成本价（平台采购价）
    list_price DECIMAL(12, 2),  -- 标价
    
    -- 供应商信息
    supplier_partner_id INT,  -- 指定供应商
    supplier_item_code VARCHAR(100),  -- 供应商物料编码
    
    -- 替换选项
    is_required BOOLEAN DEFAULT TRUE,  -- 是否必须
    alternatives JSON,  -- 可替换选项
    
    -- 3D资源
    model_3d_url VARCHAR(500),
    
    -- 排序
    sort_order INT DEFAULT 0,
    
    -- 元数据
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE CASCADE,
    FOREIGN KEY (supplier_partner_id) REFERENCES partners(id),
    INDEX idx_template_id (template_id),
    INDEX idx_item_category (item_category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 8. EVENTS (我的活动表 - 复用orders结构并扩展)
-- ============================================
CREATE TABLE events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- 关联用户
    user_id INT NOT NULL,
    
    -- 活动基本信息（复用原有orders的event相关字段）
    event_name VARCHAR(255),
    event_type VARCHAR(100),  -- wedding, birthday, corporate, etc.
    event_date DATE,
    event_duration_hours INT DEFAULT 4,
    guest_count INT DEFAULT 0,
    event_notes TEXT,
    
    -- 场地信息
    venue_id INT,
    venue_partner_id INT,  -- 如果是合作场地
    
    -- 模板绑定
    template_id INT,
    customizations JSON,  -- 客户对模板的定制要求
    
    -- 订单关联
    order_id INT,  -- 关联到orders表（如果有）
    
    -- 活动状态
    status VARCHAR(50) DEFAULT 'planning',  -- planning, quoted, confirmed, preparing, active, completed, cancelled
    
    -- 时间安排
    setup_time TIMESTAMP NULL,  -- 布置开始时间
    event_start_time TIMESTAMP NULL,
    event_end_time TIMESTAMP NULL,
    teardown_time TIMESTAMP NULL,
    
    -- 地址信息（如果不在venue）
    address VARCHAR(500),
    city VARCHAR(100),
    state VARCHAR(100),
    postcode VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- 预算与定价
    estimated_budget DECIMAL(12, 2),
    final_price DECIMAL(12, 2),
    
    -- 元数据
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (venue_id) REFERENCES venues(id),
    FOREIGN KEY (venue_partner_id) REFERENCES partners(id),
    FOREIGN KEY (template_id) REFERENCES templates(id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_event_date (event_date),
    INDEX idx_template_id (template_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 9. EVENT_ALBUMS (活动相册表)
-- ============================================
CREATE TABLE event_albums (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- 关联活动
    event_id INT NOT NULL,
    
    -- 媒体文件
    media_id INT NOT NULL,
    
    -- 相册分类
    album_type VARCHAR(50) DEFAULT 'general',  -- general, ceremony, reception, preparation, etc.
    
    -- 图片信息
    caption TEXT,  -- 图片说明
    taken_at TIMESTAMP NULL,  -- 拍摄时间
    taken_by VARCHAR(255),  -- 拍摄者
    
    -- 排序与展示
    sort_order INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    
    -- 互动
    like_count INT DEFAULT 0,
    
    -- 上传信息
    uploaded_by INT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (media_id) REFERENCES media_assets(id) ON DELETE CASCADE,
    INDEX idx_event_id (event_id),
    INDEX idx_album_type (album_type),
    INDEX idx_is_featured (is_featured)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 10. SHARES (分享链接表)
-- ============================================
CREATE TABLE shares (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- 分享码
    share_code VARCHAR(32) UNIQUE NOT NULL,  -- 6位短码或自定义
    
    -- 分享类型与目标
    share_type VARCHAR(50) NOT NULL,  -- event, template, partner, venue
    target_id INT NOT NULL,  -- 目标ID
    target_data JSON,  -- 额外数据快照
    
    -- 创建者
    created_by INT NOT NULL,
    created_by_type VARCHAR(50) DEFAULT 'user',  -- user, partner, admin
    
    -- 分享设置
    title VARCHAR(255),
    description TEXT,
    cover_image_url VARCHAR(500),
    
    -- 有效期
    expires_at TIMESTAMP NULL,  -- NULL表示永久有效
    max_uses INT,  -- 最大使用次数，NULL表示无限制
    use_count INT DEFAULT 0,
    
    -- 密码保护
    password_hash VARCHAR(255),  -- 访问密码（可选）
    
    -- 状态
    is_active BOOLEAN DEFAULT TRUE,
    disabled_at TIMESTAMP NULL,
    disable_reason TEXT,
    
    -- 统计
    view_count INT DEFAULT 0,
    click_count INT DEFAULT 0,  -- 点击数（用于返利计算）
    
    -- 返利设置
    reward_enabled BOOLEAN DEFAULT TRUE,  -- 是否启用返利
    reward_rule_id INT,  -- 使用的返利规则
    
    -- 元数据
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_share_code (share_code),
    INDEX idx_share_type_target (share_type, target_id),
    INDEX idx_created_by (created_by),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 11. SHARE_EVENTS (归因事件表)
-- ============================================
CREATE TABLE share_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- 关联分享
    share_id INT NOT NULL,
    share_code VARCHAR(32) NOT NULL,
    
    -- 事件类型
    event_type VARCHAR(50) NOT NULL,  -- view, click, signup, deposit, order
    
    -- 访客信息
    visitor_ip VARCHAR(45) NOT NULL,
    visitor_user_agent TEXT,
    visitor_fingerprint VARCHAR(255),  -- 设备指纹
    
    -- 设备信息
    device_type VARCHAR(50),  -- mobile, tablet, desktop
    browser VARCHAR(100),
    os VARCHAR(100),
    
    -- 地理位置
    country VARCHAR(100),
    region VARCHAR(100),
    city VARCHAR(100),
    
    -- 来源追踪
    referrer_url TEXT,
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    
    -- 关联用户（如果已登录）
    user_id INT,
    
    -- 事件价值（用于返利）
    event_value DECIMAL(12, 2),  -- 事件价值（如订单金额）
    reward_amount DECIMAL(12, 2),  -- 产生的返利金额
    
    -- 状态
    reward_status VARCHAR(50) DEFAULT 'pending',  -- pending, confirmed, cancelled
    confirmed_at TIMESTAMP NULL,
    
    -- 元数据
    event_data JSON,  -- 额外事件数据
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (share_id) REFERENCES shares(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_share_id (share_id),
    INDEX idx_event_type (event_type),
    INDEX idx_visitor_fingerprint (visitor_fingerprint),
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    INDEX idx_reward_status (reward_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 12. WALLETS (钱包余额表)
-- ============================================
CREATE TABLE wallets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- 钱包所有者
    owner_id INT NOT NULL,
    owner_type VARCHAR(50) DEFAULT 'user',  -- user, partner
    
    -- 余额（分账户）
    available_balance DECIMAL(12, 2) DEFAULT 0.00,  -- 可用余额
    frozen_balance DECIMAL(12, 2) DEFAULT 0.00,  -- 冻结金额（待结算）
    total_earned DECIMAL(12, 2) DEFAULT 0.00,  -- 累计收益
    total_withdrawn DECIMAL(12, 2) DEFAULT 0.00,  -- 累计提现
    
    -- 币种
    currency VARCHAR(10) DEFAULT 'USD',
    
    -- 状态
    status VARCHAR(50) DEFAULT 'active',  -- active, suspended, closed
    
    -- 提现设置
    withdrawal_method VARCHAR(50),  -- bank_transfer, paypal, etc.
    withdrawal_account JSON,  -- 提现账户信息（加密存储）
    
    -- 安全
    last_activity_at TIMESTAMP NULL,
    
    -- 元数据
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_owner (owner_type, owner_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 13. WALLET_LEDGER (钱包流水表)
-- ============================================
CREATE TABLE wallet_ledger (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- 关联钱包
    wallet_id INT NOT NULL,
    
    -- 交易基本信息
    transaction_type VARCHAR(50) NOT NULL,  -- reward, withdrawal, refund, adjustment, transfer
    direction VARCHAR(10) NOT NULL,  -- credit(入), debit(出)
    
    -- 金额
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    
    -- 余额快照
    balance_before DECIMAL(12, 2) NOT NULL,
    balance_after DECIMAL(12, 2) NOT NULL,
    
    -- 关联业务
    source_type VARCHAR(50),  -- share_event, order, withdrawal_request, etc.
    source_id INT,  -- 关联记录ID
    
    -- 交易详情
    description TEXT,
    reference_number VARCHAR(100),  -- 交易参考号
    
    -- 状态
    status VARCHAR(50) DEFAULT 'completed',  -- pending, completed, failed, reversed
    
    -- 处理信息
    processed_at TIMESTAMP NULL,
    processed_by INT,
    
    -- 元数据
    extra_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (wallet_id) REFERENCES wallets(id),
    INDEX idx_wallet_id (wallet_id),
    INDEX idx_transaction_type (transaction_type),
    INDEX idx_source (source_type, source_id),
    INDEX idx_created_at (created_at),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 14. REWARD_RULES (返利规则表)
-- ============================================
CREATE TABLE reward_rules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- 规则名称
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- 触发事件类型
    event_type VARCHAR(50) NOT NULL,  -- click, signup, deposit, order
    
    -- 奖励计算方式
    calculation_type VARCHAR(50) DEFAULT 'fixed',  -- fixed, percentage, tiered
    
    -- 固定金额奖励
    fixed_amount DECIMAL(12, 2),
    
    -- 百分比奖励（基于订单金额等）
    percentage_rate DECIMAL(5, 4),  -- 如 0.05 表示 5%
    percentage_base VARCHAR(50),  -- 计算百分比的基数字段
    
    -- 分层奖励配置（JSON）
    tier_config JSON,  -- 如：[{"min_amount": 0, "max_amount": 100, "reward": 5}, ...]
    
    -- 限制条件
    max_reward_per_event DECIMAL(12, 2),  -- 单次事件最高奖励
    daily_cap INT,  -- 每日奖励次数上限
    monthly_cap INT,  -- 每月奖励次数上限
    
    -- 适用对象
    applicable_to VARCHAR(50) DEFAULT 'all',  -- all, user, partner
    applicable_user_types JSON,  -- 适用的用户类型
    
    -- 有效期
    effective_from DATE NOT NULL,
    effective_until DATE,
    
    -- 状态
    is_active BOOLEAN DEFAULT TRUE,
    priority INT DEFAULT 0,  -- 规则优先级（高优先级的先匹配）
    
    -- 统计
    total_events_triggered INT DEFAULT 0,
    total_reward_amount DECIMAL(12, 2) DEFAULT 0.00,
    
    -- 元数据
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_event_type (event_type),
    INDEX idx_is_active (is_active),
    INDEX idx_effective_dates (effective_from, effective_until)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 插入默认返利规则
-- ============================================
INSERT INTO reward_rules (name, description, event_type, calculation_type, fixed_amount, effective_from) VALUES
('点击奖励', '分享链接被点击奖励', 'click', 'fixed', 0.20, '2024-01-01'),
('注册奖励', '通过分享链接注册新用户奖励', 'signup', 'fixed', 2.00, '2024-01-01'),
('首单奖励', '通过分享链接完成首次消费奖励', 'deposit', 'fixed', 20.00, '2024-01-01');

-- ============================================
-- 插入示例合同模板
-- ============================================
INSERT INTO partner_contracts (contract_code, version, title, description, content, contract_type, effective_date, is_active, is_mandatory) VALUES
('PARTNER-2024-001', '1.0', 'PartyOnce 合作伙伴服务协议', '标准合作伙伴入驻协议', 
'# PartyOnce 合作伙伴服务协议

## 第一条 合作内容
合作伙伴（以下简称"乙方"）同意通过PartyOnce平台（以下简称"甲方"）向客户提供[service_type]服务。

## 第二条 佣金条款
甲方将从每笔通过平台产生的订单中收取 **{commission_rate}%** 作为平台服务费。

## 第三条 结算周期
结算周期为{settlement_cycle}，乙方可在后台查看详细账单。

## 第四条 服务标准
乙方承诺提供符合行业标准的服务质量。

---
签署日期：{sign_date}
合作伙伴：{partner_name}
', 
'general', '2024-01-01', TRUE, TRUE);

-- ============================================
-- 插入示例模板
-- ============================================
INSERT INTO templates (template_code, name, description, category, subcategory, style_tags, suitable_for, guest_count_min, guest_count_max, budget_range_min, budget_range_max, base_price, status, is_recommended, created_by, created_by_type) VALUES
('TMPL-WED-001', '优雅花园婚礼', '浪漫花园主题的户外婚礼模板，包含鲜花拱门、烛光通道等元素', 'wedding', 'outdoor', '["elegant", "romantic", "garden"]', '["户外婚礼", "花园派对"]', 50, 200, 5000.00, 15000.00, 2999.00, 'published', TRUE, 1, 'admin'),
('TMPL-BDAY-001', '梦幻生日派对', '适合各年龄段的梦幻主题生日派对', 'birthday', 'general', '["dreamy", "colorful", "fun"]', '["儿童生日", "成人生日"]', 10, 50, 500.00, 3000.00, 899.00, 'published', TRUE, 1, 'admin'),
('TMPL-CORP-001', '高端企业年会', '专业企业年会布置模板', 'corporate', 'annual_meeting', '["professional", "luxury", "modern"]', '["年会", "庆典"]', 100, 500, 10000.00, 50000.00, 5999.00, 'published', FALSE, 1, 'admin');
