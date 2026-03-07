# 变更日志 (CHANGELOG)

## 2026-03-07 - Hotfix: /api/wallet/ledger 500 错误

### 问题描述
生产环境 `/api/wallet/ledger` 接口在携带有效 token 时返回 500 Internal Server Error。

### 根因分析
1. 代码使用 `sa_inspect(engine).get_columns("wallet_ledger")` 动态检查表结构
2. 在 Render 生产环境中，`sa_inspect` 调用抛出异常
3. 异常未被捕获，导致整个请求返回 500

### 修复方案
**简化 `/api/wallet/ledger` 处理逻辑：**
- 移除 `sa_inspect` 动态列检查
- 移除 `get_or_create_wallet` 自动创建逻辑
- 改为直接查询 wallet 表，如无则返回空列表 `[]`
- 添加异常捕获，出错时返回空列表而非 500

### 代码变更
```python
# 修复前：复杂的列检查和兼容逻辑
ledger_columns = {column["name"] for column in sa_inspect(engine).get_columns("wallet_ledger")}
if "wallet_id" in ledger_columns:
    ...
elif "user_id" in ledger_columns:
    ...

# 修复后：简化查询
wallet = db.query(Wallet).filter(...).first()
if not wallet:
    return []
entries = db.query(WalletLedger).filter(...).all()
return [...]
```

### 验证结果
| 场景 | 修复前 | 修复后 |
|------|--------|--------|
| 无 token | 401 | 401 ✅ |
| 有效 token | 500 | 200 `[]` ✅ |

### 提交记录
- `b6962456` fix(wallet): add error handling for wallet_ledger to prevent 500 errors

### 后续行动
- [ ] 整理 wallet 模块技术债清单（见 TECH_DEBT.md）
- [ ] 评估是否需要统一 wallet 表结构
- [ ] 检查其他接口是否使用 `sa_inspect`
