# PartyOnce Visual Scene Rendering Upgrade Workpack 20260514

## 1. 本轮目标

本轮进入 Phase 2：视觉与场景渲染升级。

目标不是新增普通功能，而是把 Restaurant A、Castle / Space / Forest 三主题、Basic / Standard / Premium 三档套餐从“可用图”继续推进到更有说服力的投资人和客户演示资产。

本轮仍为 release candidate / staging preview 范围，不做 production deploy，不接真实 payment / Stripe，不触发 webhook / n8n，不外发 email / SMS / WhatsApp，不读取或修改 `.env.production`，不提交 `frontend/vue-app/dist`。

## 2. 修改 / 新增文件

- `frontend/vue-app/scripts/render_restaurant_a_assets.cjs`
- `frontend/vue-app/public/party-assets/venues/restaurant-a/restaurant-a-original.png`
- `frontend/vue-app/public/party-assets/venues/restaurant-a/restaurant-a-castle-basic.png`
- `frontend/vue-app/public/party-assets/venues/restaurant-a/restaurant-a-castle-standard.png`
- `frontend/vue-app/public/party-assets/venues/restaurant-a/restaurant-a-castle-premium.png`
- `frontend/vue-app/public/party-assets/venues/restaurant-a/restaurant-a-space-basic.png`
- `frontend/vue-app/public/party-assets/venues/restaurant-a/restaurant-a-space-standard.png`
- `frontend/vue-app/public/party-assets/venues/restaurant-a/restaurant-a-space-premium.png`
- `frontend/vue-app/public/party-assets/venues/restaurant-a/restaurant-a-forest-basic.png`
- `frontend/vue-app/public/party-assets/venues/restaurant-a/restaurant-a-forest-standard.png`
- `frontend/vue-app/public/party-assets/venues/restaurant-a/restaurant-a-forest-premium.png`
- `frontend/vue-app/public/party-assets/packages/package-tier-matrix.png`
- `docs/PARTYONCE_VISUAL_SCENE_RENDERING_UPGRADE_WORKPACK_20260514.md`

## 3. Restaurant A 渲染升级内容

升级 `render_restaurant_a_assets.cjs`，保留同一 Restaurant A 空间结构：

- 桌子数量不变
- 椅子数量不变
- 窗户位置不变
- 门位置不变
- 主动线和地板透视不变

增强项：

- 墙面分区和软光层
- 地板木纹 / 透视线
- 桌面餐具、桌旗、桌花 / 中央摆件
- 椅子阴影和材质层
- 主题色氛围光
- Basic / Standard / Premium 层级标签
- 标准档甜品台
- 高级档拍照区、背景板、灯光线和沉浸式拱门

## 4. 三主题三档差异

Castle Princess：

- Basic：粉、紫、金基础桌布，小主题牌，少量气球。
- Standard：Royal Dessert Table、气球拱门、金色层次、甜品台。
- Premium：Photo Castle / Crown Wall、大型拱门、星光、全场金色框线。

Space Explorer：

- Basic：深蓝空间、星球、火箭、少量星星。
- Standard：Mission Dessert Station、中型拱门、星球轨道、甜品台。
- Premium：Launch Photo Bay / LED Star Wall、LED 星光、全场科技线。

Forest Adventure：

- Basic：藤蔓、木质 Trail 标识、自然色桌面。
- Standard：Woodland Treat Table、森林动物、拱门、甜品台。
- Premium：Camp Photo Nook / Forest Backdrop、灯串、藤蔓、全场森林框线。

## 5. 套餐矩阵升级

`frontend/vue-app/public/party-assets/packages/package-tier-matrix.png` 已更新为三主题九格矩阵：

- Castle Princess Basic / Standard / Premium
- Space Explorer Basic / Standard / Premium
- Forest Adventure Basic / Standard / Premium

矩阵明确说明：

> Same room, same tables, same chairs. Only the decoration layer changes.

该文件继续使用原 runtime path，因此现有页面无需额外结构改造即可读取升级后的矩阵图。

## 6. 资产校验

Restaurant A 10 张图：

- 分辨率：`1440x900`
- 文件均非 0
- 本地 URL 均返回 `200 image/png`

Package matrix：

- 分辨率：`1800x1440`
- 文件非 0
- 本地 URL 返回 `200 image/png`

## 7. 本地 build 结果

命令：

```bash
cd frontend/vue-app
npm run build -- --outDir /tmp/partyonce_visual_scene_phase2_build --emptyOutDir
```

结果：通过。

说明：build 输出到 `/tmp/partyonce_visual_scene_phase2_build`，未写入或提交 `frontend/vue-app/dist`。Vite 仍有既有 chunk size warning，不阻断本轮。

## 8. 本地 route smoke 结果

本地 dev server：`http://127.0.0.1:5181/`

验证 routes：

- `/`：200，非空白，broken images = 0
- `/ai-voice-intake`：200，非空白，broken images = 0
- `/themes`：200，非空白，broken images = 0
- `/quote`：200，非空白，broken images = 0
- `/my/quotes`：200，非空白，broken images = 0
- `/my/orders`：200，非空白，broken images = 0
- `/admin/quotes`：200，非空白，broken images = 0
- `/admin/orders`：200，非空白，broken images = 0
- `/suppliers`：200，非空白，broken images = 0
- `/payment/deposit`：200，非空白，broken images = 0

Console error：0。

## 9. 是否读取 / 修改 `.env.production`

否。未读取、未修改 `.env.production`。

## 10. 是否提交 dist

否。未提交 `frontend/vue-app/dist`。

## 11. 是否 production deploy

否。

## 12. 是否触发 payment / webhook / n8n / 外发

否。未创建 PaymentIntent，未触发 webhook / n8n，未发送 email / SMS / WhatsApp。

## 13. Blocker

无本地代码 blocker。

Preview 侧仍需确认 Vercel branch alias 是否指向最新 release candidate deployment；若固定 Preview URL 仍显示旧内容，需要在 Vercel Dashboard 检查最新 deployment 状态。

## 14. 下一步建议

进入 Phase 3：把升级后的视觉资产在投资人引导演示模式中做更强叙事包装，明确展示：

1. AI 推荐为什么选这个主题和套餐；
2. 同一 Restaurant A 如何从原貌变成三主题三档；
3. Quote / My Quotes / Admin Quote 中为什么这些图片能支撑报价依据；
4. 当前仍是 staging preview，不触发真实支付。
