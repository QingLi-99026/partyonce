# PartyOnce 完整测试用例文档

## 概述

本文档包含 PartyOnce 平台四个核心业务流程的完整测试用例，覆盖供应商入驻、模板订单、分享归因和钱包返利四大闭环。

---

## 闭环A：供应商入驻 → 合同确认 → 素材上传

### 测试目标
验证供应商从注册入驻到素材上传的完整流程

### 前置条件
- 数据库已初始化
- Admin账户已存在
- 文件存储服务可用

### API端点
| 功能 | 端点 | 方法 |
|------|------|------|
| 用户注册 | /api/users/register | POST |
| 用户登录 | /api/users/login | POST |
| 供应商入驻申请 | /api/partner/apply | POST |
| 入驻申请列表 | /api/admin/partner/applications | GET |
| 审核入驻申请 | /api/admin/partner/applications/{id}/review | PATCH |
| 获取合同 | /api/partner/contracts | GET |
| 签署合同 | /api/partner/contracts/{id}/sign | POST |
| 上传素材 | /api/partner/materials/upload | POST |
| 素材列表 | /api/partner/materials | GET |

### 测试步骤

#### A1. 供应商注册账号并登录
**测试数据:**
```json
{
  "email": "supplier_test@example.com",
  "password": "Supplier123!",
  "full_name": "Test Supplier Co.",
  "user_type": "supplier",
  "role": "supplier",
  "phone": "+61400123456",
  "company_name": "Test Supplier Pty Ltd"
}
```

**预期结果:**
- HTTP 201 Created
- 返回用户ID和基本信息
- 用户role为supplier

#### A2. 填写入驻申请
**请求:**
```json
{
  "business_name": "Test Supplier Pty Ltd",
  "abn": "12345678901",
  "business_type": "decoration",
  "address": "123 Test St, Sydney NSW 2000",
  "contact_name": "John Doe",
  "contact_phone": "+61400123456",
  "contact_email": "supplier_test@example.com",
  "services": ["balloon_decoration", "flower_arrangement"],
  "portfolio_urls": ["https://example.com/portfolio1.jpg"],
  "experience_years": 5,
  "description": "Professional decoration supplier"
}
```

**预期结果:**
- HTTP 201 Created
- 申请状态为pending
- 生成application_id

#### A3. Admin审核通过
**Admin登录:**
```json
{
  "username": "admin@partyonce.au",
  "password": "Admin123!"
}
```

**审核请求:**
```json
{
  "status": "approved",
  "notes": "Application approved - all documents verified"
}
```

**预期结果:**
- HTTP 200 OK
- 申请状态变为approved
- 供应商状态变为active

#### A4. 供应商查看合同
**请求:** GET /api/partner/contracts

**预期结果:**
- HTTP 200 OK
- 返回合同详情
- 合同状态为pending_signature

#### A5. 签署合同
**请求:**
```json
{
  "agreed": true,
  "signed_at": "2024-01-15T10:00:00Z",
  "ip_address": "192.168.1.1"
}
```

**预期结果:**
- HTTP 200 OK
- 合同状态变为signed
- 生成合同编号

#### A6. 上传10张图片
**测试数据:**
- 10张JPG图片，每张2-5MB
- 分辨率：1920x1080

**请求:** POST /api/partner/materials/upload (multipart/form-data)

**预期结果:**
- HTTP 201 Created
- 每张图片返回material_id
- 状态为processing → ready

#### A7. 上传视频
**测试数据:**
- 1个MP4视频，时长45秒，50MB
- 分辨率：1080p

**预期结果:**
- HTTP 201 Created
- 视频状态为processing → ready
- 生成缩略图

#### A8. 验证素材状态
**请求:** GET /api/partner/materials

**验证点:**
- 返回11个素材（10图+1视频）
- 所有素材状态为ready
- 有缩略图URL

#### A9. Admin查看供应商信息
**请求:** GET /api/admin/partners/{supplier_id}

