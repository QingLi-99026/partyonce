# PartyOnce Release Branch Clean Gate V1 2026-05-12

## 1. 当前 HEAD / 最近 Commits

当前 HEAD：

```text
fcbab59e Run staging smoke execution v1
```

最近 12 个 commits：

```text
fcbab59e Run staging smoke execution v1
bc61ba78 Add production migration and staging runbook
36e51e8b Add production hardening patch pack v1
390075af Chore: update evidence tracker and add misc scripts/tests
e1ec0094 Production hardening patch pack v1 (fail-closed, CORS allowlist, no auto-create)
3348caeb Document production launch readiness
771a4163 Add notification dry-run payload lab
433c542d Prepare Stripe test-mode readiness
0feec45d Complete supplier light closed loop
4d748594 Enhance customer next-step interactions
eccbe0c5 Add admin bulk ops UX
761a750a Show persisted ops fields in admin queues
```

## 2. 当前 Dirty 文件分类

当前 `git status --short` 汇总：

```text
modified=16
deleted=38
untracked=195
```

### A. 应该进入 release candidate 的已提交内容

建议 release candidate 以当前 clean HEAD `fcbab59e` 为基础，不直接使用当前 dirty working tree。

可接受的已提交范围包括：

- Admin Lead / Quote / Order 主链路与运营硬化。
- 客户侧 read-only closed loop。
- 供应商轻量闭环。
- Payment readiness / Stripe test-mode 准备，但不含真实 payment。
- Notification dry-run payload lab，但不含真实外发。
- Production readiness / hardening / migration runbook / staging smoke 报告。
- `backend/main.py` 中已提交的 production fail-closed、CORS allowlist、production 自动建表 guard。
- `frontend/vue-app/src/api/index.js` 中已提交的 production API URL fail-safe。
- `render.yaml` 中已提交的 `rootDir: backend`、`autoDeploy: false`、manual env gate。

### B. 必须排除的历史 dirty

必须从 release candidate 排除：

- `frontend/vue-app/.env.production`
- `frontend/vue-app/dist/`
- `frontend/vue-app/node_modules/`
- `.DS_Store` 及所有子目录 `.DS_Store`
- `backend/__pycache__/`
- `test-results/`
- `test_evidence/`
- `.playwright-cli/`
- `EvidencePack/`
- 大量历史截图、验收证据、旧任务包、竞品研究脚本、临时测试脚本
- 任何 Stripe/payment 真实测试痕迹、截图证据、外部系统证据文件
- 未经 owner 决策的 `archive/`、`reports/`、历史 docs、临时 scripts

当前仓库里 `frontend/vue-app/node_modules` 有约 `20381` 个 tracked 文件，`frontend/vue-app/dist` 有约 `49` 个 tracked 文件，`.DS_Store` 也有 tracked 项。它们不应进入新的 release candidate；后续需要单独 cleanup PR / commit 处理 tracked ignore debt。

### C. 需要 owner 决策的 dirty

以下 dirty 可能包含真实业务变更，但不应默认进入 release candidate：

- `frontend/vue-app/package.json`
- `frontend/vue-app/package-lock.json`
- `frontend/vue-app/src/App.vue`
- `frontend/vue-app/src/components/AppFooter.vue`
- `frontend/vue-app/src/styles/tokens.css`
- `frontend/vue-app/src/views/AIPlanner.vue`
- `frontend/vue-app/src/views/Home.vue`
- `frontend/vue-app/src/views/Orders.vue`
- `frontend/vue-app/src/views/PartnerApply.vue`
- `frontend/vue-app/src/views/Quotation.vue`
- `frontend/vue-app/src/views/Venues.vue`
- `scripts/backup-partyonce.sh`

这些文件可能属于历史视觉改造、页面重构、脚本改动或依赖变更。进入 release 前必须由 owner 决定：

1. 是否纳入 release candidate。
2. 是否拆成单独 feature branch。
3. 是否暂存到 quarantine stash。
4. 是否恢复到 HEAD。

### D. 可以安全恢复 / 忽略的缓存或生成物

可以作为 cleanup 候选，但本轮不执行：

- `.DS_Store`
- `frontend/vue-app/node_modules/.DS_Store`
- `frontend/vue-app/node_modules/.vite/deps_temp_*`
- `frontend/vue-app/node_modules/.package-lock.json`
- `test-results/.last-run.json`
- `test-results/.../error-context.md`
- `test_evidence/.DS_Store`
- `.playwright-cli/`

注意：其中部分文件当前是 tracked 状态，因此不能简单依赖 `.gitignore`。后续应单独执行 tracked generated files cleanup，而不是混入 release candidate。

