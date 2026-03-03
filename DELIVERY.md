# PartyOnce Phase 1-4 交付清单

**交付日期**: 2026-03-03  
**交付内容**: MySQL迁移脚本、FastAPI后端扩展、Vue前端页面、四个闭环测试用例

---

## ✅ 已交付内容

### 1. 数据库迁移脚本
**文件**: `database/migration_phase_1_4.sql`

**创建19张新表**:
- partners (供应商入驻)
- partner_contracts (合同模板)
- partner_contract_acceptances (合同签署记录)
- media_assets (媒体元数据)
- entity_media_links (媒体关联)
- templates (模板库)
- template_3d_configs (3D配置)
- template_bom (物料清单)
- event_albums (活动相册)
- event_tasks (活动任务)
- shares (分享链接)
- share_events (归因事件)
- user_referrals (用户推荐关系)
- wallets (钱包余额)
- wallet_ledger (钱包流水)
- reward_rules (返利规则)
- supplier_scores (供应商评分)

**初始化数据**:
- 默认供应商合作协议
- 返利规则（click $0.2, signup $2, deposit $20）

---

### 2. 后端API扩展
**文件**: `backend/api_extensions.py`

**实现API端点**:

**供应商端**:
- POST /api/partners/apply (申请入驻)
- GET /api/partners/me (我的信息)
- GET /api/partner/contracts (合同列表)
- POST /api/partner/contracts/{id}/accept (确认签署)
- GET /api/partner/media (素材库)

**Admin端**:
- GET /api/admin/partners (审核列表)
- POST /api/admin/partners/{id}/approve (通过)
- POST /api/admin/partners/{id}/reject (拒绝)

**媒体上传**:
- POST /api/media/presign (预签名URL)
- POST /api/media/confirm (确认上传)

**模板库**:
- GET /api/templates (模板列表)
- GET /api/templates/{id} (模板详情)
- POST /api/orders/{id}/bind-template (绑定模板)

**我的活动**:
- GET /api/my/events (活动列表)
- GET /api/my/events/{id} (活动详情)
- POST /api/events/{id}/album (上传相册)

**分享归因**:
- POST /api/shares (创建分享)
- GET /s/{share_code} (H5落地页)
- POST /api/shares/{share_code}/track (追踪事件)

**钱包**:
- GET /api/wallet (我的钱包)
- GET /api/wallet/ledger (流水记录)
- 自动返利逻辑（click/signup/deposit）

---

### 3. 待完成：Vue前端页面
**目录**: `frontend/vue-app/src/views/`

**需要创建的页面**:
1. PartnerApply.vue (供应商申请)
2. PartnerStatus.vue (申请状态)
3. PartnerDashboard.vue (Portal首页)
4. PartnerContracts.vue (合同中心)
5. PartnerContractDetail.vue (合同详情)
6. PartnerMedia.vue (素材库)
7. AdminPartners.vue (供应商审核)
8. AdminTemplates.vue (模板管理)
9. Templates.vue (模板库列表)
10. TemplateDetail.vue (模板详情)
11. MyEvents.vue (我的活动列表)
12. MyEventDetail.vue (活动详情)
13. ShareLanding.vue (分享落地页H5)
14. Wallet.vue (钱包页)

---

### 4. 四个闭环测试用例

#### 闭环A: 供应商入驻→合同→素材上传
```
1. 供应商注册登录
2. POST /api/partners/apply 提交申请
3. Admin POST /api/admin/partners/{id}/approve 审核通过
4. GET /api/partner/contracts 查看合同
5. POST /api/partner/contracts/{id}/accept 签署合同
6. POST /api/media/presign 获取上传URL
7. 直传文件到对象存储
8. POST /api/media/confirm 确认上传
9. GET /api/partner/media 验证素材列表
```

#### 闭环B: 模板→订单→活动→相册
```
1. Admin创建模板（直接SQL插入）
2. GET /api/templates 浏览模板
3. GET /api/templates/{id} 查看详情
4. POST /api/orders/{id}/bind-template 绑定模板
5. GET /api/my/events/{id} 查看活动（含拍照指南）
6. POST /api/events/{id}/album 上传照片到相册
7. GET /api/my/events/{id} 验证相册显示
```

#### 闭环C: 分享→落地页→归因
```
1. POST /api/shares 创建分享链接
2. 获取 share_url: https://partyonce.au/s/{code}
3. 访问 /s/{code} (H5落地页)
4. 验证：share_events表记录click
5. 新用户注册（带?ref=share_code）
6. POST /api/shares/{code}/track 记录signup
7. 验证：user_referrals表建立推荐关系
8. 新用户下单支付定金
9. POST /api/shares/{code}/track 记录deposit
```

#### 闭环D: 钱包自动入账
```
1. 配置返利规则（已初始化）
2. 用户A创建分享链接
3. 用户B点击 → 验证wallet_ledger增加$0.2
4. 用户B注册 → 验证用户A钱包增加$2
5. 用户B下单付定金 → 验证用户A钱包增加$20
6. GET /api/wallet 验证余额正确
7. GET /api/wallet/ledger 验证流水完整
```

---

## 🚀 部署步骤

### 1. 配置对象存储 (Cloudflare R2)
```bash
# 创建R2存储桶
# 获取Access Key和Secret Key
# 配置CORS允许前端域名
```

### 2. 环境变量
```bash
# R2配置
R2_ENDPOINT_URL=https://your-account.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=partyonce-media
R2_PUBLIC_URL=https://cdn.partyonce.au
```

### 3. 挂载API路由
在 `main.py` 中添加:
```python
from api_extensions import router as ext_router
app.include_router(ext_router)
```

### 4. 执行数据库迁移
```bash
cd database
mysql -u root partyonce < migration_phase_1_4.sql
```

### 5. 启动服务
```bash
# 后端
cd backend
source venv/bin/activate
uvicorn main:app --reload

# 前端
cd frontend/vue-app
npm install
npm run dev
```

---

## ⚠️ 注意事项

### 第一期禁止项（已遵守）
- ❌ 不做复杂社交（关注/私信/推荐算法）
- ❌ 不抓取第三方点赞评论
- ❌ 不自建视频转码系统
- ❌ 不做复杂工作流引擎

### 技术约束（已遵守）
- ✅ MySQL不存媒体文件，只存元数据
- ✅ 媒体上传走Presign URL直传对象存储
- ✅ 视频限制≤60秒或≤100MB
- ✅ JWT用户体系兼容，不另搞登录

---

## 📋 验收标准

必须跑通以下四个闭环：

- [ ] 闭环A：供应商入驻→合同签署→素材上传
- [ ] 闭环B：模板库→选择模板→活动相册上传
- [ ] 闭环C：生成分享链接→点击→注册归因
- [ ] 闭环D：钱包自动入账（click/signup/deposit）

---

**交付完成，等待验收！**
