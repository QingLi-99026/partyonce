# Party Event AI Hide + 3D Capability + Venue Filter Workpack

Date: 2026-05-15
Branch: eye-lite-v2-release-candidate-20260512
Scope: local/staging frontend only

## 1. 本轮目标

Owner 已确认当前 AI 语音 / AI 客服体验不够商用，暂时不作为前台卖点展示。本轮完成三件事：

1. 通过 feature flag 软隐藏客户可见 AI 入口与文案，不删除现有代码。
2. 审计当前 3D 能力是否适合作为产品卖点。
3. 设计场地 / 餐厅筛选方案，为后续“像买车/找房一样筛场地”的体验做准备。

本轮没有接真实 AI API、语音 API、payment、Stripe、webhook、n8n 或外发消息。

## 2. 修改文件

- `frontend/vue-app/src/config/featureFlags.js`
- `frontend/vue-app/src/components/NavHeader.vue`
- `frontend/vue-app/src/components/AppFooter.vue`
- `frontend/vue-app/src/components/PartySceneSummary.vue`
- `frontend/vue-app/src/views/HomePage.vue`
- `frontend/vue-app/src/views/QuotePage.vue`
- `frontend/vue-app/src/views/MyQuotes.vue`
- `frontend/vue-app/src/views/MyOrders.vue`
- `frontend/vue-app/src/views/MyQuoteDetail.vue`
- `frontend/vue-app/src/views/MyOrderDetail.vue`
- `frontend/vue-app/src/views/Party3DPreview.vue`
- `frontend/vue-app/src/views/Venues.vue`
- `frontend/vue-app/src/data/visualAssets.js`
- `frontend/vue-app/src/data/packageExplanation.js`
- `frontend/vue-app/src/locales/zh.json`
- `frontend/vue-app/src/locales/en.json`
- `frontend/vue-app/src/locales/ko.json`
- `frontend/vue-app/src/locales/ar.json`

## 3. Feature Flag

新增：

```js
export const featureFlags = {
  aiExperienceEnabled: false,
  threeDExperienceEnabled: true,
  venueFilterEnabled: true
}
```

效果：

- `aiExperienceEnabled: false`：隐藏客户可见 AI 导航、首页 AI 双入口、语音/听一听入口、Quote AI prefill banner、客户空态中的 AI 引导入口、3D 页面返回 AI Concierge 的入口。
- `threeDExperienceEnabled: true`：保留 3D Preview / 3D Design 入口，但保持 beta / preview 边界说明。
- `venueFilterEnabled: true`：为后续场地筛选施工保留配置位。

现有 `/ai-voice-intake` 与相关服务代码未删除，未来可通过 feature flag 或单独工作包恢复。

## 4. AI 隐藏结果

已隐藏或中性化：

- 顶部导航中的 AI Guide / AI Planner。
- Footer 中的 AI planning 链接。
- 首页第一屏改为“主题、餐厅 A、套餐、报价”的客户流程。
- 首页语音/听一听入口隐藏。
- Quote 页不再展示 AI prefill banner。
- My Quotes / My Orders 空态入口改为 Quote，而不是 AI Concierge。
- My Quote Detail / My Order Detail 的标题与推荐说明改为“场景配置 / 视觉规划”。
- 套餐解释文案中的“AI 会推荐”改为“策划流程会推荐”。
- 多语言可见文案中的 customer scene config 从 AI scene config 改为 scene config。

验证结果：

- `/`
- `/themes`
- `/venues`
- `/venues/restaurant-a`
- `/quote`
- `/my/quotes`
- `/my/orders`
- `/experimental/party-3d`
- `/3d-designer`

上述客户/演示核心路由中，可见文本 AI 匹配数均为 0。

## 5. 3D 能力审计

当前结论：可以保留为 beta / visual planning preview，不应作为“正式商用 3D 编辑器”或“施工图能力”对外承诺。

当前已有能力：

- `/experimental/party-3d` 可读取 fallback scene config 并展示 Restaurant A 的场景预览。
- `/3d-designer` 已不再白屏，有 3D Party Design Preview 占位内容。
- 页面可展示桌椅、主桌、甜品台、拍照区、背景板、气球拱门、入口动线等视觉规划元素。
- Castle / Space / Forest 与 Basic / Standard / Premium 有颜色和装饰密度差异。

当前不足：

- 不是真实 3D 编辑器。
- 没有拖拽布置、尺寸标定、供应商施工图或真实空间测量。
- 主要是 CSS / SVG / isometric / preview sandbox，而不是 photorealistic 3D。
- 不能承诺为建筑图、施工图、最终供应商执行图。

建议：

- 继续开启 `threeDExperienceEnabled`，但所有入口必须写清 Beta / Preview / Not construction drawing。
- 对客户和投资人表述为“visual planning preview / 场景规划预览”。
- 等 Restaurant A 真实图片、Canva/3D 模板、场地尺寸和供应商施工参数补齐后，再评估是否升级为主卖点。

