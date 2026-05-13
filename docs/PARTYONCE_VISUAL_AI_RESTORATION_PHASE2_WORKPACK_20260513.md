# PartyOnce Visual + AI Restoration Phase 2 Workpack

Date: 2026-05-14  
Branch: `eye-lite-v2-release-candidate-20260512`  
Scope: Investor Preview Access + Restaurant A Rendering Pack

## 1. 本轮目标

本轮把上一阶段的 Restaurant A “结构一致 + 装饰层数据模型”推进为 App 运行时可展示的真实 PNG 渲染资产，并继续确认 Vercel Preview 的投资人访问状态。

本轮不做 production deploy，不接真实 payment / Stripe，不触发 webhook / n8n，不外发 email / SMS / WhatsApp，不读取或修改 `.env.production`，不提交 `frontend/vue-app/dist`。

## 2. Preview 401 / 访问保护检查结果

公开访问复测 URL：

- `https://partyonce-git-eye-lite-v2-release-2af646-qingli-99026s-projects.vercel.app/`
- `https://partyonce-git-eye-lite-v2-release-2af646-qingli-99026s-projects.vercel.app/ai-voice-intake`
- `https://partyonce-git-eye-lite-v2-release-2af646-qingli-99026s-projects.vercel.app/themes`
- `https://partyonce-git-eye-lite-v2-release-2af646-qingli-99026s-projects.vercel.app/quote`
- `https://partyonce-git-eye-lite-v2-release-2af646-qingli-99026s-projects.vercel.app/payment/deposit`

结果：全部返回 `HTTP 401 Unauthorized`。

结论：这是 Vercel Deployment Protection / Authentication Required 访问保护问题，不是 App route failure。代码侧不能也不应绕过该保护。

Owner 操作清单：

1. 打开 Vercel Dashboard。
2. 进入 PartyOnce 对应 Project。
3. 进入 `Settings` → `Deployment Protection`。
4. 对 Preview Deployments 关闭 Authentication / Password / SSO protection，或生成公开 share link。
5. 确认 branch `eye-lite-v2-release-candidate-20260512` 的最新 deployment URL。
6. 不修改 production settings，不配置 production env，不把 secret 写进仓库。

## 3. 是否已解决投资人访问问题

未完全解决。当前公开 Preview 仍被 Vercel 访问保护挡住，需要 owner 在 Vercel Dashboard 关闭 Preview protection 或生成可分享访问链接。

## 4. 找回或生成了哪些图片

本轮生成了 Restaurant A original + 9 个主题套餐变体 PNG。生成方式为本地 Playwright 渲染固定 HTML/SVG 场景后截图，确保餐厅结构一致、桌椅数量一致、窗户/门/动线一致，变体仅改变装饰层。

新增生成脚本：

- `frontend/vue-app/scripts/render_restaurant_a_assets.cjs`

输出目录：

- `frontend/vue-app/public/party-assets/venues/restaurant-a/`

## 5. Restaurant A 10 张图结果

已生成并校验非 0 大小：

- `restaurant-a-original.png`
- `restaurant-a-castle-basic.png`
- `restaurant-a-castle-standard.png`
- `restaurant-a-castle-premium.png`
- `restaurant-a-space-basic.png`
- `restaurant-a-space-standard.png`
- `restaurant-a-space-premium.png`
- `restaurant-a-forest-basic.png`
- `restaurant-a-forest-standard.png`
- `restaurant-a-forest-premium.png`

装饰层规则：

- Basic：桌布、少量气球、小主题牌、简单桌花。
- Standard：主题桌布、中型气球拱门、花艺、背景板、甜品台。
- Premium：大型拱门、灯光、拍照区、定制背景板、全场氛围包装。

## 6. 图片路径清单

Runtime public paths:

- `/party-assets/venues/restaurant-a/restaurant-a-original.png`
- `/party-assets/venues/restaurant-a/restaurant-a-castle-basic.png`
- `/party-assets/venues/restaurant-a/restaurant-a-castle-standard.png`
- `/party-assets/venues/restaurant-a/restaurant-a-castle-premium.png`
- `/party-assets/venues/restaurant-a/restaurant-a-space-basic.png`
- `/party-assets/venues/restaurant-a/restaurant-a-space-standard.png`
- `/party-assets/venues/restaurant-a/restaurant-a-space-premium.png`
- `/party-assets/venues/restaurant-a/restaurant-a-forest-basic.png`
- `/party-assets/venues/restaurant-a/restaurant-a-forest-standard.png`
- `/party-assets/venues/restaurant-a/restaurant-a-forest-premium.png`

