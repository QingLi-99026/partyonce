# PartyOnce Release Candidate Missing Frontend Source Review V1 2026-05-12

## 1. 当前 Branch / HEAD

- Branch：`eye-lite-v2-release-candidate-20260512`
- 起始 HEAD：`56c49df0c549268d19e58a001913e22664be95b6`

## 2. Stash ID / Hash

- Stash ref：`stash@{0}`
- Stash hash：`e79d984ce10dde3ba86921be6e217d0193d60d90`
- Stash message：`pre-release-candidate-dirty-quarantine-20260512`

本轮没有 apply / pop 全量 stash。

## 3. Build 缺失原因

Release Candidate Branch Preparation V1 暴露 clean branch frontend build/dev 失败。

直接原因：

- `frontend/vue-app/src/router/index.js` 引用 `@/views/HomePage.vue`，但 clean HEAD 缺少该文件。
- `frontend/vue-app/src/router/index.js` 引用 `@/views/InquiryList.vue`，但 clean HEAD 缺少该文件。

恢复 `HomePage.vue` 后，build 继续提示缺少其直接依赖：

- `@/components/ThemeSwitcher.vue`
- `@/components/ImmersiveHero.vue`
- `@/components/SceneShowcase.vue`
- `@/components/PackageShowcase.vue`
- `@/themes`

判断：上一轮 local-safe smoke 依赖了未提交 source 文件。本轮只把 build 必需的前端 source 白名单恢复到 release candidate branch。

## 4. 从 Stash 恢复的文件

从 stash untracked parent `stash@{0}^3` 白名单恢复：

```text
frontend/vue-app/src/views/HomePage.vue
frontend/vue-app/src/views/InquiryList.vue
frontend/vue-app/src/components/ThemeSwitcher.vue
frontend/vue-app/src/components/ImmersiveHero.vue
frontend/vue-app/src/components/SceneShowcase.vue
frontend/vue-app/src/components/PackageShowcase.vue
frontend/vue-app/src/themes/index.js
```

恢复方式为逐个路径恢复，没有使用：

- `git stash apply`
- `git stash pop`
- `git checkout stash@{0} -- .`
- `git add .`

## 5. 明确没有恢复的高风险文件

本轮明确没有恢复：

```text
frontend/vue-app/.env.production
frontend/vue-app/dist/
frontend/vue-app/node_modules/
.DS_Store
backend/__pycache__/
test-results/
test_evidence/
.playwright-cli/
EvidencePack/
frontend/vue-app/package.json
frontend/vue-app/package-lock.json
historical docs/scripts/evidence
payment/Stripe 旧测试文件
webhook/n8n 旧测试文件
```

## 6. Frontend Build 结果

命令：

```bash
cd frontend/vue-app
npm run build -- --mode staging --outDir /tmp/partyonce_rc_build_check --emptyOutDir
```

结果：通过。

输出目录：`/tmp/partyonce_rc_build_check`

未写入 / 未提交：`frontend/vue-app/dist`

仍有 P1 warning：部分 chunks 超过 500 kB，尤其主 bundle 和 `Designer3D`。

## 7. Browser Route Smoke 结果

使用 local-safe backend / frontend：

- Backend：`127.0.0.1:8014`
- Frontend：`127.0.0.1:3014`
- Backend env：`ENVIRONMENT=staging`
- Backend DB：`sqlite:////tmp/partyonce_missing_source_api.sqlite`
- Lead storage：`/tmp/partyonce_missing_source_leads.sqlite`

结果：

| Route | Status | Console Errors | Page Errors | 结论 |
| --- | --- | ---: | ---: | --- |
| `/local-demo` | 200 | 0 | 0 | 通过 |
| `/quote` | 200 | 0 | 0 | 通过 |
| `/my/quotes` | 200 | 0 | 0 | 通过 |
| `/my/orders` | 200 | 0 | 0 | 通过 |
| `/admin/quotes` | 200 | 0 | 0 | 通过，未登录态为 auth/入口态 |
| `/admin/orders` | 200 | 0 | 0 | 通过，未登录态为 auth/入口态 |
| `/suppliers` | 200 | 0 | 0 | 通过 |
| `/partner/apply` | 200 | 0 | 0 | 通过 |
| `/partner/status` | 200 | 0 | 0 | 通过 |

## 8. 是否读取/修改 `.env.production`

否。

本轮没有读取、修改、恢复或提交 `.env.production`。

## 9. 是否提交 dist

否。

本轮 build 输出到 `/tmp`，没有提交 `frontend/vue-app/dist`。

## 10. 是否 Push / Deploy

否。

本轮没有 push，没有 deploy，没有连接 production DB，没有触发 production migration。

## 11. 是否可以进入 Remote Staging Deploy Preparation

可以进入 **remote staging deploy preparation**，但仍不等于允许 deploy。

理由：

- Clean branch 的 frontend build 已通过。
- 指定 browser route smoke 已通过。
- `.env.production`、dist、node_modules、test evidence、EvidencePack 均未恢复。

进入 remote staging deploy preparation 前仍需确认：

1. staged files 只包含本轮白名单 source 和报告。
2. remote staging env 不使用 `.env.production`。
3. remote staging deploy 仍需 owner/GPT 明确批准。

## 12. Blocker

Production 仍为 No-Go。

剩余 blocker：

1. remote staging deploy 尚未执行。
2. production migration 未执行。
3. MySQL-compatible migration set 未固化。
4. payment / webhook / n8n 仍非真实闭环。
5. production auth / monitoring / backup / rate limit gate 未完成。
6. bundle 大小仍需 P1 优化。

## 13. 下一步建议

下一步建议：进入 **Remote Staging Deploy Preparation V1**。

该阶段仍应禁止 production deploy、production DB、真实 payment、webhook/n8n 和外发消息；只准备 remote staging 所需的环境变量清单、部署前检查和 owner approval gate。
