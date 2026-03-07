# 技术债清单 - Wallet 模块

> 记录 wallet / wallet_ledger 相关技术债务，供后续重构参考

## 1. 当前生产表结构

### wallets 表
```sql
CREATE TABLE wallets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    owner_id INT NOT NULL,
    owner_type VARCHAR(50) DEFAULT 'user',
    available_balance DECIMAL(12,2) DEFAULT 0.00,
    frozen_balance DECIMAL(12,2) DEFAULT 0.00,
    total_earned DECIMAL(12,2) DEFAULT 0.00,
    total_withdrawn DECIMAL(12,2) DEFAULT 0.00,
    currency VARCHAR(10) DEFAULT 'USD',
    status VARCHAR(50) DEFAULT 'active',
    withdrawal_method VARCHAR(50),
    withdrawal_account JSON,
    last_activity_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### wallet_ledger 表
```sql
CREATE TABLE wallet_ledger (
    id INT PRIMARY KEY AUTO_INCREMENT,
    wallet_id INT NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    direction VARCHAR(10) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    balance_before DECIMAL(12,2) NOT NULL,
    balance_after DECIMAL(12,2) NOT NULL,
    source_type VARCHAR(50),
    source_id INT,
    description TEXT,
    reference_number VARCHAR(100),
    status VARCHAR(50) DEFAULT 'completed',
    processed_at DATETIME,
    processed_by INT,
    extra_data JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 2. 旧版 Schema 兼容逻辑

### 当前状态
- ✅ 生产环境 `wallet_ledger` 表已有 `wallet_id` 列
- ✅ 无 `user_id` 列（旧版设计）
- ❌ 代码中仍保留对 `user_id` 列的兼容逻辑（已失效）

### 待清理代码
文件：`backend/main.py`
- 行号 3650-3710：旧版 `user_id` 兼容分支（已不可达）
- 建议：移除 legacy 分支，只保留 `wallet_id` 逻辑

## 3. 动态表结构检查接口

### 使用 `sa_inspect` 的接口清单

| 接口 | 位置 | 用途 | 风险 |
|------|------|------|------|
| `/api/wallet/ledger` | main.py:3650 | 检查 wallet_ledger 列 | ⚠️ 已导致 500 |
| 其他 | 暂无 | - | - |

### 建议
- 移除所有 `sa_inspect` 调用
- 改用固定 schema 假设 + 异常捕获
- 如需要多版本兼容，使用显式版本号而非动态检查

## 4. Wallet 模块结构统一建议

### 当前问题
1. **表结构检查过于复杂** - 动态检查导致不可预期错误
2. **自动创建逻辑分散** - `get_or_create_wallet` 多处使用
3. **Legacy 代码残留** - 旧版 `user_id` 兼容分支已失效

### 重构建议

#### 阶段 1：清理（短期）- 计划中 ⏳
> 注：当前系统处于观察期，待稳定后再执行

- [ ] 移除 `sa_inspect` 调用
- [ ] 移除 `user_id` 兼容分支
- [ ] 统一异常处理：返回空列表而非 500

#### 阶段 2：重构（中期）
- [ ] 提取 wallet 模块到单独文件
- [ ] 统一 `get_or_create_wallet` 逻辑
- [ ] 添加 wallet 创建钩子（用户注册时自动创建）

#### 阶段 3：优化（长期）
- [ ] 考虑 wallet 与 user 的一对一关系优化
- [ ] 添加 wallet 余额变更日志
- [ ] 考虑分库分表（如数据量增长）

### 优先级与时间安排
| 项目 | 优先级 | 预估工作量 | 状态 |
|------|--------|-----------|------|
| 移除 sa_inspect | 🔴 高 | 2h | ✅ 已修复 |
| 清理 legacy 分支 | 🟡 中 | 4h | ⏳ 计划中（稳定后执行） |
| 模块重构 | 🟢 低 | 2d | 📋 待安排 |

## 5. 相关提交记录

- `b6962456` - Hotfix: 简化 wallet_ledger 查询逻辑

---

**最后更新**: 2026-03-07
**负责人**: 老四/Moses