## 3. Release Candidate 可接受文件范围

建议 release candidate 只接受：

- 当前 HEAD `fcbab59e` 已提交内容。
- 后续经 owner 批准的 remote staging deploy preparation 文档。
- 必要的 deployment config 小修，但必须单独 review。
- 必要的 migration runbook / staging smoke 报告。

不接受：

- 未确认页面视觉重构。
- 未确认 package / lockfile 变更。
- production env。
- dist / build output。
- node_modules / cache。
- evidence screenshots。
- test artifacts。

## 4. 必须排除文件

强制排除：

```text
frontend/vue-app/.env.production
frontend/vue-app/dist/
frontend/vue-app/node_modules/
backend/__pycache__/
.DS_Store
test-results/
test_evidence/
.playwright-cli/
EvidencePack/
```

同时排除所有真实生产 secret、真实客户/财务/合同/银行/付款资料。

## 5. Owner 决策项

需要 owner 决策：

1. `frontend/vue-app/package.json` / `package-lock.json` 是否纳入 release。
2. 当前 dirty 的前端页面和样式是否属于已批准 UI 改造。
3. `scripts/backup-partyonce.sh` 是否仍是当前运维路径。
4. 大量 untracked historical docs 是否需要归档到 docs audit pack，而不是进入 release。
5. tracked `node_modules`、tracked `dist`、tracked `.DS_Store` 是否开启单独 cleanup commit。

## 6. 是否建议创建 Release Candidate Branch

建议创建，但不是从当前 dirty working tree 直接创建。

推荐路径：

```bash
git switch -c eye-lite-v2-release-candidate-20260512 fcbab59e
git status --short
```

要求：

- 新分支必须从 clean HEAD 开始。
- 不带入当前 dirty working tree。
- 若当前工作树无法 clean checkout，先做 owner-approved stash / quarantine。

本轮没有创建 branch。

## 7. 是否建议 Stash / Quarantine 历史 Dirty

建议，但需要 owner 明确批准。

建议分三类：

1. `stash/release-blocking-env-dist-node`：`.env.production`、`dist`、`node_modules`、`.DS_Store`、test artifacts。
2. `stash/frontend-owner-review`：package、lockfile、dirty frontend views/styles。
3. `stash/historical-docs-evidence`：EvidencePack、reports、historical docs、research scripts。

本轮没有执行 stash、restore、delete、clean。

## 8. 是否允许 Remote Staging Deploy

当前不允许直接 remote staging deploy。

原因：

1. 当前 working tree 不干净。
2. `.env.production` dirty 未隔离。
3. `package.json` / `package-lock.json` dirty 未决策。
4. tracked `node_modules` / `dist` / `.DS_Store` 债务未处理。
5. release candidate branch 尚未创建。

可以进入 remote staging deploy preparation，但前置是完成 clean branch / quarantine gate。

## 9. 仍为 No-Go 的原因

Production 仍为 No-Go：

1. production migration 未执行。
2. MySQL-compatible migration set 未固化。
3. payment / webhook / n8n 仍非真实闭环。
4. release branch clean gate 尚未真正执行到 clean branch。
5. `.env.production`、dist、node_modules、package dirty 仍需隔离。
6. remote staging deploy 尚未执行。

## 10. 下一步 Checklist

建议下一步：**Release Candidate Branch Preparation V1**。

Checklist：

1. Owner 确认是否允许 stash / quarantine 当前 dirty。
2. 单独处理 `.env.production`：不得提交，不得读取内容，不得用于 release。
3. 单独处理 `dist` / `node_modules` / `.DS_Store` tracked debt。
4. Owner 决策 package / lockfile 是否保留。
5. Owner 决策 dirty frontend views/styles 是否进入 release。
6. 从 `fcbab59e` 创建 release candidate branch。
7. 在 clean branch 重新跑 local-safe smoke。
8. 通过后再进入 remote staging deploy preparation。

## 11. 本轮动作边界

本轮只做 read-only audit 和报告。

未执行：

- push
- deploy
- git add .
- 创建 branch
- stash
- restore
- 删除历史 dirty files
- 修改 `.env.production`
- 提交 `dist`
- production DB connection
- production migration
- Stripe/payment real trigger
- webhook/n8n real trigger
- email/SMS/WhatsApp 外发

## 12. Commit

本报告如提交，只应单文件白名单提交：

```bash
git add docs/PARTYONCE_RELEASE_BRANCH_CLEAN_GATE_V1_20260512.md
git commit -m "Add release branch clean gate v1"
```
