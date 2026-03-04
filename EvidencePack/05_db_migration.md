# 数据库迁移策略 (Database Migration Strategy)

**版本**: RC-20260303-01  
**目标**: 确保数据迁移安全、可回滚

---

## 迁移策略概述

### 原则
1. **唯一真相**: `final_schema_v2.0.0.sql` 是当前唯一权威Schema
2. **增量更新**: 后续修改使用 Patch Migration
3. **可回滚**: 每个迁移都有对应的回滚脚本
4. **零停机**: 尽可能使用在线迁移策略

---

## 从空库迁移 (首次部署)

### 步骤

```bash
# 1. 创建数据库
mysql -u root -e "CREATE DATABASE partyonce CHARACTER SET utf8mb4;"

# 2. 执行完整Schema
mysql -u root partyonce < database/final_schema_v2.0.0.sql

# 3. 验证
mysql -u root partyonce -e "SHOW TABLES;"
```

### 预期输出
```
Tables_in_partyonce:
ai_plans
designs
entity_media_links
event_albums
event_tasks
events
media_assets
partner_contract_acceptances
partner_contracts
partners
quotes
quote_items
reward_rules
share_events
shares
supplier_scores
template_3d_configs
template_bom
templates
user_referrals
users
venue_bookings
venue_reviews
venues
wallet_ledger
wallets
```

---

## 从旧库迁移 (升级场景)

### 场景1: 字段变更

**新增字段**:
```sql
-- database/patches/patch_20260304_add_user_avatar.sql
ALTER TABLE users 
ADD COLUMN avatar_url VARCHAR(500) NULL AFTER email;

-- 回滚脚本: patch_20260304_add_user_avatar_rollback.sql
-- ALTER TABLE users DROP COLUMN avatar_url;
```

**修改字段**:
```sql
-- database/patches/patch_20260305_modify_phone_length.sql
ALTER TABLE users 
MODIFY COLUMN phone VARCHAR(20);
```

### 场景2: 新增表

```sql
-- database/patches/patch_20260306_create_notifications.sql
CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 场景3: 数据迁移

```sql
-- database/patches/patch_20260307_migrate_user_data.sql
-- 1. 新增临时字段
ALTER TABLE users ADD COLUMN temp_data JSON;

-- 2. 迁移数据
UPDATE users SET temp_data = JSON_OBJECT('old_field', old_column);

-- 3. 删除旧字段
ALTER TABLE users DROP COLUMN old_column;

-- 4. 重命名
ALTER TABLE users CHANGE temp_data new_data JSON;
```

---

## Patch Migration 管理

### 目录结构

```
database/
├── final_schema_v2.0.0.sql    # 基础Schema（不变）
├── patches/                    # 增量迁移
│   ├── patch_20260304_add_user_avatar.sql
│   ├── patch_20260304_add_user_avatar_rollback.sql
│   ├── patch_20260305_modify_phone_length.sql
│   └── ...
└── migrations.log              # 迁移记录
```

### 命名规范

```
patch_YYYYMMDD_brief_description.sql
patch_YYYYMMDD_brief_description_rollback.sql
```

### 迁移记录

每个Patch执行后记录:

```sql
CREATE TABLE IF NOT EXISTS schema_migrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patch_name VARCHAR(255) NOT NULL,
  applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  applied_by VARCHAR(100),
  checksum VARCHAR(64),
  duration_ms INT
);
```

---

## 回滚策略

### 自动回滚

```bash
#!/bin/bash
# rollback.sh

PATCH_NAME=$1
ROLLBACK_FILE="database/patches/${PATCH_NAME}_rollback.sql"

if [ -f "$ROLLBACK_FILE" ]; then
    mysql -u root partyonce < "$ROLLBACK_FILE"
    echo "回滚完成: $PATCH_NAME"
else
    echo "回滚脚本不存在: $ROLLBACK_FILE"
    exit 1
fi
```

### 手动回滚

**全库回滚**:
```bash
# 1. 备份当前数据
mysqldump -u root partyonce > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. 删除数据库
mysql -u root -e "DROP DATABASE partyonce;"

# 3. 重建
mysql -u root < database/final_schema_v2.0.0.sql
```

---

## 验证迁移

### 迁移后检查

```bash
#!/bin/bash
# verify_migration.sh

echo "验证数据库结构..."

# 1. 检查所有表
mysql -u root partyonce -e "SHOW TABLES;"

# 2. 检查关键表结构
mysql -u root partyonce -e "DESCRIBE users;"
mysql -u root partyonce -e "DESCRIBE partners;"

# 3. 检查初始数据
mysql -u root partyonce -e "SELECT COUNT(*) FROM templates;"
mysql -u root partyonce -e "SELECT COUNT(*) FROM reward_rules;"

echo "验证完成"
```

---

## 当前状态

| 项目 | 状态 |
|------|------|
| 基础Schema | ✅ final_schema_v2.0.0.sql |
| Patch目录 | ✅ 已创建 |
| 迁移记录表 | ✅ 已包含在Schema中 |
| 回滚脚本 | ✅ 每个Patch需配套 |

---

## 最佳实践

1. **生产环境**: 先备份，再迁移
2. **测试环境**: 验证Patch后再应用到生产
3. **文档**: 每个Patch需说明目的和影响
4. **自动化**: CI/CD中集成迁移检查

---

**迁移策略维护人**: AI Agent (老四/Moses)  
**最后更新**: 2026-03-03 12:55 AEDT
