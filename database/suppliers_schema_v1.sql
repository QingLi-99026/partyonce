-- PartyOnce 供应商库 1.0 表结构
-- 聚焦：悉尼儿童生日派对场景

-- 供应商主表
CREATE TABLE suppliers (
    supplier_id INT PRIMARY KEY AUTO_INCREMENT,
    
    -- 基础信息
    name VARCHAR(255) NOT NULL COMMENT '供应商名称',
    category_level_1 ENUM('场地类', '物料类', '搭建类', '现场服务类', '餐饮类', '物流类', '支持服务') NOT NULL COMMENT '一级分类',
    category_level_2 VARCHAR(100) COMMENT '二级分类',
    
    -- 联系信息
    contact_name VARCHAR(100) COMMENT '联系人姓名',
    phone VARCHAR(50) COMMENT '电话',
    whatsapp VARCHAR(50) COMMENT 'WhatsApp',
    wechat VARCHAR(50) COMMENT '微信',
    email VARCHAR(255) COMMENT '邮箱',
    
    -- 地址信息（地图核心）
    address VARCHAR(500) COMMENT '详细地址',
    suburb VARCHAR(100) NOT NULL COMMENT '区/Suburb',
    city VARCHAR(100) DEFAULT 'Sydney' COMMENT '城市',
    state VARCHAR(50) DEFAULT 'NSW' COMMENT '州',
    postcode VARCHAR(20) COMMENT '邮编',
    lat DECIMAL(10, 8) COMMENT '纬度',
    lng DECIMAL(11, 8) COMMENT '经度',
    service_radius_km INT DEFAULT 10 COMMENT '服务半径（公里）',
    
    -- 服务范围
    service_city JSON COMMENT '可服务城市列表',
    service_tags JSON COMMENT '服务标签（生日派对、儿童友好、包场等）',
    style_tags JSON COMMENT '风格标签（现代、复古、简约等）',
    
    -- 价格与容量
    price_level ENUM('低', '中', '高', '豪华') COMMENT '价格档位',
    min_order_amount DECIMAL(10, 2) COMMENT '最低订单金额',
    max_capacity INT COMMENT '最大容纳人数',
    
    -- 营业时间
    business_hours JSON COMMENT '营业时间配置',
    weekend_available BOOLEAN DEFAULT TRUE COMMENT '周末可服务',
    urgent_order_supported BOOLEAN DEFAULT FALSE COMMENT '支持急单',
    
    -- 资质信息
    insurance_status ENUM('有', '无', '待定') DEFAULT '待定' COMMENT '保险状态',
    abn VARCHAR(50) COMMENT 'ABN',
    company_name VARCHAR(255) COMMENT '公司名',
    invoice_supported BOOLEAN DEFAULT FALSE COMMENT '支持开票',
    
    -- 评分与合作
    rating DECIMAL(2, 1) DEFAULT 5.0 COMMENT '评分（1-5）',
    review_count INT DEFAULT 0 COMMENT '评价数',
    cooperation_status ENUM('待开发', '试合作', '正式合作', '冻结') DEFAULT '待开发' COMMENT '合作状态',
    priority_level ENUM('A', 'B', 'C', 'D') DEFAULT 'C' COMMENT '优先级',
    
    -- 联系记录
    last_contact_at DATETIME COMMENT '最后联系时间',
    last_quote_at DATETIME COMMENT '最后报价时间',
    last_order_at DATETIME COMMENT '最后订单时间',
    notes TEXT COMMENT '备注',
    
    -- 图片
    cover_image_url VARCHAR(500) COMMENT '封面图URL',
    gallery_images JSON COMMENT '画廊图片URL列表',
    
    -- 系统字段
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- 索引
    INDEX idx_category_l1 (category_level_1),
    INDEX idx_suburb (suburb),
    INDEX idx_location (lat, lng),
    INDEX idx_cooperation (cooperation_status),
    INDEX idx_priority (priority_level),
    INDEX idx_price_level (price_level),
    FULLTEXT INDEX idx_name (name),
    FULLTEXT INDEX idx_tags (service_tags, style_tags)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='供应商库主表';

-- 供应商服务能力详情表（扩展表）
CREATE TABLE supplier_services (
    service_id INT PRIMARY KEY AUTO_INCREMENT,
    supplier_id INT NOT NULL,
    service_name VARCHAR(200) COMMENT '服务名称',
    service_description TEXT COMMENT '服务描述',
    base_price DECIMAL(10, 2) COMMENT '基础价格',
    price_unit VARCHAR(50) COMMENT '价格单位（小时/人/次）',
    min_quantity INT DEFAULT 1 COMMENT '最小数量',
    max_quantity INT COMMENT '最大数量',
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 供应商档期表
CREATE TABLE supplier_availability (
    availability_id INT PRIMARY KEY AUTO_INCREMENT,
    supplier_id INT NOT NULL,
    date DATE NOT NULL COMMENT '日期',
    is_available BOOLEAN DEFAULT TRUE COMMENT '是否可预订',
    available_slots JSON COMMENT '可用时段',
    max_bookings INT DEFAULT 1 COMMENT '最大预订数',
    notes VARCHAR(255) COMMENT '备注',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id) ON DELETE CASCADE,
    UNIQUE KEY unique_supplier_date (supplier_id, date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 插入示例数据：悉尼儿童派对场地
INSERT INTO suppliers (
    name, category_level_1, category_level_2, contact_name, phone, email,
    address, suburb, city, lat, lng, service_radius_km,
    service_city, service_tags, style_tags,
    price_level, max_capacity, weekend_available, urgent_order_supported,
    insurance_status, abn, invoice_supported, rating, review_count,
    cooperation_status, priority_level,
    cover_image_url, business_hours
) VALUES 
(
    '悉尼儿童派对中心 - 北区旗舰店',
    '场地类', '儿童乐园',
    'Sarah Chen', '0412 345 678', 'sarah@kidspartysyd.com',
    '123 Miller St, North Sydney', 'North Sydney', 'Sydney', -33.8320, 151.2075, 20,
    '["Sydney", "North Shore"]', '["生日派对", "儿童友好", "包场", "室内"]', '["现代", "色彩丰富", "安全"]',
    '中', 50, TRUE, TRUE,
    '有', '12345678901', TRUE, 4.8, 127,
    '正式合作', 'A',
    'https://r2.partyonce.com/venues/north-kids-center/cover.jpg',
    '{"mon":"9:00-17:00","tue":"9:00-17:00","wed":"9:00-17:00","thu":"9:00-17:00","fri":"9:00-20:00","sat":"9:00-20:00","sun":"10:00-18:00"}'
),
(
    'Manly海滨派对屋',
    '场地类', '海滨活动空间',
    'Mike Wilson', '0423 456 789', 'mike@manlypartyhouse.com',
    '45 Beach Rd, Manly', 'Manly', 'Sydney', -33.7971, 151.2881, 15,
    '["Sydney", "Northern Beaches"]', '["海滨派对", "生日派对", "户外活动", "包场"]', '["海滨风", "自然", "休闲"]',
    '高', 80, TRUE, FALSE,
    '有', '98765432109', TRUE, 4.6, 89,
    '正式合作', 'A',
    'https://r2.partyonce.com/venues/manly-beach-house/cover.jpg',
    '{"fri":"14:00-22:00","sat":"10:00-22:00","sun":"10:00-20:00"}'
),
(
    '气球魔术师 - 全城配送',
    '物料类', '气球装饰',
    'Lisa Wang', '0456 789 012', 'lisa@balloonmagic.com',
    '78 Parramatta Rd, Auburn', 'Auburn', 'Sydney', -33.8491, 151.0343, 50,
    '["Sydney", "Greater Sydney"]', '["气球装饰", "生日派对", "送货上门", "主题定制"]', '["创意", "色彩丰富", "定制"]',
    '中', NULL, TRUE, TRUE,
    '有', '11223344556', TRUE, 4.9, 234,
    '正式合作', 'A',
    'https://r2.partyonce.com/suppliers/balloon-magic/cover.jpg',
    NULL
),
(
    '小主持人 Emily',
    '现场服务类', '派对主持',
    'Emily Zhang', '0433 222 111', 'emily@emccee.com',
    '服务全悉尼', 'Mobile', 'Sydney', -33.8688, 151.2093, 30,
    '["Sydney", "Inner West", "Eastern Suburbs"]', '["儿童主持", "派对游戏", "互动表演", "双语"]', '["活泼", "亲和力强", "专业"]',
    '中', NULL, TRUE, TRUE,
    '有', '55443322111', TRUE, 5.0, 56,
    '试合作', 'B',
    'https://r2.partyonce.com/suppliers/emily-host/cover.jpg',
    NULL
);

-- 示例服务能力
INSERT INTO supplier_services (supplier_id, service_name, service_description, base_price, price_unit) VALUES
(1, '基础场地租赁', '3小时场地使用，含基础桌椅', 450.00, '3小时'),
(1, '主题布置套餐', '气球+背景板+桌布主题布置', 280.00, '次'),
(1, '全包派对套餐', '场地+布置+餐饮+主持 15人', 1299.00, '套'),
(2, '海滨场地租赁', '海滨私人活动空间，含音响', 650.00, '4小时'),
(3, '基础气球拱门', '门口气球拱门装饰', 120.00, '个'),
(3, '全屋气球布置', '主题气球全屋装饰', 350.00, '套'),
(4, '2小时派对主持', '专业儿童派对主持+游戏', 280.00, '2小时');
