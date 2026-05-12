# PartyOnce Production Migration and Staging Runbook V1 2026-05-12

## 1. 本轮目标

本轮目标是固化 Production Migration and Staging Runbook V1：

1. 生产迁移怎么跑。
2. staging 怎么验。
3. 失败怎么 rollback。
4. 重新给出 Go / No-Go。

本轮不执行 production migration，不连接生产数据库，不部署，不 push，不触发 payment / webhook / n8n / notification。

## 2. 当前基线

- 仓库：`/Users/aiagentkevin/.openclaw/workspace/projects/PartyOnce`
- 当前硬化基线：`36e51e8b`
- 已完成前置硬化：
  - production env fail-closed
  - production CORS 白名单
  - production 禁用自动建表
  - frontend API base URL production fail-safe
  - Render blueprint 关闭 auto deploy

## 3. 迁移文件盘点

当前可作为 migration-managed schema 起点的文件：

- `backend/migrations/001_create_lead_storage.sql`
- `backend/migrations/002_create_quote_storage.sql`
- `backend/migrations/003_create_order_storage.sql`

辅助 / 历史文件：

- `backend/MYSQL_MIGRATION_GUIDE.md`
- `backend/init.sql`
- `backend/migration_deposit.sql`
- `backend/schema_sqlite.sql`
- `backend/seed_demo.sql`
- `backend/seed_suppliers.sql`

生产迁移建议只从 `backend/migrations/001-003` 建立正式顺序。其他 SQL 需要单独 review 后才能进入 production migration set。

## 4. 迁移边界

本 runbook 当前只覆盖：

- customer / lead / follow_up storage
- quote storage
- order skeleton storage
- owner / next_action / internal note 等运营字段

本 runbook 不覆盖：

- Stripe / PaymentIntent
- webhook
- n8n
- email / SMS / WhatsApp
- supplier full backend automation
- contract signing
- production data backfill

## 5. 生产迁移前置条件

进入 production migration 前必须全部满足：

1. 使用 clean release branch，排除 dirty `.env.production`、`frontend/vue-app/dist`、历史 untracked docs / evidence。
2. `DATABASE_URL` 指向 owner 批准的 production database。
3. `SECRET_KEY` 已配置，非默认值，长度至少 32 字符。
4. `CORS_ORIGINS` 已配置为正式 frontend origin 白名单。
5. production DB 已创建且可以备份。
6. migration operator 明确知道本轮只执行 `001 -> 002 -> 003`。
7. migration window 已获老板/GPT 批准。
8. 已确认本轮不会触发真实 payment / webhook / n8n / outbound messaging。

## 6. 生产迁移执行步骤

### Step 0：冻结和确认

```bash
git status --short
git rev-parse --short HEAD
```

要求：

- release branch clean。
- staged / unstaged 只包含 owner 批准的 release 内容。
- 不包含 `.env.production`。
- 不包含 `frontend/vue-app/dist`，除非单独采用静态托管发布流程且已批准。

### Step 1：备份生产数据库

MySQL / MariaDB 示例：

```bash
mysqldump "$DATABASE_URL" > partyonce_prod_backup_YYYYMMDD_HHMMSS.sql
```

如果 provider 不支持直接 URL dump，使用 provider 控制台创建 snapshot / backup。

备份要求：

- 备份文件或 snapshot ID 写入 release log。
- 未完成备份不得继续。
- 备份失败直接中止。

### Step 2：迁移 dry-run

在 staging 或临时库上先执行：

```bash
sqlite3 /tmp/partyonce_migration_dry_run.sqlite < backend/migrations/001_create_lead_storage.sql
sqlite3 /tmp/partyonce_migration_dry_run.sqlite < backend/migrations/002_create_quote_storage.sql
sqlite3 /tmp/partyonce_migration_dry_run.sqlite < backend/migrations/003_create_order_storage.sql
sqlite3 /tmp/partyonce_migration_dry_run.sqlite ".tables"
sqlite3 /tmp/partyonce_migration_dry_run.sqlite "PRAGMA foreign_key_check;"
```

要求：

- 表存在：`customers`、`leads`、`follow_ups`、`quotes`、`orders`。
- foreign key check 无输出。

### Step 3：production migration

只有 owner/GPT 明确批准后，才允许在 production DB 执行。

SQLite production 示例：