**验证点:**
- 供应商信息完整
- 合同已签署
- 素材列表正确

---

## 闭环B：模板库 → 订单 → 我的活动 → 相册上传

### 测试目标
验证用户从浏览模板到上传活动相册的完整流程

### API端点
| 功能 | 端点 | 方法 |
|------|------|------|
| 创建模板 | /api/admin/templates | POST |
| 模板列表 | /api/templates | GET |
| 模板详情 | /api/templates/{id} | GET |
| 创建订单 | /api/orders | POST |
| 订单详情 | /api/orders/{id} | GET |
| 活动详情 | /api/events/{id} | GET |
| 拍照指南 | /api/events/{id}/guide | GET |
| 上传相册 | /api/events/{id}/album/upload | POST |
| 相册列表 | /api/events/{id}/album | GET |

### 测试步骤

#### B1. Admin创建模板
**请求:**
```json
{
  "name": "Elegant Birthday Party",
  "description": "Perfect for adult birthday celebrations",
  "category": "birthday",
  "cover_image": "https://cdn.partyonce.au/templates/birthday_cover.jpg",
  "preview_images": [
    "https://cdn.partyonce.au/templates/birthday_1.jpg",
    "https://cdn.partyonce.au/templates/birthday_2.jpg"
  ],
  "materials_checklist": [
    {"item": "Balloon arch", "quantity": "1 set", "priority": "high"},
    {"item": "Table centerpieces", "quantity": "10 pcs", "priority": "medium"},
    {"item": "Photo backdrop", "quantity": "1 pc", "priority": "high"},
    {"item": "LED string lights", "quantity": "20m", "priority": "medium"}
  ],
  "estimated_budget": {"min": 800, "max": 1500},
  "recommended_venue_type": ["indoor_hall", "outdoor_garden"],
  "duration_hours": 4,
  "max_guests": 50,
  "photography_guide": {
    "recommended_positions": [
      {"name": "Entrance Arch", "description": "Welcome photo spot"},
      {"name": "Cake Table", "description": "Cake cutting moment"},
      {"name": "Photo Wall", "description": "Group photos"}
    ],
    "must_shot_list": [
      "Group photo at entrance",
      "Cake cutting ceremony",
      "Host with guests",
      "Decoration details",
      "Food and drinks setup"
    ]
  },
  "status": "active"
}
```

**预期结果:**
- HTTP 201 Created
- 返回template_id
- 状态为active

#### B2. 用户浏览模板库
**请求:** GET /api/templates

**预期结果:**
- HTTP 200 OK
- 返回模板列表
- 包含刚创建的模板

#### B3. 用户选择模板并创建订单
**请求:**
```json
{
  "template_id": 1,
  "event_name": "Sarah's 30th Birthday",
  "event_type": "birthday",
  "event_date": "2024-06-15T18:00:00Z",
  "venue_id": 1,
  "guest_count": 30,
  "special_requests": "Allergic to latex balloons, use foil only",
  "contact_info": {
    "name": "Sarah Chen",
    "phone": "+61400111111",
    "email": "sarah@example.com"
  },
  "budget_confirmed": true
}
```

**预期结果:**
- HTTP 201 Created
- 生成order_id
- 订单状态为confirmed
- 自动创建event_id

#### B4. 查看我的活动详情
**请求:** GET /api/events/{event_id}

**预期结果:**
- HTTP 200 OK
- 活动信息完整
- 关联模板信息正确
- 关联订单信息正确

#### B5. 查看拍照指南
**请求:** GET /api/events/{event_id}/guide

**预期结果:**
- HTTP 200 OK
- 返回推荐机位列表
- 返回必拍清单

#### B6. 上传照片到活动相册
**测试数据:**
- 20张活动照片（JPG，3-8MB）

**请求:** POST /api/events/{event_id}/album/upload

**预期结果:**
- HTTP 201 Created
- 照片关联到event_id
- 生成缩略图

