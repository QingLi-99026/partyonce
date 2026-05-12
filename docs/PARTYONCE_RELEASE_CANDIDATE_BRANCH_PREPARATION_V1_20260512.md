# PartyOnce Release Candidate Branch Preparation V1 2026-05-12

## 1. 本轮目标

准备干净 release candidate branch，并在不部署、不 push、不触发生产系统的前提下重跑 local-safe smoke。

本轮禁止事项均已遵守：

- 未部署
- 未 push
- 未读取/修改 `.env.production`
- 未提交 `dist`
- 未连接 production DB
- 未执行 production migration
- 未触发 Stripe / payment / webhook / n8n / email / SMS / WhatsApp

## 2. 起始 HEAD

执行前 HEAD：

```text
b36e589235eb7cd1963faa93c654c01122f5fcf0
```

对应短 hash：

```text
b36e5892
```

## 3. Dirty Quarantine 方法

执行前先备份 dirty 状态清单：

```text
/tmp/partyonce_pre_release_candidate_dirty_status_20260512.txt
```

清单行数：

```text
249
```

使用安全 stash：

```bash
git stash push -u -m "pre-release-candidate-dirty-quarantine-20260512"
```

执行结果：

```text
Saved working directory and index state On main: pre-release-candidate-dirty-quarantine-20260512
```

## 4. Stash ID / Message

Stash ref：

```text
stash@{0}
```

Stash hash：

```text
e79d984ce10dde3ba86921be6e217d0193d60d90
```

Stash message：

```text
pre-release-candidate-dirty-quarantine-20260512
```

该 stash 包含历史 dirty / untracked 文件，包括 `.env.production`、未确认前端页面、历史 docs/evidence/scripts 等。本轮没有读取 `.env.production` 内容。

## 5. Release Candidate Branch

创建 branch：

```bash
git switch -c eye-lite-v2-release-candidate-20260512
```

结果：

```text
Switched to a new branch 'eye-lite-v2-release-candidate-20260512'
```

当前 branch：

```text
eye-lite-v2-release-candidate-20260512
```

Branch HEAD：

```text
b36e5892
```

创建后工作树状态：clean。

## 6. Local-safe Smoke 结果

### Backend compile

```bash
PYTHONPYCACHEPREFIX=/tmp/partyonce_rc_smoke_pycache python3 -m py_compile backend/main.py
```

结果：通过。

### SQLite migration dry-run

```bash
rm -f /tmp/partyonce_rc_smoke.sqlite
sqlite3 /tmp/partyonce_rc_smoke.sqlite < backend/migrations/001_create_lead_storage.sql
sqlite3 /tmp/partyonce_rc_smoke.sqlite < backend/migrations/002_create_quote_storage.sql
sqlite3 /tmp/partyonce_rc_smoke.sqlite < backend/migrations/003_create_order_storage.sql
sqlite3 /tmp/partyonce_rc_smoke.sqlite ".tables"
sqlite3 /tmp/partyonce_rc_smoke.sqlite "PRAGMA foreign_key_check;"
```

结果：

```text
customers   follow_ups  leads       orders      quotes
```

`PRAGMA foreign_key_check` 无输出。

### Backend health

Backend local-safe env：

- `ENVIRONMENT=staging`
- `DATABASE_URL=sqlite:////tmp/partyonce_rc_api.sqlite`
- `PARTYONCE_LEAD_STORAGE_MODE=sqlite_local`
- `PARTYONCE_LEAD_SQLITE_PATH=/tmp/partyonce_rc_leads.sqlite`
- `CORS_ORIGINS=http://127.0.0.1:3000,http://localhost:3000`

结果：

```text
GET /api/health -> 200
HEAD /docs -> 200
```

### Lead → Quote → Order smoke

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

结论：通过。

覆盖：

- Lead 创建 / 更新 qualified
- Quote 创建 / accepted
- Order 创建 / pending_deposit
- Admin Quote owner / next_action 筛选
- Admin Order owner / next_action 筛选
- Customer My Quotes / My Orders read-only fixture
- 匿名 quote detail 阻断

