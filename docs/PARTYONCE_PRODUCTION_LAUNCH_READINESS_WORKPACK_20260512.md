# PartyOnce Production Launch Readiness Workpack 2026-05-12

## 1. 本轮目标

本轮进入第 6 块：生产上线准备。目标是建立生产上线前的 readiness gate，确认当前仓库是否可以进入 staging / production 发布流程，并列出必须先处理的阻断项。

本轮只做生产上线准备审计与门禁报告，不执行生产部署，不 push，不触发外部系统，不处理 payment / webhook / n8n 真实链路。

## 2. 当前基线

- 仓库：`/Users/aiagentkevin/.openclaw/workspace/projects/PartyOnce`
- 当前代码基线：`771a4163`
- 近期已完成工作：
  - `92557a75` Harden admin operations experience
  - `49414402` Persist quote and order ops fields
  - `761a750a` Show persisted ops fields in admin queues
  - `eccbe0c5` Add admin bulk ops UX
  - `4d748594` Enhance customer next-step interactions
  - `0feec45d` Complete supplier light closed loop
  - `433c542d` Prepare Stripe test-mode readiness
  - `771a4163` Add notification dry-run payload lab

## 3. 本轮修改文件

- 新增：`docs/PARTYONCE_PRODUCTION_LAUNCH_READINESS_WORKPACK_20260512.md`

本轮未修改业务代码、部署配置、`.env.production`、`frontend/vue-app/dist`。

## 4. 检查过的关键文件

- `backend/main.py`
- `backend/requirements.txt`
- `backend/Dockerfile`
- `frontend/vue-app/Dockerfile`
- `frontend/vue-app/nginx.conf`
- `frontend/vue-app/package.json`
- `frontend/vue-app/.env.production`
- `render.yaml`
- `deploy.sh`
- `DEPLOY_PARAMETERS.md`
- `CHECKLIST.md`
- `docs/PARTYONCE_FINAL_DELIVERY_CANDIDATE_REPORT_20260510.md`

## 5. 当前上线结论

当前结论：**No-Go，不能直接生产上线。**

2026-05-12 Production Hardening Patch Pack V1 已处理部分可安全修复项。

2026-05-12 Production Migration and Staging Runbook V1 已固化生产迁移、staging 验收和 rollback 规则；本地 SQLite migration dry-run 通过。

2026-05-12 Staging Smoke Execution V1 已在 local-safe profile 下通过：backend health、SQLite migration dry-run、Lead → Quote → Order、customer read-only、supplier light loop、关键浏览器 routes 均通过；notification dry-run 仍需登录态复验。当前仍不是 remote staging deploy，也不是 production deploy。

原因不是功能完全不可用，而是生产发布门禁仍有 P0 阻断：生产环境变量、部署配置、CORS、数据库迁移、真实 payment / webhook / notification 链路和 release 工作区清洁度均未达到生产发布标准。

## 6. P0 阻断项

1. `.env.production` 当前处于 dirty 状态。该文件不能作为生产配置提交或发布依据。
2. `render.yaml` 已在 Hardening V1 中改为 `rootDir: backend`、关闭 `autoDeploy`、手动配置关键 env；仍需 owner review 和 staging deploy runbook 验证。
3. `backend/main.py` 已在 Hardening V1 中要求生产 CORS 使用 `CORS_ORIGINS` 明确白名单，禁止 wildcard。
4. `backend/main.py` 已在 Hardening V1 中对生产 `DATABASE_URL`、`SECRET_KEY`、`CORS_ORIGINS` 做 fail-closed guard。
5. `backend/main.py` 已在 Hardening V1 中对生产自动 `Base.metadata.create_all` 做 guard；`PARTYONCE_PRODUCTION_MIGRATION_STAGING_RUNBOOK_V1_20260512.md` 已固化 migration-managed schema 流程，但 production migration 尚未执行。
7. Payment 目前是 Stripe test-mode readiness / 占位状态，尚未完成真实 PaymentIntent、webhook、订单付款状态闭环。
8. Notification / webhook / n8n 当前是 dry-run payload lab，尚未进入真实外发或真实 n8n 触发链路。
9. Supplier light closed loop 仍有 local/staging fixture 属性，不能等同完整生产供应商后台。
10. 当前工作区存在 unrelated dirty / untracked 发布产物，包括 `frontend/vue-app/dist/*` 和 `.env.production`，必须在 release branch / deployment 前隔离处理。

