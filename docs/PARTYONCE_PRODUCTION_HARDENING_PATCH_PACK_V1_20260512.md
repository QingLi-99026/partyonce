# PartyOnce Production Hardening Patch Pack V1 2026-05-12

## 1. 本轮目标

本轮目标是处理 production readiness No-Go blocker 中可以安全修复的前置硬化项，把当前 local/staging final delivery candidate 推进到 production-ready 前置状态。

本轮不是上线，不是部署，不接真实 payment，不触发 webhook / n8n / notification，不连接生产数据库。

## 2. No-Go Blocker 盘点

来自 `PARTYONCE_PRODUCTION_LAUNCH_READINESS_WORKPACK_20260512.md` 的主要 No-Go blocker：

1. `.env.production` dirty，不能作为生产发布依据。
2. `render.yaml` root / start command / auto deploy 风险。
3. production env fail-open 风险。
4. production CORS wildcard 风险。
5. production 自动建表风险。
6. frontend API base URL 可能 fallback 到 localhost / tunnel。
7. payment 仍是 readiness / test-mode，未进入真实支付闭环。
8. notification / webhook / n8n 仍是 dry-run。
9. supplier light loop 仍有 fixture 属性。
10. release 工作区仍需 clean branch / dirty files 隔离。

## 3. 已修复项目

### production env fail-closed

`backend/main.py` 已要求生产模式下必须显式提供：

- `DATABASE_URL`
- `SECRET_KEY`
- `CORS_ORIGINS`

生产模式下如果关键 env 缺失，会在 startup 前抛出 `RuntimeError`。生产模式下 `SECRET_KEY` 不允许使用默认值，且长度必须至少 32 字符。

### production dotenv guard

`backend/main.py` 已调整为：当启动环境为 `production` 时，不调用 `load_dotenv()`。本轮没有读取或依赖 `.env.production`。

### CORS 白名单

`backend/main.py` 已改为从 `CORS_ORIGINS` 读取白名单。local/staging 保留 localhost 默认列表；production 必须显式配置，且禁止 `*`。

### 自动建表 guard

`backend/main.py` 的 startup `Base.metadata.create_all(bind=engine)` 现在只允许 local/staging 执行。production 模式会跳过自动建表，并要求使用受控 migration。

### frontend API base URL fail-safe

`frontend/vue-app/src/api/index.js` 已加 production guard：

- production 缺少 `VITE_API_URL` 时直接抛错。
- production 禁止使用 `localhost`、`127.0.0.1`、`trycloudflare.com` 作为 API URL。
- local/staging 仍可使用 `/api` proxy 或非生产 fallback。

### Render blueprint 前置硬化

`render.yaml` 已最小修正：

- 增加 `rootDir: backend`。
- 关闭 `autoDeploy`。
- 将 `DATABASE_URL`、`SECRET_KEY`、`CORS_ORIGINS` 改为手动配置。
- 设置 `ENVIRONMENT=production`。
- 移除当前不匹配的自动 database block。

该文件仍需要 owner review 和 staging runbook 验证，本轮未部署。

## 4. 仍未修复项目

1. `.env.production` 仍是历史 dirty / excluded，本轮未读取、未修改、未提交。
2. `frontend/vue-app/package.json` 仍有历史 dirty，本轮未纳入提交。
3. `frontend/vue-app/dist` 仍不应提交，本轮未提交。
4. payment 仍未进入真实 PaymentIntent / webhook / order payment closed loop。
5. notification / webhook / n8n 仍是 dry-run，不是真实外发链路。
6. supplier light loop 仍不是完整生产供应商后台。
7. 生产数据库 migration runbook 尚未完成。
8. 生产 auth / admin permission / rate limit / monitoring / backup gate 仍需后续硬化。

## 5. 修改/新增文件

- `backend/main.py`
- `frontend/vue-app/src/api/index.js`
- `render.yaml`
- `docs/PARTYONCE_PRODUCTION_LAUNCH_READINESS_WORKPACK_20260512.md`
- `docs/PARTYONCE_PRODUCTION_HARDENING_PATCH_PACK_V1_20260512.md`

未修改：

- `frontend/vue-app/.env.production`
- `frontend/vue-app/dist`
- payment / webhook / n8n 真实链路

## 6. production env fail-closed 状态

状态：已完成第一版。

生产模式下缺少 `DATABASE_URL`、`SECRET_KEY`、`CORS_ORIGINS` 会阻断启动。local/staging 仍保留历史默认值，便于本地验收。

## 7. CORS 白名单状态

状态：已完成第一版。

production 必须通过 `CORS_ORIGINS` 配置明确 origin 列表，不允许 wildcard。local/staging 保留 localhost origin。

## 8. 自动建表风险状态

状态：已完成第一版 guard。

production 不再自动执行 `Base.metadata.create_all(bind=engine)`。仍需下一轮补 migration-managed schema runbook。

## 9. frontend API base URL 风险状态

状态：已完成第一版。

production 缺少 `VITE_API_URL` 或使用 localhost / tunnel API URL 会直接报错，避免静默连到错误 API。

## 10. 测试结果

Backend compile：

```bash
PYTHONPYCACHEPREFIX=/tmp/partyonce_prod_hardening_pycache python3 -m py_compile backend/main.py
```

结果：通过。

Backend production import smoke：

结果：未完成。当前系统 Python 环境缺少 `fastapi`，import 在业务 guard 前被 `ModuleNotFoundError: No module named 'fastapi'` 阻断。该结果是本地依赖环境限制，不是本轮代码语法错误。

Frontend staging build：

```bash
npm run build -- --mode staging --outDir /tmp/partyonce_production_hardening_build --emptyOutDir
```

结果：通过。输出写入 `/tmp/partyonce_production_hardening_build`，未写入仓库 `frontend/vue-app/dist`。

Build warning：仍存在大 chunk warning，属于 P1 性能优化项。

Diff check：

```bash
git diff --check -- backend/main.py frontend/vue-app/src/api/index.js render.yaml docs/PARTYONCE_PRODUCTION_LAUNCH_READINESS_WORKPACK_20260512.md
```

结果：通过。

## 11. 是否读取/修改 `.env.production`

否。本轮只通过 `git status --short -- frontend/vue-app/.env.production` 确认其仍为历史 dirty，不读取内容，不修改内容，不提交内容。

## 12. 是否提交 dist

否。前端 build 输出到 `/tmp/partyonce_production_hardening_build`，未提交 `frontend/vue-app/dist`。

## 13. 是否触发外部系统

否。本轮未触发：

- production deploy
- staging deploy
- push
- Stripe / PaymentIntent
- webhook
- n8n
- email / SMS / WhatsApp
- production DB connection
- production migration

## 14. Blocker

当前仍为 No-Go。

剩余 blocker：

1. 生产数据库 migration runbook 未完成。
2. payment / webhook / n8n 仍非真实闭环。
3. `.env.production` 与 `dist` 仍需在 release branch 前隔离。
4. production auth / permission / monitoring / backup / rate limit gate 未完成。
5. Render blueprint 虽已硬化，但未经过 staging deploy runbook 验证。

## 15. 下一步 Go/No-Go 建议

建议：仍为 **No-Go**。

下一步最优入口是 **Production Migration and Staging Runbook V1**：

1. 定义 migration-managed schema 策略。
2. 建立 staging deploy runbook，但仍不触发 production。
3. 使用 clean release branch 排除 `.env.production`、`dist` 和历史 dirty files。
4. 跑 staging smoke gate 后，再讨论是否进入 production deploy approval。
