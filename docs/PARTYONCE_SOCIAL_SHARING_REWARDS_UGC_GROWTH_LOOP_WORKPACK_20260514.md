# PartyOnce Social Sharing Rewards / UGC Growth Loop Workpack 20260514

## 1. 本轮目标

完成 local/staging-only 社交分享奖励闭环第一版：

- 客户可提交 UGC / 社交分享记录。
- 客户可在 My Rewards 查看积分、审核状态和 voucher placeholder。
- 后台可审核分享提交并批准 / 拒绝奖励。
- 积分规则和 voucher placeholder 明确展示。
- 订单详情页可直接发起分享奖励提交。

本轮不接真实社交平台、不抓取真实帖子、不发通知、不接 payment、不触发 webhook / n8n。

## 2. 修改/新增文件

- `frontend/vue-app/src/services/socialRewardsService.js`
- `frontend/vue-app/src/views/MyRewards.vue`
- `frontend/vue-app/src/views/AdminSocialRewards.vue`
- `frontend/vue-app/src/views/MyOrderDetail.vue`
- `frontend/vue-app/src/router/index.js`
- `frontend/vue-app/src/components/NavHeader.vue`
- `docs/PARTYONCE_SOCIAL_SHARING_REWARDS_UGC_GROWTH_LOOP_WORKPACK_20260514.md`

## 3. 客户侧分享提交

完成。

客户可在：

- `/my/orders/:id`
- `/my/rewards`

提交分享内容：

- channel
- post URL placeholder
- caption / notes
- permission to reuse
- PartyOnce tag checkbox
- venue / theme mention checkbox

提交后写入 localStorage：

- key: `partyonce_social_reward_submissions_v1`
- status: `pending_review`
- source: `local/staging social rewards fixture`

不会真实发布社交内容，不上传文件，不发送 email / SMS / WhatsApp。

## 4. My Rewards / 订单内奖励展示

完成。

`/my/rewards` 展示：

- approved points
- pending points
- submission count
- reward rules
- submission review status
- voucher placeholders

`/my/orders/:id` 展示：

- approved points
- pending points
- submission count
- share caption input
- submit share for reward review CTA

## 5. 后台审核

完成。

新增后台页面：

- `/admin/social-rewards`

后台可查看：

- customer / order
- channel / caption
- reuse permission
- PartyOnce tag
- venue / theme signal
- status
- points

后台可执行：

- Approve
- Reject

审核结果仍只写入 localStorage，不发送任何外部通知。

## 6. 积分规则

完成。

规则：

- `ugc_share_submission`: 20 pending points
- `ugc_approved`: 120 approved points
- `venue_tag_bonus`: 30 approved bonus points
- `referral_placeholder`: 80 future placeholder points

积分仅为 staging preview 数据，不代表真实账户余额。

## 7. Voucher Placeholder

完成。

Voucher placeholders：

- `$20 party upgrade voucher` at 500 points
- `Dessert table upgrade placeholder` at 1000 points

这些 voucher 不可兑换，不接 payment，不修改订单金额，不生成正式优惠券。

## 8. 本地 Build 结果

通过。

执行：

```bash
cd frontend/vue-app
npm run build -- --outDir /tmp/partyonce_social_rewards_ugc_build --emptyOutDir
```

结果：

- build passed
- output: `/tmp/partyonce_social_rewards_ugc_build`
- 未写入 `frontend/vue-app/dist`

Static checks：

- `socialRewardsService.js` syntax check passed
- `MyRewards.vue` SFC parse passed
- `AdminSocialRewards.vue` SFC parse passed
- `MyOrderDetail.vue` SFC parse passed
- `NavHeader.vue` SFC parse passed

## 9. Route Smoke 结果

通过。

本地 Vite：

`http://127.0.0.1:5189`

Routes：

- `/` -> 200, non-blank, console error 0, broken images 0
- `/my/orders/order-local-1001` -> 200, non-blank, console error 0, broken images 0
- `/my/rewards` -> 200, non-blank, console error 0, broken images 0
- `/admin/social-rewards` -> 200, non-blank, console error 0, broken images 0
- `/payment/deposit` -> 200, non-blank, console error 0, broken images 0

Flow smoke：

- Submit UGC share from `/my/rewards`: passed
- Admin approve from `/admin/social-rewards`: passed

## 10. Preview Redeploy 结果

本地验证通过后，本轮允许 push release candidate branch 触发 Vercel Preview redeploy。

Preview URL：

`https://partyonce-git-eye-lite-v2-release-2af646-qingli-99026s-projects.vercel.app/`

如果 Preview 仍受 Vercel Deployment Protection 影响，需要 owner 继续按既有 Vercel access checklist 处理。

## 11. 是否读取/修改 .env.production

否。

## 12. 是否提交 dist

否。

Build 输出到 `/tmp`，未提交 `frontend/vue-app/dist`。

## 13. 是否 production deploy

否。

## 14. 是否触发 payment / webhook / n8n / 外发

否。

本轮没有触发：

- PaymentIntent
- Stripe
- webhook
- n8n
- email
- SMS
- WhatsApp
- social platform posting
- voucher redemption

## 15. Blocker

无本地 blocker。

仍需注意：

- 当前奖励、积分和 voucher 都是 local/staging placeholders。
- 未来 production 前需要真实 reward policy、反作弊、内容授权、隐私条款和 voucher redemption approval。

## 16. 下一步建议

进入 staging investor walkthrough 更新：

1. 验证 `/my/rewards` 和 `/admin/social-rewards` 在 Preview 中可访问。
2. 将 Social Rewards 作为增长闭环节点加入 Guided Demo Mode。
3. 后续再单独设计 production reward policy，不在当前 preview 中启用真实返利。