### Supplier smoke

执行结果：

```json
{
  "partner_id": "1",
  "partner_me_status": "pending",
  "admin_pending_count": "1",
  "approved_status": "approved"
}
```

结论：通过。

覆盖：

- supplier apply
- partner status read
- admin pending list
- admin approve

### Frontend build / route smoke

结果：未通过。

命令：

```bash
npm run build -- --mode staging --outDir /tmp/partyonce_rc_smoke_build --emptyOutDir
```

失败原因：

```text
Could not load frontend/vue-app/src/views/HomePage.vue
ENOENT: no such file or directory
```

Vite dev server dependency scan 同时报告：

```text
ENOENT: no such file or directory, open 'frontend/vue-app/src/views/HomePage.vue'
ENOENT: no such file or directory, open 'frontend/vue-app/src/views/InquiryList.vue'
```

判断：

干净 release candidate branch 暴露出一个关键问题：`src/router/index.js` 引用了尚未进入 clean HEAD 的前端路由组件。上一轮 local-safe smoke 能通过，是因为这些组件以 untracked / dirty 文件形式存在于工作区；本轮 quarantine 后，这些文件被放入 stash，因此 clean branch 缺失依赖。

stash 中确认存在相关路径：

```text
frontend/vue-app/src/views/HomePage.vue
frontend/vue-app/src/views/InquiryList.vue
frontend/vue-app/src/views/ChildAIGuide.vue
frontend/vue-app/src/views/ChildLanding.vue
frontend/vue-app/src/views/ChildQuoteLab.vue
frontend/vue-app/src/views/ChildThemeHome.vue
frontend/vue-app/src/views/ChildThemeSelect.vue
frontend/vue-app/src/views/ChildVenueCompare.vue
frontend/vue-app/src/components/AIDashboard.vue
frontend/vue-app/src/components/AIResult.vue
frontend/vue-app/src/components/ImmersiveHero.vue
frontend/vue-app/src/components/LandingHero.vue
frontend/vue-app/src/components/PackageShowcase.vue
frontend/vue-app/src/components/SceneShowcase.vue
frontend/vue-app/src/components/StepInput.vue
frontend/vue-app/src/components/ThemeSwitcher.vue
```

## 7. 是否读取/修改 `.env.production`

否。

本轮未读取 `.env.production` 内容，未修改 `.env.production`，未提交 `.env.production`。

## 8. 是否提交 dist

否。

本轮未提交 `frontend/vue-app/dist`。

## 9. 是否 Push / Deploy

否。

本轮未 push，未 deploy，未连接 remote staging，未连接 production。

## 10. 是否仍为 Production No-Go

是。

当前不仅 production 仍为 No-Go，remote staging deploy approval 也暂时不能进入。

原因：

1. Clean branch frontend build 失败。
2. router 依赖的部分前端页面仍在 quarantine stash 中，未进入 clean HEAD。
3. 需要 owner 决策哪些 stashed frontend source 应纳入 release candidate。
4. production migration 未执行。
5. MySQL-compatible migration set 未固化。
6. payment / webhook / n8n 仍非真实闭环。

## 11. 下一步建议

下一步最优建议：进入 **Release Candidate Missing Frontend Source Review V1**。

目标：

1. 只从 `stash@{0}` 中审计 router 所需的缺失 source 文件路径。
2. 不恢复 `.env.production`。
3. 不恢复 `dist`、`node_modules`、test evidence。
4. 由 owner 决策是否将缺失前端 source 文件白名单恢复并提交到 release candidate branch。
5. 恢复后重新跑 frontend build 和 browser route smoke。

在 clean branch frontend build 通过前，不建议进入 remote staging deploy approval。

## 12. 本轮 Commit 规则

本报告如提交，只允许白名单提交：

```bash
git add docs/PARTYONCE_RELEASE_CANDIDATE_BRANCH_PREPARATION_V1_20260512.md
git commit -m "Prepare release candidate branch v1"
```