```bash
sqlite3 "$PARTYONCE_PROD_SQLITE_PATH" < backend/migrations/001_create_lead_storage.sql
sqlite3 "$PARTYONCE_PROD_SQLITE_PATH" < backend/migrations/002_create_quote_storage.sql
sqlite3 "$PARTYONCE_PROD_SQLITE_PATH" < backend/migrations/003_create_order_storage.sql
sqlite3 "$PARTYONCE_PROD_SQLITE_PATH" "PRAGMA foreign_key_check;"
```

MySQL production 要求：

- 先把 SQLite-specific 语句 `PRAGMA foreign_keys = ON;` 移除或由 MySQL-compatible migration tool 忽略。
- 检查 `DATETIME DEFAULT CURRENT_TIMESTAMP`、`DECIMAL`、`CHECK`、`FOREIGN KEY` 兼容性。
- 在 staging MySQL 上先跑同一份转换后 SQL。

MySQL 示例：

```bash
mysql "$PARTYONCE_PROD_DB_NAME" < backend/migrations/001_create_lead_storage.mysql.sql
mysql "$PARTYONCE_PROD_DB_NAME" < backend/migrations/002_create_quote_storage.mysql.sql
mysql "$PARTYONCE_PROD_DB_NAME" < backend/migrations/003_create_order_storage.mysql.sql
```

当前仓库尚未提供 `*.mysql.sql` 正式迁移文件，因此 MySQL production migration 仍是 No-Go，除非先补 MySQL-compatible migration set 并完成 staging 验证。

### Step 4：迁移后 schema verify

必须检查：

- required tables 存在。
- required indexes 存在。
- foreign keys 存在。
- quote / order status check 约束符合当前业务状态。
- 不存在 payment / webhook / n8n 新表。

SQLite 示例：

```bash
sqlite3 "$DB_PATH" ".schema customers"
sqlite3 "$DB_PATH" ".schema leads"
sqlite3 "$DB_PATH" ".schema quotes"
sqlite3 "$DB_PATH" ".schema orders"
sqlite3 "$DB_PATH" "PRAGMA foreign_key_check;"
```

## 7. Staging 验收步骤

### Stage 0：环境配置

Staging 必须显式配置：

- `ENVIRONMENT=production` 或 `ENVIRONMENT=staging`，但 staging 必须模拟 production guard。
- `DATABASE_URL`
- `SECRET_KEY`
- `CORS_ORIGINS`
- frontend `VITE_API_URL`

禁止：

- Cloudflare temporary tunnel 作为 production API。
- `.env.production` dirty 文件进入 release。
- 使用 production database 做 staging smoke。

### Stage 1：部署前静态检查

```bash
PYTHONPYCACHEPREFIX=/tmp/partyonce_staging_pycache python3 -m py_compile backend/main.py
npm run build -- --mode staging --outDir /tmp/partyonce_staging_build --emptyOutDir
git diff --check
```

要求：

- backend compile pass。
- frontend build pass。
- build 不写入 `frontend/vue-app/dist`。
- no diff whitespace error。

### Stage 2：后端 health smoke

检查：

```text
GET /api/health
GET /docs
```

要求：

- `/api/health` 返回 200。
- backend 日志不输出 secret。
- backend 日志不显示 wildcard CORS。

### Stage 3：业务主链路 smoke

必须按顺序验证：

1. Lead 创建。
2. Admin Lead 可读取。
3. Quote 创建。
4. Admin Quote list/detail 可读取 owner / next_action。
5. Quote ops fields 可保存。
6. Order 创建。
7. Admin Order list/detail 可读取 owner / next_action。
8. Order ops fields 可保存。

### Stage 4：客户侧 smoke

验证：

1. fixture customer identity 不进入 production。
2. My Inquiries 可访问。
3. My Quotes 可访问。
4. Quote Detail 可访问。
5. My Orders 可访问。
6. Order Detail 可访问。
7. 非本人或匿名访问被阻断或 fallback 明确。

### Stage 5：供应商轻量闭环 smoke

验证：

1. `/suppliers` 返回 200。
2. `/partner/apply` 返回 200。
3. `/partner/status` 返回 200。
4. `/admin/partners` 返回 200 或明确 auth guard。
5. 申请可创建。
6. 状态可读取。
7. 后台可更新状态 / review note。

### Stage 6：payment readiness smoke

只允许 test-mode readiness / disabled flow：

1. 不创建真实 PaymentIntent。
2. 不连接 live Stripe。
3. 页面明确显示 test-mode / not-live。
4. pending_deposit 仍只是业务状态，不是真实支付状态。

### Stage 7：notification dry-run smoke

