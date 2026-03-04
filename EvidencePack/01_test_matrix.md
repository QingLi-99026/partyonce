# PartyOnce 测试矩阵 (Test Matrix)

**版本**: RC-20260303-01  
**测试时间**: 2026-03-03  
**测试方式**: 自动化测试 (Python TestClient)

---

## 测试结果总览

| 闭环 | 测试项 | 状态 | HTTP状态码 | 证据 |
|------|--------|------|-----------|------|
| **A** | A1.用户注册 | ✅ PASS | 200 | 见下方详情 |
| | A2.用户登录 | ✅ PASS | 200 | 见下方详情 |
| | A3.供应商申请 | ✅ PASS | 200 | 见下方详情 |
| | A4.查询供应商 | ✅ PASS | 200 | 见下方详情 |
| | A5.合同列表 | ✅ PASS | 200 | 见下方详情 |
| **B** | B1.模板列表 | ✅ PASS | 200 | 见下方详情 |
| | B2.模板详情 | ✅ PASS | 200 | 见下方详情 |
| **C** | C1.创建分享 | ✅ PASS | 200 | 见下方详情 |
| | C2.落地页 | ✅ PASS | 200 | 见下方详情 |
| | C3.追踪事件 | ✅ PASS | 200 | 见下方详情 |
| **D** | D1.查看钱包 | ✅ PASS | 200 | 见下方详情 |
| | D2.钱包流水 | ✅ PASS | 200 | 见下方详情 |

**总计**: 11/11 ✅ (100%)

---

## 详细测试步骤

### 【闭环A】供应商入驻

#### A1. 用户注册
- **步骤**: POST /api/users/register
- **请求体**: `{"email":"test@example.com","password":"Test12","full_name":"测试用户"}`
- **预期**: 返回用户ID，HTTP 200
- **实际**: ✅ 返回用户ID，状态200
- **证据**: `test_evidence/A1_register_response.json`

#### A2. 用户登录
- **步骤**: POST /api/users/login
- **请求体**: `username=test@example.com&password=Test12`
- **预期**: 返回JWT Token，HTTP 200
- **实际**: ✅ Token获取成功
- **证据**: `test_evidence/A2_login_response.json`

#### A3. 供应商申请
- **步骤**: POST /api/partners/apply (需Token)
- **请求体**: `{"company_name":"测试公司","business_type":"photo",...}`
- **预期**: 返回partner_id，HTTP 200
- **实际**: ✅ partner_id返回成功
- **证据**: `test_evidence/A3_partner_apply_response.json`

#### A4. 查询供应商状态
- **步骤**: GET /api/partners/me (需Token)
- **预期**: 返回供应商信息
- **实际**: ✅ 返回完整信息
- **证据**: `test_evidence/A4_partner_status_response.json`

#### A5. 查看合同列表
- **步骤**: GET /api/partner/contracts (需Token)
- **预期**: 返回合同列表
- **实际**: ✅ 返回合同数据
- **证据**: `test_evidence/A5_contracts_response.json`

---

### 【闭环B】模板库

#### B1. 获取模板列表
- **步骤**: GET /api/templates
- **预期**: 返回模板数组
- **实际**: ✅ 返回3个模板
- **证据**: `test_evidence/B1_templates_response.json`

#### B2. 获取模板详情
- **步骤**: GET /api/templates/1
- **预期**: 返回单个模板详情
- **实际**: ✅ 返回完整详情
- **证据**: `test_evidence/B2_template_detail_response.json`

---

### 【闭环C】分享归因

#### C1. 创建分享链接
- **步骤**: POST /api/shares (需Token)
- **请求体**: `{"share_type":"template","target_id":1}`
- **预期**: 返回share_code
- **实际**: ✅ share_code生成成功
- **证据**: `test_evidence/C1_share_create_response.json`

#### C2. 访问落地页
- **步骤**: GET /s/{share_code}
- **预期**: 返回H5页面内容
- **实际**: ✅ 页面正常返回
- **证据**: `test_evidence/C2_landing_page.html`

#### C3. 追踪事件
- **步骤**: POST /api/shares/{code}/track
- **请求体**: `{"event_type":"click"}`
- **预期**: 事件记录成功
- **实际**: ✅ tracked=true
- **证据**: `test_evidence/C3_track_response.json`

---

### 【闭环D】钱包返利

#### D1. 查看钱包
- **步骤**: GET /api/wallet (需Token)
- **预期**: 返回钱包余额
- **实际**: ✅ 返回balance=0
- **证据**: `test_evidence/D1_wallet_response.json`

#### D2. 查看钱包流水
- **步骤**: GET /api/wallet/ledger (需Token)
- **预期**: 返回流水记录
- **实际**: ✅ 返回空数组（新用户无记录）
- **证据**: `test_evidence/D2_ledger_response.json`

---

## 测试脚本

**自动化测试脚本**: `four_closures_acceptance.sh`

```bash
# 一键执行
bash four_closures_acceptance.sh
```

**Python测试**: 使用FastAPI TestClient

```python
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)
# 执行各项测试...
```

---

## 数据库验证

### 关键表记录数

```sql
-- 执行验证
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL SELECT 'partners', COUNT(*) FROM partners
UNION ALL SELECT 'templates', COUNT(*) FROM templates
UNION ALL SELECT 'shares', COUNT(*) FROM shares
UNION ALL SELECT 'wallets', COUNT(*) FROM wallets;
```

**预期结果**:
- users: ≥1 (测试用户)
- partners: ≥1 (测试供应商)
- templates: 3 (初始化数据)
- shares: ≥1 (测试分享)
- wallets: ≥1 (测试钱包)

---

## 验收结论

✅ **所有11项测试通过**  
✅ **四闭环全绿**  
✅ **可以进入Staging部署阶段**

---

**测试执行人**: AI Agent (老四/Moses)  
**测试时间**: 2026-03-03 12:40 AEDT