## 6. 场地 / 餐厅筛选方案设计

目标：让客户像买车 / 找房一样逐步缩小场地范围，而不是一次性面对大量卡片。

### 6.1 第一层筛选

建议作为顶部 wizard / chips：

1. 人数：成人、儿童、总人数。
2. 区域：Marrickville、Mascot、Massville 或自定义 suburb。
3. 距离：3km / 5km / 10km / any。
4. 预算：低 / 中 / 高，或 room hire / package total。
5. 场地类型：餐厅包间、儿童咖啡馆、社区厅、酒店宴会厅、户外花园、艺术空间。

### 6.2 第二层筛选

建议放在 sidebar / advanced filters：

- 包间 / 开放空间。
- 室内 / 户外。
- 儿童友好程度。
- 是否允许自带蛋糕。
- 是否有停车。
- 是否有音响 / 投影 / 灯光。
- 是否适合 Castle / Space / Forest。
- 支持 Basic / Standard / Premium 哪些套餐。
- 桌椅数量。
- 是否有甜品台位置。
- 是否有拍照区位置。
- 布置进场时间。
- 噪音限制。
- 无障碍与婴儿车友好。

### 6.3 推荐排序

建议使用 match score：

- 容量匹配：25%
- 区域 / 距离：20%
- 预算匹配：15%
- 场地类型 / 包间需求：15%
- 儿童友好：10%
- 主题适配：10%
- 布置物流：5%

每张卡片应显示：

- Why this fits：例如“30 guests · Mascot 8km · private dining · Castle/Space ready”。
- 风险提示：例如“需要人工确认 availability”。
- 视觉：原貌图 + 推荐主题渲染图。
- CTA：查看详情 / 进入报价。

### 6.4 数据字段建议

后续可扩展 `venueSupplierRegistry` 或 venue seed：

- `suburb`
- `latitude`
- `longitude`
- `distanceKm`
- `minGuests`
- `maxGuests`
- `roomHireMin`
- `roomHireMax`
- `packageBudgetFit`
- `venueType`
- `privateRoom`
- `openSpace`
- `indoorOutdoor`
- `childFriendlyScore`
- `themeCompatibility`
- `supportedPackageTiers`
- `tables`
- `chairs`
- `dessertTableFit`
- `photoZoneFit`
- `cateringPolicy`
- `cakePolicy`
- `parking`
- `accessibility`
- `setupAccessWindow`
- `noisePolicy`
- `availabilityMode`

## 7. 附带修复：场地页断图

浏览器验证发现 `/venues` 中旧 demo 场地仍使用外部 Unsplash 图片，在离线或受限网络下会出现 broken image。本轮将这些 demo 场地图片替换为仓库已有 Restaurant A 本地 assets，没有新增图片，也没有引用外部 URL。

## 8. 验证结果

Build:

```text
npm run build -- --outDir /tmp/partyonce_ai_hide_3d_venue_plan_build --emptyOutDir
Result: passed
```

Browser smoke evidence:

```text
/tmp/partyonce_ai_hide_3d_venue_plan_check/
```

Routes checked:

| Route | Status | Non-blank | Broken images | Console errors | Visible AI text |
| --- | ---: | --- | ---: | ---: | ---: |
| `/` | 200 | yes | 0 | 0 | 0 |
| `/themes` | 200 | yes | 0 | 0 | 0 |
| `/venues` | 200 | yes | 0 | 0 | 0 |
| `/venues/restaurant-a` | 200 | yes | 0 | 0 | 0 |
| `/quote` | 200 | yes | 0 | 0 | 0 |
| `/my/quotes` | 200 | yes | 0 | 0 | 0 |
| `/my/orders` | 200 | yes | 0 | 0 | 0 |
| `/experimental/party-3d` | 200 | yes | 0 | 0 | 0 |
| `/3d-designer` | 200 | yes | 0 | 0 | 0 |

## 9. Safety

- `.env.production`: not read or modified.
- `frontend/vue-app/dist`: not written or submitted.
- No production deploy.
- No production DB.
- No Stripe / PaymentIntent.
- No webhook / n8n trigger.
- No email / SMS / WhatsApp outbound.
- No external AI or speech API.
- No Canva or external image dependency added.

## 10. Remaining Notes

- `/ai-voice-intake` remains in code for future recovery. If Owner wants direct URL access blocked too, add a route guard / redirect in a separate small workpack.
- Investor Demo may still describe older AI-related narrative if opened deliberately. This is not customer flow, but should be cleaned before a polished investor deck/review.
- 3D should stay labelled as beta preview until real 3D assets, dimensions, and editable scene logic are implemented.

## 11. Next Recommended Work

1. Add venue filter UI skeleton behind `venueFilterEnabled`.
2. Update venue cards with match score and “why this fits”.
3. Decide whether `/ai-voice-intake` direct URL should redirect while `aiExperienceEnabled=false`.
4. Improve 3D visuals only after venue filtering is stable.
