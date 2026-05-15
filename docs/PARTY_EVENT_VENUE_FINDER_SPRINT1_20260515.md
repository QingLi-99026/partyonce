# Party Event Venue / Restaurant Finder Sprint 1

Date: 2026-05-15
Branch: eye-lite-v2-release-candidate-20260512
Scope: local/staging frontend prototype

## 1. 本轮目标

Owner 已决定当前阶段不继续强化 AI 客服/语音，也不把 3D 作为正式商用卖点。本轮把“场地 / 餐厅筛选”从文档方案推进到可点击、可筛选、可查看详情、可带入 Quote 的 local/staging 原型。

本轮没有接入 Google Maps、Places API、爬虫、真实餐厅数据库、真实支付、webhook、n8n 或外发消息。

## 2. 修改 / 新增文件

- `frontend/vue-app/src/data/venueFinderFixtures.js`
- `frontend/vue-app/src/services/venueFinderService.js`
- `frontend/vue-app/src/views/VenueFinder.vue`
- `frontend/vue-app/src/router/index.js`
- `frontend/vue-app/src/components/NavHeader.vue`
- `frontend/vue-app/src/views/HomePage.vue`
- `frontend/vue-app/src/views/QuotePage.vue`
- `frontend/vue-app/src/locales/zh.json`
- `frontend/vue-app/src/locales/en.json`
- `frontend/vue-app/src/locales/ko.json`
- `frontend/vue-app/src/locales/ar.json`

## 3. 页面与路由

新增：

- `/venue-finder`
- `/venue-finder/:id`

保留原有 `/venues` 和 `/venues/:id`。本轮选择新增 `/venue-finder`，原因是现有 `/venues` 是通用场地列表，当前新增流程需要承载更强的“按人数、预算、区域筛场地，再带入 Quote”的消费者路径。这样可以降低对原有场地页和 Restaurant A 详情页的破坏风险。

## 4. 首页入口

首页 hero CTA 已增加“查找适合场地 / Find a venue”，跳转 `/venue-finder`。

顶部导航新增 Venue Finder / 找场地入口，并受 `featureFlags.venueFilterEnabled` 控制。

## 5. Venue Finder 功能

### 快速筛选

已实现：

- Area / Suburb: Marrickville, Mascot, Burwood, Chatswood, Sydney CBD
- Distance radius: 1km, 3km, 5km, 10km
- Adults count
- Kids count
- Total guests 自动计算
- Child age range: 3-5, 6-8, 9-12, 13+
- Budget per person: Under $25, $25-$45, $45-$70, $70+
- Date / time UI 字段

### 高级筛选

已实现：

- Venue type: Restaurant, Private dining room, Function room, Cafe, Indoor play venue, Community hall
- Space type: Private room, Semi-private area, Open dining area, Outdoor area
- Kid friendly
- Allows decorations
- Allows cake
- Allows photographer
- Allows entertainment
- Parking nearby
- Public transport nearby

### 主题 / 布置适配筛选

已实现：

- Castle suitable
- Space suitable
- Forest suitable
- Neutral / flexible
- Dessert table space
- Photo zone space
- Balloon setup possible

### 结果列表

每张 venue card 展示：

- 本地图片
- 名称
- suburb
- venue type
- capacity range
- estimated price per person
- distance
- suitable themes
- package fit / match tags
- why this matches
- CTA: View venue, Compare, Use this venue for quote

### 空态

筛选结果为空时显示：

- No exact venue match yet
- 放宽距离 / 预算 / 限制的提示
- Reset filters 按钮

## 6. Fixture 数据

新增 `venueFinderFixtures.js`，包含 10 条 local/staging demo 场地：

- Marrickville Family Dining Room
- Mascot Party Bistro
- Inner West Cafe Play Corner
- Burwood Function Room
- Chatswood Family Banquet Room
- Sydney CBD Family Rooftop Room
- Mascot Community Hall
- Marrickville Studio Loft
- Burwood Kids Cafe Party Room
- CBD Private Dining Suite

字段覆盖：

- id / name / suburb / areaKeywords
- venueType / spaceType
- capacityMin / capacityMax
- pricePerPersonMin / pricePerPersonMax
- distanceKm
- kidFriendly / decoration / cake / photographer / entertainment / parking / public transport
- suitableThemes
- packageFit
- dessert table / photo zone / balloon setup
- image
- shortDescription
- whyMatch
- restrictions
- demoOnly

## 7. Matching 逻辑

新增 `venueFinderService.js`：

- `normalizeVenueFinderFilters`
- `scoreVenueMatch`
- `buildVenueFinderQuotePrefill`
- `saveVenueFinderQuotePrefill`
- `readVenueFinderQuotePrefill`

Match score 使用 local rules：

- 容量匹配
- 距离匹配
- 预算匹配
- venue type / space type
- kid-friendly / decoration / cake / photo / entertainment / parking / transport
- theme fit

## 8. Quote 承接

点击 “Use this venue for quote” 后：

- 写入 `sessionStorage` / `localStorage`
- 跳转 `/quote?source=venue_finder&venue=<id>&theme=<theme>&scene=restaurant-a&package=<tier>`
- Quote 页面读取 Venue Finder prefill
- Quote 顶部展示 Venue Finder prefill card
- Inquiry payload 会保留 venue finder 选择作为 `source = venue_finder`

已验证示例：

```text
/venue-finder
→ View venue
→ Use this venue for quote
→ /quote?source=venue_finder&venue=venue-marrickville-family-room&theme=castle&scene=restaurant-a&package=standard
```

Quote 页面显示：

- Marrickville Family Dining Room
- 30 guests
- Marrickville
- $25-$45 per person
- local/staging demo venue selection

## 9. 本地验证

Build:

```text
npm run build -- --outDir /tmp/partyonce_venue_finder_sprint1_build --emptyOutDir
Result: passed
```

Browser evidence:

```text
/tmp/partyonce_venue_finder_sprint1/
```

Routes checked:

- `/`
- `/venue-finder`
- `/venue-finder/venue-marrickville-family-room`
- `/quote`
- `/venues`
- `/venues/restaurant-a`

Result:

- HTTP 200: yes
- Page non-blank: yes
- Console errors: 0
- Page errors: 0
- Broken images: 0
- Venue Finder to Quote flow: passed
- Storage prefill: passed
- Quote reads prefill: passed

## 10. Safety

- `.env.production`: not read or modified.
- `frontend/vue-app/dist`: not written or submitted.
- No production deploy.
- No production DB.
- No Google Maps / Places API.
- No crawler.
- No external restaurant database.
- No Stripe / PaymentIntent.
- No webhook / n8n.
- No email / SMS / WhatsApp outbound.
- No AI API or voice API.

## 11. Blocker

No P0 blocker found in this local/staging prototype.

Known limitations:

- Distance is fixture-based, not geocoded.
- Availability/date is UI-only.
- Quote pricing still uses existing package/scene estimate, not a full venue-specific pricing engine.
- `/venue-finder/:id` detail is part of the finder prototype, not a production venue page.

## 12. 下一步建议

1. Add a customer-facing comparison tray for 2-3 venues.
2. Connect Venue Finder selection to quote line item venue fee logic.
3. Add fixture availability status: available / needs confirmation / unavailable.
4. Add “why not matched” explanations for excluded venues.
5. After local UX is accepted, decide whether to upgrade `/venues` or keep `/venue-finder` as the primary consumer entry.
