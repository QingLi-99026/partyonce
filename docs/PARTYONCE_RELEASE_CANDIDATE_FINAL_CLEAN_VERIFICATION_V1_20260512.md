# PartyOnce Release Candidate Final Clean Verification V1 2026-05-12

## A. 当前 Branch / HEAD

- Branch：`eye-lite-v2-release-candidate-20260512`
- HEAD：`903be03a6baf2053ed236b6fcbe4677ec236e4fc`

最近 commits：

```text
903be03a Restore missing frontend source for release candidate
56c49df0 Prepare release candidate branch v1
b36e5892 Add release branch clean gate v1
fcbab59e Run staging smoke execution v1
bc61ba78 Add production migration and staging runbook
36e51e8b Add production hardening patch pack v1
390075af Chore: update evidence tracker and add misc scripts/tests
e1ec0094 Production hardening patch pack v1 (fail-closed, CORS allowlist, no auto-create)
```

## B. Build 结果

命令：

```bash
cd frontend/vue-app
npm run build -- --mode staging --outDir /tmp/partyonce_rc_final_build_check --emptyOutDir
```

结果：通过。

输出目录：`/tmp/partyonce_rc_final_build_check`

未写入：`frontend/vue-app/dist`

备注：仍有 P1 bundle warning，主 bundle 和 `Designer3D` chunk 超过 500 kB。

## C. Route Smoke 结果

使用 Playwright headless 访问 `http://127.0.0.1:3015`。

| Route | Status | Console Errors | Page Errors | 结论 |
| --- | --- | ---: | ---: | --- |
| `/` | 200 | 0 | 0 | 通过 |
| `/local-demo` | 200 | 0 | 0 | 通过 |
| `/quote` | 200 | 0 | 0 | 通过 |
| `/my/quotes` | 200 | 0 | 0 | 通过 |
| `/my/orders` | 200 | 0 | 0 | 通过 |
| `/admin/quotes` | 200 | 0 | 0 | 通过，未登录态为 auth/入口态 |
| `/admin/orders` | 200 | 0 | 0 | 通过，未登录态为 auth/入口态 |
| `/suppliers` | 200 | 0 | 0 | 通过 |
| `/partner/apply` | 200 | 0 | 0 | 通过 |
| `/partner/status` | 200 | 0 | 0 | 通过 |
| `/admin/notifications/dry-run` | 200 | 0 | 0 | 通过，未登录态为 auth/入口态 |
| `/payment/deposit` | 200 | 0 | 0 | 通过，test-mode readiness 页面 |

## D. API Smoke 结果

Backend local-safe：

- Host：`127.0.0.1:8015`
- `ENVIRONMENT=staging`
- `DATABASE_URL=sqlite:////tmp/partyonce_rc_final_api.sqlite`
- `PARTYONCE_LEAD_STORAGE_MODE=sqlite_local`
- `PARTYONCE_LEAD_SQLITE_PATH=/tmp/partyonce_rc_final_leads.sqlite`

Health：

```text
GET /api/health -> 200
```

Lead → Quote → Order skeleton：

```json
{
  "lead_id": "1",
  "quote_id": "1",
  "order_id": "1",
  "quote_list_total": "1",
  "order_list_total": "1",
  "my_quotes_total": "1",
  "my_orders_total": "1"
}
```

覆盖：

- Lead 创建 / qualified 更新
- Quote 创建 / accepted 更新
- Order 创建 / pending_deposit 更新
- Admin quote list owner / next_action 查询
- Admin order list owner / next_action 查询
- Customer my quotes / my orders read-only 查询

未触发 payment、Stripe、webhook、n8n 或外发消息。

## E. 是否存在 Release Blocker

是。

虽然 build、route smoke、API smoke 均通过，但 release candidate branch 的 tracked files 仍包含发布禁入文件。

检查命令：

```bash
git ls-files 'frontend/vue-app/.env.production' 'frontend/vue-app/dist/**' 'frontend/vue-app/node_modules/**' 'test_evidence/**' 'EvidencePack/**' '**/.DS_Store' 'backend/__pycache__/**'
git ls-files | grep -E '(^|/)\\.DS_Store$|^frontend/vue-app/dist/|^frontend/vue-app/node_modules/|^test_evidence/|^EvidencePack/|^backend/__pycache__/' | wc -l
```

结果：`20466` 个 tracked forbidden/generated/evidence 文件。

其中包括：

- `frontend/vue-app/.env.production`
- `frontend/vue-app/dist/**`
- `frontend/vue-app/node_modules/**`
- `EvidencePack/**`
- `.DS_Store`
- `backend/__pycache__/**`

结论：当前 branch 功能可构建、可本地验收，但还不能作为干净 release candidate 推到 remote staging。

## F. 是否读取/修改 `.env.production`

否。

本轮只用 `git ls-files` 检查路径是否被 tracked，没有读取 `.env.production` 内容，没有修改 `.env.production`。

## G. 是否提交 dist

否。

本轮没有新增或提交 `frontend/vue-app/dist`。但历史 tracked `dist` 已存在于 branch，是 release blocker。

## H. 是否 Push / Deploy

否。

本轮未 push，未 deploy。

## I. 是否触发外部系统

否。

未触发：

- production DB
- production migration
- Stripe / PaymentIntent
- webhook
- n8n
- email / SMS / WhatsApp

## J. 是否可以进入 Remote Staging Deploy Preparation

不建议进入真正 remote staging deploy preparation。

可以进入的下一步是 **Tracked Generated Files Cleanup Gate V1**。

原因：当前 branch 中历史 tracked `env/dist/node_modules/EvidencePack/.DS_Store/__pycache__` 文件仍未移出 Git 索引。必须先通过白名单 cleanup commit 把这些文件从 Git tracking 中移除，并保持本地文件不删除。

## K. Production 是否仍 No-Go

是。

原因：

1. tracked forbidden/generated/evidence 文件仍在 branch。
2. production migration 未执行。
3. MySQL-compatible migration set 未固化。
4. payment / webhook / n8n 仍非真实闭环。
5. production auth / monitoring / backup / rate limit gate 未完成。

## L. 下一步建议

下一步建议：**Tracked Generated Files Cleanup Gate V1**。

建议只做 Git index 清理，不删除本地文件：

```bash
git rm --cached -r frontend/vue-app/dist frontend/vue-app/node_modules EvidencePack test_evidence backend/__pycache__
git rm --cached frontend/vue-app/.env.production
git rm --cached .DS_Store backend/.DS_Store frontend/.DS_Store frontend/vue-app/.DS_Store
```

执行前必须再次确认 owner/GPT 批准。清理后重跑：

- `git ls-files` 禁入路径检查
- frontend build 到 `/tmp`
- route smoke
- API smoke

只有这些全部通过，才建议进入 remote staging deploy preparation。