只允许 dry-run：

1. payload 可生成。
2. template 可预览。
3. trigger condition 可说明。
4. 不发 email / SMS / WhatsApp。
5. 不触发真实 n8n webhook。

### Stage 8：浏览器验收

至少覆盖：

- `/`
- `/local-demo`
- `/admin/leads`
- `/admin/quotes`
- `/admin/orders`
- `/my/quotes`
- `/my/orders`
- `/suppliers`
- `/partner/apply`
- `/partner/status`
- notification dry-run 页面
- payment readiness 页面

要求：

- route 返回 200。
- console error = 0。
- 页面不暴露 production secret。

## 8. Rollback 方案

### Rollback A：部署失败，migration 未执行

动作：

1. 停止当前 deploy。
2. 保持上一版本服务。
3. 不触碰数据库。
4. 回到 release branch 修复。

影响：无数据迁移风险。

### Rollback B：migration 执行失败且未对外开放

动作：

1. 停止 deployment。
2. 使用 migration 前 backup / snapshot restore。
3. 验证 schema 回到迁移前。
4. 保持生产流量在旧版本。

影响：无用户新数据时可以完整回滚。

### Rollback C：migration 成功但 staging smoke 失败

动作：

1. 不切生产流量。
2. 保留 staging DB 现场。
3. 记录失败 API / route / log。
4. 修复后重新跑 staging smoke。

影响：不影响生产用户。

### Rollback D：已切生产流量后失败

当前不建议进入此阶段。若发生：

1. 立即冻结写入入口。
2. 切回上一稳定 app version。
3. 保留新 DB，不直接覆盖。
4. 对比 backup 与新写入数据。
5. 由 owner/GPT 决定数据修复或 restore。

## 9. Stop Conditions

出现以下任一条件必须停止：

1. `.env.production` 被纳入 staged files。
2. `frontend/vue-app/dist` 被纳入 staged files。
3. 生产 DB 无备份。
4. migration SQL 未经 staging dry-run。
5. MySQL compatibility 未确认却准备跑 MySQL production。
6. CORS_ORIGINS 包含 `*`。
7. frontend production API 指向 localhost / tunnel。
8. 任何真实 payment / webhook / n8n / outbound messaging 被触发。
9. console error 出现在关键 route。
10. owner/GPT 未批准 production migration window。

## 10. 本轮本地验证结果

已执行 SQLite migration dry-run：

```bash
rm -f /tmp/partyonce_migration_runbook_v1.sqlite
sqlite3 /tmp/partyonce_migration_runbook_v1.sqlite < backend/migrations/001_create_lead_storage.sql
sqlite3 /tmp/partyonce_migration_runbook_v1.sqlite < backend/migrations/002_create_quote_storage.sql
sqlite3 /tmp/partyonce_migration_runbook_v1.sqlite < backend/migrations/003_create_order_storage.sql
sqlite3 /tmp/partyonce_migration_runbook_v1.sqlite ".tables"
sqlite3 /tmp/partyonce_migration_runbook_v1.sqlite "PRAGMA foreign_key_check;"
```

结果：

- 表：`customers`、`follow_ups`、`leads`、`orders`、`quotes`
- `PRAGMA foreign_key_check` 无输出。

Backend compile：

```bash
PYTHONPYCACHEPREFIX=/tmp/partyonce_migration_runbook_pycache python3 -m py_compile backend/main.py
```

结果：通过。

## 11. 重新 Go / No-Go

当前结论：**No-Go**。

理由：

1. migration runbook 已完成，但 production migration 未执行，也未获 owner/GPT 批准。
2. MySQL-compatible migration set 尚未固化。
3. staging deploy 和 staging smoke 尚未真实跑完。
4. payment / webhook / n8n 仍是 readiness / dry-run，不是生产闭环。
5. `.env.production` 仍是历史 dirty / excluded。
6. release branch clean gate 尚未完成。

可以进入的下一步：

**Staging Smoke Execution V1**。只在 staging / local-safe profile 下执行 runbook，不切 production，不触发真实外部系统。

## 12. 本轮是否触发外部系统

否。

本轮未执行：

- production deploy
- staging deploy
- push
- production DB migration
- production DB connection
- Stripe / PaymentIntent
- webhook
- n8n
- email / SMS / WhatsApp

## 13. 是否读取/修改 `.env.production`

否。本轮只通过 `git status` 观察其 dirty 状态，不读取、不修改、不提交。

## 14. 是否提交 dist

否。