## 7. 接入了哪些页面

更新：

- `frontend/vue-app/src/data/visualAssets.js`

接入结果：

- `/`：首页 Restaurant A 预览和视觉上下文读取真实渲染图。
- `/themes`：主题页通过统一视觉注册表读取主题/套餐视觉。
- `/quote`：报价入口可读取对应主题/套餐 Restaurant A 渲染图。
- `/my/quotes`：客户报价列表展示视觉 summary。
- `/my/orders`：客户订单列表展示视觉 summary。
- `/admin/quotes`：后台 Quote queue 展示主题/场地/套餐视觉上下文。
- `/admin/orders`：后台 Order queue 展示主题/场地/套餐视觉上下文。

## 8. 本地 build 结果

命令：

```bash
cd frontend/vue-app
npm run build -- --outDir /tmp/partyonce_visual_phase2_build --emptyOutDir
```

结果：通过。输出写入 `/tmp/partyonce_visual_phase2_build`，未写入或提交 `frontend/vue-app/dist`。

备注：Vite 仍有 chunk-size warning，属于既有前端体积提醒，不阻断本轮。

## 9. 本地 route smoke 结果

本地 dev server：

- `http://127.0.0.1:3027/`

Route smoke：

- `/`：200，non-blank，console error = 0，broken images = 0
- `/ai-voice-intake`：200，non-blank，console error = 0，broken images = 0
- `/themes`：200，non-blank，console error = 0，broken images = 0
- `/quote`：200，non-blank，console error = 0，broken images = 0
- `/my/quotes`：200，non-blank，console error = 0，broken images = 0
- `/my/orders`：200，non-blank，console error = 0，broken images = 0
- `/admin/quotes`：200，non-blank，console error = 0，broken images = 0
- `/admin/orders`：200，non-blank，console error = 0，broken images = 0
- `/suppliers`：200，non-blank，console error = 0，broken images = 0
- `/payment/deposit`：200，non-blank，console error = 0，broken images = 0

Restaurant A 10 个 image URL 均返回 200。

## 10. Preview redeploy 结果

本轮代码与资产准备完成后，可以推送 release candidate branch 触发 Vercel Preview redeploy。

当前公开 Preview URL 仍返回 `401 Unauthorized`，因此无法从公共侧确认 redeploy 后页面内容。该问题需要先由 owner 解除 Preview 访问保护或提供公开 share link。

## 11. Preview URL

当前已知 Preview：

- `https://partyonce-git-eye-lite-v2-release-2af646-qingli-99026s-projects.vercel.app/`

## 12. 是否读取/修改 .env.production

否。仅检查到本地文件存在，未读取内容，未修改，未 stage。

## 13. 是否提交 dist

否。build 输出到 `/tmp/partyonce_visual_phase2_build`，未提交 `frontend/vue-app/dist`。

## 14. 是否 production deploy

否。

## 15. 是否触发 payment / webhook / n8n / 外发

否。`/payment/deposit` 仅作为 readiness route smoke；未创建 PaymentIntent，未触发 webhook / n8n，未外发 email / SMS / WhatsApp。

## 16. Blocker

1. Vercel Preview 仍返回 `401 Unauthorized`。需要 owner 在 Vercel Dashboard 关闭 Preview Deployment Protection，或生成公开 share link。
2. 本轮图片为可复现的本地 SVG/HTML 渲染 PNG，适合作为 App runtime 样板资产；如果要进一步升级为照片级真实餐厅渲染，可在下一轮使用 AI image / Photoshop / Canva 生成更高拟真版本。

## 17. 下一步建议

先解决 Vercel Preview access blocker。访问打开后，重新跑 Preview smoke：

- `/`
- `/ai-voice-intake`
- `/themes`
- `/quote`
- `/payment/deposit`

若 Preview smoke 通过，再进入投资人展示图 / deck 的 Canva 包装阶段；不要在 access blocker 未解除前继续做 production Go/No-Go。