#### B7. 上传视频到活动相册
**测试数据:**
- 2个活动视频（MP4，30-60秒）

**预期结果:**
- HTTP 201 Created
- 视频关联到event_id
- 状态为ready

#### B8. 验证相册显示
**请求:** GET /api/events/{event_id}/album

**验证点:**
- 返回22个媒体文件（20图+2视频）
- 缩略图正常显示
- 可按类型筛选

---

## 闭环C：分享链接 → 落地页 → 归因统计

### 测试目标
验证分享链接生成、追踪和归因统计的完整流程

### API端点
| 功能 | 端点 | 方法 |
|------|------|------|
| 生成分享链接 | /api/events/{id}/share | POST |
| 访问落地页 | /s/{share_code} | GET |
| 落地页内容 | /api/share/{code} | GET |
| 追踪点击 | /api/share/{code}/track | POST |
| 注册归因 | /api/users/register | POST |
| 分享统计 | /api/share/{code}/stats | GET |

### 测试步骤

#### C1. 用户生成分享链接
**请求:**
```json
{
  "event_id": 1,
  "title": "Check out Sarah's birthday party!",
  "description": "Amazing decoration and great memories",
  "expiry_days": 30,
  "allow_download": true
}
```

**预期结果:**
- HTTP 201 Created
- 返回share_url: `https://partyonce.au/s/{code}`
- 返回share_code（6位字母数字）

#### C2. 验证分享链接格式
**验证点:**
- URL格式: `https://partyonce.au/s/[A-Za-z0-9]{6}`
- share_code长度为6
- 包含有效的事件信息

#### C3. 朋友点击分享链接
**请求:** GET /s/{share_code}

**预期结果:**
- HTTP 200 OK
- 返回H5落地页HTML
- 页面包含事件标题、描述和相册预览

#### C4. 验证落地页内容
**请求:** GET /api/share/{share_code}

**预期结果:**
- HTTP 200 OK
- 返回事件基本信息
- 返回相册缩略图列表
- 返回分享者信息

#### C5. 验证click事件记录
**数据库验证:**
```sql
SELECT * FROM share_events 
WHERE share_code = '{code}' AND event_type = 'click';
```

**验证点:**
- 记录存在
- event_type = 'click'
- 有正确的ip_address
- 有user_agent信息
- created_at不为空

#### C6. 朋友通过链接注册
**请求:**
```json
{
  "email": "friend_test@example.com",
  "password": "Friend123!",
  "full_name": "Friend User",
  "user_type": "personal",
  "role": "user",
  "phone": "+61400222222",
  "referral_code": "{share_code}"
}
```

**预期结果:**
- HTTP 201 Created
- 用户注册成功
- 返回user_id

#### C7. 验证signup事件记录
**数据库验证:**
```sql
SELECT * FROM share_events 
WHERE share_code = '{code}' AND event_type = 'signup';
```

**验证点:**
- 记录存在
- event_type = 'signup'
- referred_user_id = 新用户ID
- 与click事件关联

---

## 闭环D：钱包自动入账

### 测试目标
验证分享返利规则的配置和自动入账流程

### API端点
| 功能 | 端点 | 方法 |
|------|------|------|
| 配置返利规则 | /api/admin/referral/config | POST |
| 查看返利规则 | /api/admin/referral/config | GET |
| 用户钱包 | /api/wallet | GET |
| 钱包流水 | /api/wallet/ledger | GET |
| 创建订单 | /api/orders | POST |
| 支付定金 | /api/orders/{id}/payment | POST |

### 返利规则配置
```json
{
  "click_reward": 0.20,
  "signup_reward": 2.00,
  "deposit_reward": 20.00,
  "min_withdrawal": 50.00,
  "reward_currency": "AUD",
  "validity_days": 90
}
```

### 测试步骤

