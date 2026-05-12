# PartyOnce Staging Smoke Execution V1 2026-05-12

## 1. 本轮目标

执行 Staging Smoke Execution V1，以 local-safe profile 跑 staging 验收演练。

本轮不部署、不 push、不连接生产数据库、不执行 production migration、不触发 Stripe / webhook / n8n / email / SMS / WhatsApp。

## 2. 执行环境

- 仓库：`/Users/aiagentkevin/.openclaw/workspace/projects/PartyOnce`
- 基线：`bc61ba78`
- Backend local-safe host：`127.0.0.1:8012`
- Frontend local-safe host：`127.0.0.1:3012`
- Backend env：
  - `ENVIRONMENT=staging`
  - `DATABASE_URL=sqlite:////tmp/partyonce_staging_api.sqlite`
  - `PARTYONCE_LEAD_STORAGE_MODE=sqlite_local`
  - `PARTYONCE_LEAD_SQLITE_PATH=/tmp/partyonce_staging_leads.sqlite`
  - `CORS_ORIGINS=http://127.0.0.1:3000,http://localhost:3000`
- Frontend dev proxy：
  - `VITE_DEV_API_PROXY_TARGET=http://127.0.0.1:8012`

本轮没有读取或修改 `.env.production`。

## 3. Static Checks

Backend compile：

```bash
PYTHONPYCACHEPREFIX=/tmp/partyonce_staging_smoke_pycache python3 -m py_compile backend/main.py
```

结果：通过。

SQLite migration dry-run：

```bash
rm -f /tmp/partyonce_staging_smoke.sqlite
sqlite3 /tmp/partyonce_staging_smoke.sqlite < backend/migrations/001_create_lead_storage.sql
sqlite3 /tmp/partyonce_staging_smoke.sqlite < backend/migrations/002_create_quote_storage.sql
sqlite3 /tmp/partyonce_staging_smoke.sqlite < backend/migrations/003_create_order_storage.sql
sqlite3 /tmp/partyonce_staging_smoke.sqlite ".tables"
sqlite3 /tmp/partyonce_staging_smoke.sqlite "PRAGMA foreign_key_check;"
```

结果：

- tables：`customers`、`follow_ups`、`leads`、`orders`、`quotes`
- foreign key check：无输出

Frontend staging build：

```bash
npm run build -- --mode staging --outDir /tmp/partyonce_staging_smoke_build --emptyOutDir
```

结果：通过。输出写入 `/tmp/partyonce_staging_smoke_build`，未写入仓库 `frontend/vue-app/dist`。

仍有 P1 warning：主 bundle 超过 500 kB。

## 4. Backend Health Smoke

```text
GET /api/health -> 200
HEAD /docs -> 200
```

结果：通过。

日志检查：

- 没有输出 secret。
- CORS origins configured 为 2。
- 未显示 wildcard CORS。

## 5. Lead / Quote / Order Smoke

执行结果：

```json
{
  "lead_id": "1",
  "quote_id": "1",
  "order_id": "1",
  "quote_list_total": "1",
  "order_list_total": "1",
  "my_quotes_total": "1",
  "my_orders_total": "1",
  "anonymous_quote_detail_status": "401"
}
```

覆盖：

- admin user fixture 创建 / 登录：通过。
- Lead 创建：通过。
- Lead 更新为 qualified：通过。
- Quote 创建：通过。
- Quote 更新为 accepted：通过。
- Order 创建：通过。
- Order 更新为 pending_deposit：通过。
- Admin Quote list owner / next_action 筛选：通过。
- Admin Order list owner / next_action 筛选：通过。
- Customer My Quotes read-only fixture：通过。
- Customer My Orders read-only fixture：通过。
- 匿名 Quote Detail 被阻断：通过，返回 401。

注意：`pending_deposit` 仍只是业务状态，不是真实 Stripe payment 状态。

## 6. Supplier Light Loop Smoke

执行结果：

```json
{
  "partner_id": "1",
  "partner_me_status": "pending",
  "admin_pending_count": "1",
  "approved_status": "approved"
}
```

覆盖：

- supplier user fixture 创建 / 登录：通过。
- supplier apply：通过。
- partner status read：通过。
- admin pending list：通过。
- admin approve：通过。

本轮未触发自动审核、合同签署或外发通知。

## 7. Browser Route Smoke

使用 Playwright headless 检查 route status 与 console/page error。

| Route | Status | Console Errors | Page Errors | 结论 |
| --- | --- | ---: | ---: | --- |
| `/` | 200 | 0 | 0 | 通过 |
| `/local-demo` | 200 | 0 | 0 | 通过 |
| `/admin/leads` | 200 | 0 | 0 | 通过，未登录态为 auth/入口态 |
| `/admin/quotes` | 200 | 0 | 0 | 通过，未登录态为 auth/入口态 |
| `/admin/orders` | 200 | 0 | 0 | 通过，未登录态为 auth/入口态 |
| `/my/quotes` | 200 | 0 | 0 | 通过 |
| `/my/orders` | 200 | 0 | 0 | 通过 |
| `/suppliers` | 200 | 0 | 0 | 通过 |
| `/partner/apply` | 200 | 0 | 0 | 通过 |
| `/partner/status` | 200 | 0 | 0 | 通过 |
| `/admin/notifications/dry-run` | 200 | 0 | 0 | 需登录态复验，未登录态落到 auth/首页态 |
| `/payment/deposit` | 200 | 0 | 0 | 通过，test-mode readiness 页面 |

## 8. Payment Readiness Smoke

本轮仅访问 `/payment/deposit` 页面。

结果：

- route 200。
- console error 0。
- 未创建 PaymentIntent。
- 未连接 Stripe live。
- 未触发 webhook。

## 9. Notification Dry-run Smoke

本轮访问 `/admin/notifications/dry-run`。

结果：

- route 200。
- console error 0。
- 未登录浏览器态没有直接展示 dry-run 文案，落到 auth/首页态。
- 未触发真实 n8n。
- 未发送 email / SMS / WhatsApp。

结论：route 层通过；完整 notification dry-run UI 仍需要登录态浏览器复验。

## 10. 是否读取/修改 `.env.production`

否。本轮只用 `git status` 观察其仍为历史 dirty。

## 11. 是否提交 dist

否。build 输出到 `/tmp/partyonce_staging_smoke_build`。

## 12. 是否触发外部系统

否。

未触发：

- production deploy
- staging deploy
- push
- production DB connection
- production migration
- Stripe / PaymentIntent
- webhook
- n8n
- email / SMS / WhatsApp

## 13. Blockers / Gaps

1. 当前只是 local-safe staging smoke，不是真实 remote staging deploy。
2. `.env.production` 和 `frontend/vue-app/package.json` 仍为历史 dirty，未纳入本轮。
3. MySQL-compatible migration set 尚未固化。
4. Notification dry-run 页面需要登录态浏览器复验。
5. Production auth / permission / monitoring / backup / rate limit gate 仍未完成。
6. Payment 仍是 readiness，不是真实 payment closed loop。
7. Frontend bundle 仍有大 chunk warning。

## 14. Go / No-Go

当前结论：**Staging/local-safe smoke 通过，但 Production 仍为 No-Go。**

可以进入下一步：

**Release Branch Clean Gate V1**，目标是隔离 dirty `.env.production`、`frontend/vue-app/package.json`、`dist` 和历史 untracked 文件，准备 remote staging deploy 前的干净候选。

不能进入：

- production deploy
- production migration
- payment live
- webhook / n8n live
- outbound notification live

## 15. Commit

本报告提交后 commit hash 以 git 记录为准。