## 7. P1 风险项

1. 前端临时 build 通过，但存在大 chunk warning：主 bundle 超过 1MB，后续需要 code splitting / lazy loading。
2. `deploy.sh` 仍包含旧式手动部署和 R2 变量前置检查，不应作为当前生产发布主脚本直接使用。
3. Render free plan、数据库类型、region、静态前端托管方式和后端 runtime 需要重新确认。
4. 日志、监控、错误告警、备份恢复、访问审计、rate limiting 尚未形成生产门禁清单。
5. Admin / customer / supplier auth guard 仍需要生产级权限模型复核。

## 8. 生产环境变量门禁

Backend production 必须明确配置：

- `DATABASE_URL`
- `SECRET_KEY`
- `ENVIRONMENT=production`
- `CORS_ORIGINS`
- `PYTHON_VERSION`

按功能开启前再配置：

- `OPENAI_API_KEY`
- R2 / object storage 相关变量
- Stripe test/live keys
- webhook signing secret
- notification / n8n endpoint

Frontend production 必须明确配置：

- `VITE_API_URL` 指向正式 backend API
- Stripe publishable key 只能在 payment 被批准后配置

Frontend production 禁止：

- Cloudflare tunnel URL
- secret key
- backend private token
- staging-only fixture identity

## 9. 已执行验证

Backend syntax check：

```bash
PYTHONPYCACHEPREFIX=/tmp/partyonce_prod_pycache python3 -m py_compile backend/main.py
```

结果：通过。

Frontend temporary production build：

```bash
npm run build -- --outDir /tmp/partyonce_production_readiness_build --emptyOutDir
```

结果：通过。输出目录在 `/tmp/partyonce_production_readiness_build`，未写入仓库 `frontend/vue-app/dist`。

Build warning：存在大 chunk 警告，需要后续性能优化，但不是本轮唯一阻断。

## 10. 未执行事项

本轮未执行：

- production deploy
- staging deploy
- push
- payment / Stripe live action
- PaymentIntent
- webhook
- n8n trigger
- email / SMS / WhatsApp 外发
- production migration
- 真实生产数据库连接
- `.env.production` 修改
- `frontend/vue-app/dist` 提交

## 11. 推荐上线准备顺序

1. 建立 clean release branch，只包含已确认 commit，排除当前 dirty `.env.production` 与 `dist`。
2. 先做 production hardening patch pack：
   - 后端关键 env fail closed。
   - CORS 改为 env 白名单。
   - 生产环境禁用自动 `create_all`。
   - 部署配置改为明确 backend root / frontend static host。
3. 修正 Render / hosting blueprint，关闭当前阶段的 auto deploy。
4. 建立 staging-only release smoke：
   - `/api/health`
   - admin lead / quote / order
   - customer quote / order read-only
   - supplier light loop
   - payment readiness page without real payment
   - notification dry-run without external send
5. 由老板/GPT 明确通过 staging gate 后，再进入 production deploy runbook。

## 12. 下一步建议

下一步最优起点：做 **Production Hardening Patch Pack V1**，优先处理 backend fail-closed env、CORS 白名单、生产禁用自动建表、Render blueprint 修正和 staging smoke runbook。

在这些 P0 项完成前，不建议进入真实生产部署。

## 13. Blocker

当前 blocker：生产上线门禁未通过。`render.yaml`、CORS、production env fail-closed、生产自动建表 guard、migration/staging/rollback runbook 和 local-safe staging smoke 已有第一版；剩余阻断集中在 `.env.production` dirty、release branch clean gate、remote staging deploy 未执行、production migration 未执行、payment / webhook / n8n 仍非真实闭环。

## 14. Commit

本报告生成时的代码基线为 `771a4163`。本报告提交后 commit hash 以 git 记录为准。