#### D1. Admin配置返利规则
**请求:**
```json
{
  "click_reward": 0.20,
  "signup_reward": 2.00,
  "deposit_reward": 20.00,
  "min_withdrawal": 50.00,
  "reward_currency": "AUD",
  "validity_days": 90,
  "is_active": true
}
```

**预期结果:**
- HTTP 200 OK
- 配置保存成功
- 立即生效

#### D2. 用户A生成分享链接
同闭环C步骤C1

#### D3. 用户B点击链接验证返利
**前置条件:** 用户A钱包初始余额为$0

**操作:** 用户B点击分享链接

**验证:**
```sql
SELECT balance FROM wallets WHERE user_id = {user_a_id};
-- 预期: 0.20
```

**预期结果:**
- 用户A钱包余额: $0.20
- wallet_ledger有click记录

#### D4. 用户B注册验证返利
**操作:** 用户B完成注册

**验证:**
```sql
SELECT balance FROM wallets WHERE user_id = {user_a_id};
-- 预期: 2.20 (0.20 + 2.00)
```

**预期结果:**
- 用户A钱包余额: $2.20
- wallet_ledger有signup记录

#### D5. 用户B下单并支付定金
**创建订单:**
```json
{
  "template_id": 1,
  "event_name": "Friend's Party",
  "event_date": "2024-07-01T18:00:00Z",
  "venue_id": 1,
  "guest_count": 20,
  "total_amount": 1500.00,
  "deposit_amount": 300.00
}
```

**支付定金:**
```json
{
  "payment_method": "credit_card",
  "amount": 300.00,
  "stripe_token": "tok_visa"
}
```

**预期结果:**
- 订单状态: deposit_paid
- 支付成功

#### D6. 验证deposit返利
**验证:**
```sql
SELECT balance FROM wallets WHERE user_id = {user_a_id};
-- 预期: 22.20 (2.20 + 20.00)
```

**预期结果:**
- 用户A钱包余额: $22.20
- wallet_ledger有deposit记录

#### D7. 验证wallet_ledger完整流水
**请求:** GET /api/wallet/ledger

**预期结果:**
```json
{
  "transactions": [
    {
      "id": 3,
      "type": "referral_deposit",
      "amount": 20.00,
      "description": "Referral reward - friend deposit",
      "reference_id": "order_456",
      "created_at": "2024-01-15T12:00:00Z"
    },
    {
      "id": 2,
      "type": "referral_signup",
      "amount": 2.00,
      "description": "Referral reward - friend signup",
      "reference_id": "user_789",
      "created_at": "2024-01-15T11:30:00Z"
    },
    {
      "id": 1,
      "type": "referral_click",
      "amount": 0.20,
      "description": "Referral reward - link click",
      "reference_id": "share_abc123",
      "created_at": "2024-01-15T11:00:00Z"
    }
  ],
  "total_count": 3
}
```

#### D8. 验证wallets.balance余额
**请求:** GET /api/wallet

**预期结果:**
```json
{
  "user_id": 123,
  "balance": 22.20,
  "currency": "AUD",
  "pending_balance": 0.00,
  "lifetime_earnings": 22.20,
  "last_updated": "2024-01-15T12:00:00Z"
}
```

---

## 测试数据清理

每个测试套件执行后应清理测试数据：

```sql
-- 清理测试用户
DELETE FROM users WHERE email LIKE '%test@example.com';

-- 清理测试供应商
DELETE FROM partner_applications WHERE contact_email LIKE '%test@example.com';

-- 清理测试订单
DELETE FROM orders WHERE event_name LIKE 'Test%';

-- 清理测试分享
DELETE FROM share_links WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 DAY);

-- 清理测试钱包记录
DELETE FROM wallet_ledger WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 DAY);
```

---

## 附录：数据库Schema参考

### 供应商相关表
- partner_applications
- partner_contracts
- partner_materials

### 模板订单相关表
- templates
- orders
- events
- event_albums

### 分享归因相关表
- share_links
- share_events

### 钱包相关表
- wallets
- wallet_ledger
- referral_configs
