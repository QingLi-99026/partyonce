# 回滚计划 (Roll Back Plan)

**版本**: RC-20260303-01  
**适用范围**: Staging → Production 回滚

---

## 回滚触发条件

### 严重问题 (立即回滚)
- 数据库数据丢失或损坏
- 核心功能完全不可用
- 安全漏洞
- 性能严重下降

### 一般问题 (可修复)
- 非核心功能异常
- UI显示问题
- 可以热修复的bug

---

## 回滚方案

### 方案A: 全量回滚 (最坏情况)

**适用场景**: 数据库损坏、核心功能完全失败

**步骤**:

```bash
#!/bin/bash
# full_rollback.sh

echo "🚨 执行全量回滚..."

# 1. 停止服务
echo "1. 停止后端服务..."
# Render: 手动停止或API调用

# 2. 备份当前数据（用于分析）
echo "2. 备份当前数据..."
mysqldump -u root partyonce > rollback_backup_$(date +%Y%m%d_%H%M%S).sql

# 3. 恢复上一个稳定版本的数据库
echo "3. 恢复上一个稳定版本..."
mysql -u root -e "DROP DATABASE partyonce;"
mysql -u root -e "CREATE DATABASE partyonce;"
mysql -u root partyonce < backup_stable_version.sql

# 4. 回滚代码版本
echo "4. 回滚代码..."
git checkout previous-stable-tag

# 5. 重启服务
echo "5. 重启服务..."
# Render: 重新部署

echo "✅ 全量回滚完成"
```

**预计时间**: 15-30分钟  
**数据丢失**: 回滚点之后的数据  
**影响**: 全站短暂不可用

---

### 方案B: 数据库回滚 (数据问题)

**适用场景**: 数据迁移错误、错误数据写入

**步骤**:

```bash
#!/bin/bash
# db_rollback.sh

# 1. 锁定表（只读）
mysql -u root partyonce -e "FLUSH TABLES WITH READ LOCK;"

# 2. 导出当前数据（备份）
mysqldump -u root partyonce > pre_rollback_backup.sql

# 3. 执行回滚SQL
mysql -u root partyonce < rollback_patch.sql

# 4. 解锁表
mysql -u root partyonce -e "UNLOCK TABLES;"

# 5. 验证
echo "验证回滚结果..."
mysql -u root partyonce -e "SELECT COUNT(*) FROM users;"
```

**预计时间**: 5-10分钟  
**数据丢失**: 回滚点之后的数据  
**影响**: 短暂只读

---

### 方案C: 配置回滚 (配置错误)

**适用场景**: 环境变量错误、配置项错误

**步骤**:

```bash
# 1. 恢复上一个版本的.env
mv .env .env.broken
cp .env.backup .env

# 2. 重启服务
systemctl restart partyonce  # 或 Docker/Render重启

# 3. 验证
curl https://staging.partyonce.au/api/health
```

**预计时间**: 2-5分钟  
**数据丢失**: 无  
**影响**: 服务重启时间

---

## 回滚检查清单

执行回滚前确认:

- [ ] 已通知相关团队
- [ ] 已备份当前数据
- [ ] 确定回滚范围（全量/部分）
- [ ] 回滚目标版本已验证
- [ ] 回滚后测试计划已准备

---

## 当前版本回滚信息

| 项目 | 详情 |
|------|------|
| **当前版本** | RC-20260303-01 |
| **上一版本** | N/A (首次发布) |
| **数据库备份** | 需手动创建 |
| **代码备份** | Git历史记录 |

**注意**: 这是首次发布，无上一版本可回滚。如需回滚，需：
1. 删除当前部署
2. 清理数据库
3. 重新部署旧版本（如有）

---

## 数据备份策略

### 自动备份 (推荐生产环境)

```bash
#!/bin/bash
# backup.sh (每日执行)

BACKUP_DIR="/backups/partyonce"
DATE=$(date +%Y%m%d_%H%M%S)

# MySQL备份
mysqldump -u root partyonce | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# 保留最近7天
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +7 -delete
```

### 手动备份 (部署前)

```bash
# 部署前备份
mysqldump -u root partyonce > pre_deploy_backup_$(date +%Y%m%d).sql
```

---

## 回滚后验证

回滚后必须验证:

1. **服务状态**: 
   ```bash
   curl https://staging.partyonce.au/api/health
   ```

2. **数据库连接**:
   ```bash
   mysql -u root partyonce -e "SELECT 1;"
   ```

3. **核心功能**:
   - 注册/登录
   - 供应商入驻
   - 模板浏览

4. **数据完整性**:
   ```sql
   SELECT COUNT(*) FROM users;
   SELECT COUNT(*) FROM partners;
   ```

---

## 联系与上报

**发现严重问题需回滚**:
1. 立即停止新部署
2. 通知团队成员
3. 按回滚计划执行
4. 记录问题和解决方案

---

**回滚计划维护人**: AI Agent (老四/Moses)  
**最后更新**: 2026-03-03 13:00 AEDT
