# PartyOnce 测试账号与验收指南

**文档版本**: 2026-03-03  
**测试环境**: Staging (待部署)  
**后端版本**: Phase 1-4

---

## 🔑 测试账号

### 1. Admin账号（管理员）
```
邮箱: admin@partyonce.au
密码: Admin123!
角色: admin
权限: 供应商审核、模板管理、全量数据查看
```

### 2. Supplier账号（供应商）
```
邮箱: supplier@partyonce.au
密码: Supplier123!
角色: supplier
权限: 入驻申请、合同签署、素材上传、查看自己的数据
```

### 3. User账号（普通用户）
```
邮箱: user@partyonce.au
密码: User123!
角色: user
权限: 浏览模板、创建活动、生成分享、查看钱包
```

### 4. 测试新用户（用于注册归因测试）
```
邮箱: newuser@test.com
密码: NewUser123!
用途: 测试分享链接注册归因
```

---

## 🧪 四个闭环验收测试步骤

### 闭环A: 供应商入驻 → 合同签署 → 素材上传

**步骤1: 供应商入驻**
1. 用 `supplier@partyonce.au` 登录
2. POST `/api/partners/apply` 提交申请
3. 用 `admin@partyonce.au` 登录
4. POST `/api/admin/partners/{id}/approve` 审核通过
5. 验证: GET `/api/partners/me` 返回状态 `approved`

**步骤2: 合同签署**
1. GET `/api/partner/contracts` 查看合同列表
2. POST `/api/partner/contracts/{id}/accept` 确认签署
3. 验证: 再次获取合同列表，状态显示 `signed`

**步骤3: 素材上传**
1. POST `/api/media/presign` 获取上传URL
2. PUT 文件到 presign URL（直传到R2）
3. POST `/api/media/confirm` 确认上传完成
4. GET `/api/partner/media` 验证素材列表

**验收标准**:
- [ ] 供应商状态从 `pending` → `approved`
- [ ] 合同状态显示 `已签署`
- [ ] 数据库 `partner_contract_acceptances` 有记录
- [ ] 素材上传成功，状态 `ready`
- [ ] 数据库 `media_assets` 有记录

---

### 闭环B: 模板库 → 活动 → 相册

**步骤1: 模板库**
1. GET `/api/templates` 获取模板列表
2. GET `/api/templates/{id}` 查看模板详情
3. 验证: 返回模板信息、物料清单(BOM)

**步骤2: 创建活动**
1. POST `/api/my/events` 创建活动（绑定模板）
2. GET `/api/my/events` 查看活动列表
3. GET `/api/my/events/{id}` 查看活动详情

**步骤3: 相册上传**
1. POST `/api/media/presign` 获取上传URL
2. PUT 上传照片
3. POST `/api/media/confirm` 确认上传
4. POST `/api/events/{id}/album` 关联到活动相册
5. GET `/api/my/events/{id}` 验证相册显示

**验收标准**:
- [ ] 模板列表/详情正常返回
- [ ] 活动创建成功，列表可见
- [ ] 照片上传到活动相册成功
- [ ] 数据库 `event_albums` 有记录

---

### 闭环C: 分享链接 → 落地页 → 归因

**步骤1: 创建分享**
1. POST `/api/shares` 创建分享链接
2. 获取 `share_code` 和 `share_url`

**步骤2: 访问落地页**
1. 用浏览器访问 `GET /s/{share_code}`
2. 验证: 页面显示内容（图文）
3. 验证: 数据库 `share_events` 新增 `click` 记录

**步骤3: 注册归因**
1. 新用户通过分享链接注册（带 `?ref={share_code}`）
2. POST `/api/shares/{share_code}/track` 记录 `signup` 事件
3. 验证: 数据库 `share_events` 有 `signup` 记录
4. 验证: 数据库 `user_referrals` 建立推荐关系

**验收标准**:
- [ ] 分享链接生成成功
- [ ] 落地页可访问，自动记录click
- [ ] 注册后正确归因到分享者
- [ ] 数据库 `share_events` 有 `click` 和 `signup` 记录

---

### 闭环D: 钱包自动入账

**步骤1: 查看钱包**
1. GET `/api/wallet` 查看余额
2. GET `/api/wallet/ledger` 查看流水
3. 初始余额应为 $0

**步骤2: 触发返利**
1. 用测试账号生成分享链接
2. 模拟点击 → 验证 `click` 奖励入账 $0.05
3. 模拟注册 → 验证 `signup` 奖励入账 $1
4. 模拟成交 → 验证 `deposit` 奖励入账 $20

**步骤3: 验证入账**
1. GET `/api/wallet` 余额更新
2. GET `/api/wallet/ledger` 流水记录
3. 验证: 数据库 `wallet_ledger` 有记录
4. 验证: 数据库 `wallets` 余额正确

**返利规则**:
| 事件 | 奖励 | 限制 |
|------|------|------|
| click | $0.05 | 每日上限10次 |
| signup | $1.00 | 无限制 |
| deposit | $20.00 | 每单限1次 |

**验收标准**:
- [ ] 钱包初始余额为 $0
- [ ] click事件触发 $0.05 入账
- [ ] signup事件触发 $1 入账
- [ ] deposit事件触发 $20 入账
- [ ] 流水记录完整，余额正确

---

## 📊 数据库验证SQL

```sql
-- 1. 验证供应商记录
SELECT id, company_name, category, status, created_at 
FROM partners 
WHERE email='supplier@partyonce.au';

-- 2. 验证合同签署记录
SELECT pca.id, p.company_name, pc.title, pca.accepted_at
FROM partner_contract_acceptances pca
JOIN partners p ON pca.partner_id = p.id
JOIN partner_contracts pc ON pca.contract_id = pc.id
WHERE p.email='supplier@partyonce.au';

-- 3. 验证媒体素材记录
SELECT id, owner_type, media_type, status, url
FROM media_assets
WHERE owner_type='supplier' AND owner_id=(SELECT id FROM partners WHERE email='supplier@partyonce.au');

-- 4. 验证分享链接记录
SELECT id, share_code, owner_user_id, object_type, click_count
FROM shares
WHERE owner_user_id=(SELECT id FROM users WHERE email='user@partyonce.au');

-- 5. 验证归因事件记录
SELECT se.id, se.share_id, se.event_type, se.user_id, se.created_at
FROM share_events se
JOIN shares s ON se.share_id = s.id
WHERE s.owner_user_id=(SELECT id FROM users WHERE email='user@partyonce.au');

-- 6. 验证钱包记录
SELECT user_id, balance, currency
FROM wallets
WHERE user_id=(SELECT id FROM users WHERE email='user@partyonce.au');

-- 7. 验证钱包流水
SELECT id, user_id, amount, type, reason, created_at
FROM wallet_ledger
WHERE user_id=(SELECT id FROM users WHERE email='user@partyonce.au')
ORDER BY created_at DESC;
```

---

## 🎥 录屏要求

每个闭环需提供 30-60 秒录屏，展示：

1. **闭环A**: 提交申请 → 审核通过 → 合同签署 → 素材上传
2. **闭环B**: 浏览模板 → 创建活动 → 上传相册 → 查看结果
3. **闭环C**: 生成分享 → 打开落地页 → 新用户注册 → 归因成功
4. **闭环D**: 查看钱包 → 触发返利 → 余额更新 → 流水记录

---

## 📞 技术支持

如有问题，请联系开发团队。

**验收标准**: 四个闭环全部跑通，数据库记录完整，录屏证明功能正常。
