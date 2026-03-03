# PartyOnce 报价系统开发进度报告

## 完成时间
2026-03-02

## 开发内容

### 1. 数据库模型（已添加到 main.py）

#### Quote 表（报价单主表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Integer | 主键 |
| quote_number | String(50) | 报价单号（唯一） |
| customer_name | String(255) | 客户姓名 |
| customer_email | String(255) | 客户邮箱 |
| customer_phone | String(50) | 客户电话 |
| customer_type | String(50) | 客户类型（personal/corporate/vip） |
| company_name | String(255) | 公司名称 |
| event_name | String(255) | 活动名称 |
| event_type | String(100) | 活动类型 |
| event_date | DateTime | 活动日期 |
| event_duration_hours | Integer | 活动时长 |
| guest_count | Integer | 参加人数 |
| venue_id | Integer | 场地ID（外键） |
| subtotal | DECIMAL(12,2) | 小计金额 |
| venue_discount_amount | DECIMAL(12,2) | 场地折扣金额 |
| vip_discount_amount | DECIMAL(12,2) | VIP折扣金额 |
| other_discount_amount | DECIMAL(12,2) | 其他折扣金额 |
| discount_total | DECIMAL(12,2) | 折扣总计 |
| tax_rate | DECIMAL(5,4) | 税率 |
| tax_amount | DECIMAL(12,2) | 税额 |
| total_amount | DECIMAL(12,2) | 总金额 |
| status | String(50) | 状态 |
| valid_until | DateTime | 有效期至 |
| created_by | Integer | 创建人ID |
| created_at | DateTime | 创建时间 |
| updated_at | DateTime | 更新时间 |

#### QuoteItem 表（报价明细表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Integer | 主键 |
| quote_id | Integer | 报价单ID（外键） |
| item_type | String(50) | 项目类型 |
| item_name | String(255) | 项目名称 |
| unit_price | DECIMAL(12,2) | 单价 |
| quantity | Integer | 数量 |
| discount_rate | DECIMAL(5,4) | 折扣率 |
| original_amount | DECIMAL(12,2) | 原始金额 |
| final_amount | DECIMAL(12,2) | 最终金额 |

### 2. API 端点（已添加到 main.py）

#### 报价计算
- **POST** `/api/quotes/calculate`
  - 功能：计算报价，不保存到数据库
  - 支持：场地费用、物料费用、人工费用、服务费用计算
  - 自动应用：VIP折扣、合作场地折扣
  - 返回：详细的价格明细和折扣明细

#### 报价单管理
- **POST** `/api/quotes`
  - 功能：创建并保存报价单
  - 生成唯一报价单号（格式：Q-YYYYMMDD-XXXX）
  - 支持设置有效期（默认30天）

- **GET** `/api/quotes`
  - 功能：获取报价单列表
  - 支持筛选：状态、客户类型、活动类型
  - 支持搜索：报价单号、客户名、邮箱、活动名
  - 支持分页：skip/limit

- **GET** `/api/quotes/{quote_id}`
  - 功能：获取报价单详情
  - 包含：完整客户信息、活动信息、费用明细

- **PATCH** `/api/quotes/{quote_id}`
  - 功能：更新报价单
  - 支持更新：客户信息、活动信息、场地、项目明细
  - 更新项目时自动重新计算价格

- **DELETE** `/api/quotes/{quote_id}`
  - 功能：删除报价单

#### 报价状态管理
- **POST** `/api/quotes/{quote_id}/send`
  - 将报价单标记为"已发送"

- **POST** `/api/quotes/{quote_id}/approve`
  - 批准报价单

- **POST** `/api/quotes/{quote_id}/reject`
  - 拒绝报价单

### 3. 报价计算逻辑

#### 费用类型支持
1. **场地费用（venue）**
   - 自动检测合作场地
   - 自动应用合作折扣率

2. **物料费用（material）**
   - 支持数量和单价
   - 可设置折扣率

3. **人工费用（labor）**
   - 按小时/人计费
   - 支持数量设置

4. **服务费用（service）**
   - 其他服务费用

#### 折扣计算
1. **合作场地折扣**
   - 根据 Venue.discount_rate 自动计算
   - 仅应用于场地费用

2. **VIP客户折扣**
   - personal: 0%
   - corporate: 5%
   - vip: 15%
   - 应用于非场地项目

3. **额外折扣**
   - 可设置额外折扣率
   - 在前述折扣后应用

#### 税费计算
- 默认税率：10%（GST）
- 计算基础：折扣后金额
- 可自定义税率

### 4. 报价单状态流程
```
draft（草稿） → sent（已发送） → approved（已批准）
                      ↓
                rejected（已拒绝）
                      ↓
                expired（已过期）
```

### 5. 数据验证
- 客户信息必填：姓名、邮箱
- 活动信息必填：类型、日期
- 项目明细：支持空列表
- 金额计算：保留2位小数

## 待办事项

### 前端集成
- [ ] 创建报价单页面
- [ ] 报价单列表页面
- [ ] 报价单详情页面
- [ ] 报价单PDF导出功能

### 增强功能
- [ ] 报价单邮件发送功能
- [ ] 报价单PDF生成
- [ ] 报价单模板管理
- [ ] 批量报价功能

### 数据库
- [ ] 运行数据库迁移创建新表
- [ ] 添加索引优化查询

## 使用方法

### 示例：计算报价
```bash
curl -X POST "http://localhost:8000/api/quotes/calculate" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "customer": {
      "name": "张三",
      "email": "zhangsan@example.com",
      "phone": "0412345678",
      "customer_type": "vip"
    },
    "event": {
      "name": "生日派对",
      "event_type": "birthday",
      "event_date": "2026-03-15T18:00:00",
      "duration_hours": 4,
      "guest_count": 50
    },
    "venue_id": 1,
    "items": [
      {"item_type": "venue", "item_name": "豪华宴会厅", "unit_price": 2000, "quantity": 1},
      {"item_type": "material", "item_name": "装饰品", "unit_price": 500, "quantity": 1},
      {"item_type": "labor", "item_name": "布置人员", "unit_price": 50, "quantity": 4, "unit": "hour"},
      {"item_type": "service", "item_name": "摄影服务", "unit_price": 800, "quantity": 1}
    ]
  }'
```

### 示例：保存报价
```bash
curl -X POST "http://localhost:8000/api/quotes" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "customer": {...},
    "event": {...},
    "venue_id": 1,
    "items": [...],
    "valid_days": 30
  }'
```

## 文件变更
- **修改**: `backend/main.py` - 添加报价系统完整功能

## 下一步
1. 运行数据库迁移创建 quotes 和 quote_items 表
2. 前端开发报价单相关页面
3. 测试报价计算逻辑
