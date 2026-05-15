# Party Event Hide 3D And Share Rewards Workpack 20260516

## 1. 本轮目标

本轮按 staging/mock-only 范围完成两件事：

- 通过 feature flag 软隐藏客户可见 3D 入口，保留已有 3D 代码和未来恢复路径。
- 将 Social Rewards 从占位页升级为“客户有奖分享提交 → 后台人工审核 → in-app 积分与 voucher placeholder 状态”的本地闭环。

本轮未修改 backend，未接真实社交平台 API，未接真实优惠券、支付、webhook、n8n 或外发消息。

## 2. 修改 / 新增文件

- `frontend/vue-app/src/config/featureFlags.js`
- `frontend/vue-app/src/router/index.js`
- `frontend/vue-app/src/views/FeatureUnavailable3D.vue`
- `frontend/vue-app/src/services/socialRewardsService.js`
- `frontend/vue-app/src/views/MyRewards.vue`
- `frontend/vue-app/src/views/AdminSocialRewards.vue`
- `frontend/vue-app/src/views/MyOrderDetail.vue`
- `frontend/vue-app/src/components/PartySceneSummary.vue`
- `frontend/vue-app/src/components/QuickStartCards.vue`
- `frontend/vue-app/src/views/QuotePage.vue`
- `frontend/vue-app/src/views/AdminQuoteDetail.vue`
- `frontend/vue-app/src/views/AdminOrderDetail.vue`
- `frontend/vue-app/src/views/InvestorDemoMode.vue`
- `frontend/vue-app/src/views/UserProfile.vue`
- `frontend/vue-app/src/views/Home.vue`
- `frontend/vue-app/src/views/AIPlanner.vue`
- `frontend/vue-app/src/views/AIVoiceIntake.vue`
- `docs/PARTY_EVENT_HIDE_3D_AND_SHARE_REWARDS_WORKPACK_20260516.md`

## 3. 3D 隐藏结果

`featureFlags.threeDExperienceEnabled` 已设为 `false`。

客户可见导航、Footer、QuickStartCards、Quote、PartySceneSummary、My Order Detail、Investor Demo、UserProfile 等 3D CTA 已通过 feature flag 隐藏或替换为非 3D 的视觉预览说明。

以下直接访问路径会显示安全提示页，而不是真实 3D/beta 页面或空白页：

- `/experimental/party-3d`
- `/party-3d`
- `/3d-preview`
- `/3d-designer`
- `/designer`

提示页说明 3D / 场景预览暂未开放，目前不作为正式商用功能展示，并提供返回首页、Venue Finder、Quote 的 CTA。

## 4. 有奖分享客户侧

`/my/rewards` 已升级为分享奖励主入口，并新增 `/share` 作为客户可见别名入口。

客户侧支持：

- 选择平台：Instagram、TikTok、小红书、Facebook、WeChat / private share。
- 选择文案模板并自由编辑。
- 使用 Clipboard API 复制文案；不可用时显示手动复制 fallback。
- 打开平台外链或显示手动打开 App 的安全说明。
- 提交分享证明：post URL、截图/证明说明、caption、是否包含 PartyOnce tag、是否包含场地/主题关键词、是否授权复用。
- 提交后写入 localStorage 队列，状态为 `pending_review`。

本轮不收集社交账号密码，不上传文件到服务端，不调用任何社交平台 API。

## 5. 后台审核与奖励占位

`/admin/social-rewards` 已强化为本地审核队列。

后台可查看：

- 客户 / 订单
- 平台
- proof type / proof URL / proof note
- tag 信号
- review status
- review reason
- voucher placeholder

后台可执行：

- Approve：写入 approved 状态，发放 placeholder points，并关联 `$20 party upgrade voucher` 等 voucher placeholder。
- Reject：写入 rejected 状态，并把拒绝原因显示给客户。

“通知用户结果”本轮定义为 App 内状态更新；未发送 email、SMS、WhatsApp，未触发 webhook/n8n。

## 6. 数据边界

本轮继续使用 `socialRewardsService` 的 localStorage skeleton。

扩展字段包括：

- `platform`
- `share_text`
- `copy_template_id`
- `proof_type`
- `proof_url`
- `proof_note`
- `review_status`
- `review_reason`
- `voucher_placeholder_id`
- `voucher_status`
- `customer_notification`
- `updated_at`

本轮未使用 backend share/reward wallet API，未影响 payment/deposit 计算。

## 7. Build 结果

通过：

```bash
npm run build -- --outDir /tmp/partyonce_share_rewards_3d_hide_build --emptyOutDir
```

输出写入 `/tmp/partyonce_share_rewards_3d_hide_build`，未写入 `frontend/vue-app/dist`。

## 8. Browser Smoke 结果

Evidence 路径：

`/tmp/partyonce_share_rewards_3d_hide_20260516/`

检查路由：

| Route | Status | Non-blank | Broken images |
| --- | ---: | --- | ---: |
| `/` | 200 | yes | 0 |
| `/venue-finder` | 200 | yes | 0 |
| `/experimental/party-3d` | 200 | yes, unavailable page | 0 |
| `/party-3d` | 200 | yes, unavailable page | 0 |
| `/3d-designer` | 200 | yes, unavailable page | 0 |
| `/3d-preview` | 200 | yes, unavailable page | 0 |
| `/my/orders/order-local-1001` | 200 | yes | 0 |
| `/my/rewards` | 200 | yes | 0 |
| `/share` | 200 | yes | 0 |
| `/admin/social-rewards` | 200 | yes | 0 |
| `/payment/deposit` | 200 | yes | 0 |

Browser result:

- Console errors: 0
- Page errors: 0
- Failed requests: 0
- Broken images: 0

Flow result:

- Customer share proof submission: passed
- Admin approve reward: passed
- Customer sees approved reward / voucher placeholder status: passed

Contact sheet:

`/tmp/partyonce_share_rewards_3d_hide_20260516/contact-sheet.png`

## 9. 是否读取 / 修改 `.env.production`

No. 本轮未读取、未修改 `.env.production`。

## 10. 是否提交 dist

No. Build 输出在 `/tmp`，未提交 `frontend/vue-app/dist`。

## 11. 是否 production deploy

No. 未 production deploy，未 push，未触发 Vercel/Render 部署。

## 12. 是否触发 payment / webhook / n8n / 外发

No. 本轮未触发真实 payment / Stripe / PaymentIntent，未触发 webhook/n8n，未发送 email/SMS/WhatsApp。

浏览器 smoke 中没有点击外部平台打开按钮；分享和审核流程只更新 localStorage。

## 13. Blocker

无 P0 blocker。

已知边界：

- Voucher 是 placeholder，不可真实核销。
- 社交证明是 mock 字段，不上传文件到服务端。
- 社交平台打开按钮仅提供普通外链或手动打开说明，不依赖平台 API。
- 3D 功能被隐藏但代码保留；未来若恢复，需要单独做 3D 质量验收。

## 14. 下一步建议

1. Owner 复查首页、Quote、My Order Detail，确认客户侧看不到未成熟 3D 卖点。
2. 复查 `/my/rewards` → `/admin/social-rewards` → `/my/rewards` 的审核闭环文案。
3. 若 owner 确认，可白名单 commit 本轮文件。
4. 后续如要生产化分享奖励，应单独设计真实 voucher wallet、审核存证和合规隐私策略。
