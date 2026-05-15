<template>
  <main class="investor-demo-page">
    <section class="demo-hero">
      <div>
        <p class="eyebrow">Investor guided demo · staging only</p>
        <h1>PartyOnce 投资人引导演示模式</h1>
        <p>
          一条受控路径看完整故事：欢迎首页、AI 推荐、主题 / 套餐 / 餐厅渲染、Quote 预填、客户 Quote / Order、
          后台 Admin Quote / Order、供应商、Payment readiness、Notification dry-run，最后回到上线计划。
        </p>
        <div class="hero-actions">
          <el-button type="primary" size="large" @click="startDemo">开始投资人演示</el-button>
          <el-button size="large" @click="bootstrapAdmin">启用后台演示身份</el-button>
          <el-button size="large" @click="clearDemo">清除演示样例</el-button>
        </div>
      </div>
      <aside class="stage-card">
        <strong>Current mode</strong>
        <span>Staging / Preview</span>
        <small>不真实支付，不触发 webhook/n8n，不外发消息，不部署 production。</small>
      </aside>
    </section>

    <el-alert
      class="guardrail-alert"
      type="warning"
      :closable="false"
      show-icon
      title="演示边界：本页只写入浏览器 fixture 和 localStorage 示例数据；不会连接生产 DB、不会启动真实支付、不会触发真实通知。"
    />

    <section class="demo-progress">
      <button
        v-for="(step, index) in demoSteps"
        :key="step.id"
        class="progress-pill"
        :class="{ active: index === activeStepIndex }"
        @click="activeStepIndex = index"
      >
        <span>{{ index + 1 }}</span>
        {{ step.short }}
      </button>
    </section>

    <section class="active-step-card">
      <div class="step-copy">
        <p class="eyebrow">Step {{ activeStepIndex + 1 }} / {{ demoSteps.length }}</p>
        <h2>{{ activeStep.title }}</h2>
        <p>{{ activeStep.description }}</p>
        <ul>
          <li v-for="point in activeStep.points" :key="point">{{ point }}</li>
        </ul>
        <div class="step-actions">
          <el-button
            v-for="action in activeStep.actions"
            :key="action.label"
            :type="action.primary ? 'primary' : 'default'"
            @click="handleAction(action)"
          >
            {{ action.label }}
          </el-button>
          <el-button :disabled="activeStepIndex === 0" @click="activeStepIndex -= 1">上一步</el-button>
          <el-button :disabled="activeStepIndex === demoSteps.length - 1" @click="activeStepIndex += 1">下一步</el-button>
        </div>
      </div>

      <div class="step-preview">
        <img :src="activeStep.image" :alt="activeStep.title">
        <div class="preview-caption">
          <strong>{{ activeStep.previewTitle }}</strong>
          <span>{{ activeStep.previewNote }}</span>
        </div>
      </div>
    </section>

    <section class="route-board">
      <article v-for="group in routeGroups" :key="group.title" class="route-group">
        <h3>{{ group.title }}</h3>
        <p>{{ group.note }}</p>
        <div class="route-list">
          <button v-for="route in group.routes" :key="route.path" @click="go(route.path)">
            <strong>{{ route.label }}</strong>
            <span>{{ route.path }}</span>
          </button>
        </div>
      </article>
    </section>

    <section class="unified-experience">
      <div>
        <p class="eyebrow">Unified Customer/Admin Experience</p>
        <h2>同一套业务上下文，客户看得懂，后台解释得清楚</h2>
        <p>
          AI Concierge 生成 party_scene_config；Quote 和 Order 读取同一份视觉、报价、场地、供应商和奖励上下文。
          客户侧看到简化解释，后台侧看到运营说明、line items、owner 和 next action。
        </p>
      </div>
      <div class="unified-columns">
        <article>
          <strong>客户看到什么</strong>
          <ul>
            <li>AI 推荐摘要、主题 / 套餐 / Restaurant A 渲染图</li>
            <li v-if="featureFlags.threeDExperienceEnabled">实验性 3D Preview 入口和场景配置摘要（视觉规划预览，非施工图 / 非供应商执行图）</li>
            <li v-else>3D Preview 已从客户可见演示中隐藏，后续质量验证后再恢复为卖点</li>
            <li>简化报价 line items、供应商 / 场地上下文</li>
            <li>分享奖励入口、审核中 / 已奖励状态和下一步动作</li>
          </ul>
        </article>
        <article>
          <strong>后台看到什么</strong>
          <ul>
            <li>客户需求摘要、AI 推荐理由和完整 party_scene_config</li>
            <li>2D 渲染图、供应商职责和报价依据</li>
            <li>editable line items、运营备注、owner、next action</li>
            <li>UGC 分享奖励状态，仍然不外发、不触发 webhook/n8n</li>
          </ul>
        </article>
      </div>
      <div class="unified-actions">
        <el-button type="primary" @click="go('/my/quotes/quote-local-501')">查看客户报价详情</el-button>
        <el-button @click="go('/my/orders/order-local-1001')">查看客户订单详情</el-button>
        <el-button @click="bootstrapAdmin(); go('/admin/quotes/1')">查看后台报价详情</el-button>
        <el-button @click="bootstrapAdmin(); go('/admin/orders/1')">查看后台订单详情</el-button>
        <el-button v-if="featureFlags.threeDExperienceEnabled" @click="go('/experimental/party-3d')">查看 3D Preview（非施工图）</el-button>
        <el-button @click="go('/my/rewards')">查看分享奖励</el-button>
      </div>
    </section>

    <section class="launch-plan">
      <p class="eyebrow">Current status and next launch plan</p>
      <h2>当前是 staging，可演示但不是 production Go</h2>
      <div class="plan-grid">
        <article>
          <strong>现在可演示</strong>
          <ul>
            <li>AI Concierge 需求采集和规则推荐</li>
            <li>Restaurant A 三主题套餐渲染</li>
            <li>Quote request 预填和本地 inquiry 保存</li>
            <li>客户 Quote / Order read-only 体验</li>
            <li>后台 Quote / Order skeleton 运营视角</li>
          </ul>
        </article>
        <article>
          <strong>上线前必须补齐</strong>
          <ul>
            <li>生产数据库迁移和备份策略</li>
            <li>真实 customer/admin auth</li>
            <li>真实 supplier 数据审核与权限</li>
            <li>测试支付完整闭环后再 production approval</li>
            <li>Webhook / n8n / 通知从 dry-run 升级为受控真实链路</li>
          </ul>
        </article>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import {
  bootstrapInvestorAdminFixture,
  clearInvestorGuidedDemo,
  startInvestorGuidedDemo
} from '@/services/investorDemoService';
import { featureFlags } from '@/config/featureFlags';

const router = useRouter();
const activeStepIndex = ref(0);

const demoSteps = [
  {
    id: 'welcome',
    short: '首页',
    title: '欢迎首页：先让投资人理解产品',
    description: '从首页开始看，不直接跳后台。投资人先看到 PartyOnce 是 AI + 视觉 + 运营闭环的派对策划平台。',
    points: ['AI 帮我推荐入口可见', '自己来策划入口可见', 'Castle / Space / Forest 主题入口可见'],
    image: '/party-assets/investor-hero/immersive-homepage-hero.png',
    previewTitle: 'Investor homepage hero',
    previewNote: '第一屏用于建立情绪价值和产品定位。',
    actions: [{ label: '打开首页', path: '/', primary: true }]
  },
  {
    id: 'ai',
    short: 'AI 推荐',
    title: 'AI 帮我推荐：把模糊需求变成方案',
    description: 'AI Concierge 一步问一个问题，采集年龄、日期、人数、预算、区域、主题偏好、场地状态和联系方式。',
    points: ['规则式推荐，不接付费 TTS', '推荐主题 / 套餐 / Restaurant A', '不创建 Quote / Order / 真实支付'],
    image: '/party-assets/venues/restaurant-a/restaurant-a-space-standard.png',
    previewTitle: 'Space Explorer Standard',
    previewNote: '推荐结果会进入 quote prefill。',
    actions: [{ label: '打开 AI Concierge', path: '/ai-voice-intake', primary: true }]
  },
  {
    id: 'quote',
    short: 'Quote 预填',
    title: '自动预填 Quote Request',
    description: '启动演示后，Quote 页面可读取 AI Concierge prefill，显示主题、套餐、Restaurant A、供应商建议和客户信息。',
    points: ['source = ai_concierge', '包含供应商建议', '提交后只保存 inquiry'],
    image: '/party-assets/quotes/quote-entry-preview.png',
    previewTitle: 'Quote prefill handoff',
    previewNote: '客户不需要重复填写 AI 已采集的信息。',
    actions: [
      { label: '初始化演示数据', command: 'start', primary: true },
      { label: '打开预填 Quote', path: '/quote?theme=space&package=standard&scene=restaurant-a&source=ai_concierge' }
    ]
  },
  {
    id: 'customer',
    short: '客户侧',
    title: '客户侧 Quote / Order',
    description: '客户可以查看自己的报价和订单进度，理解当前状态和下一步。',
    points: ['My Quotes 显示 Restaurant A 和供应商上下文', 'My Orders 显示业务状态', 'pending_deposit 不是在线付款状态'],
    image: '/party-assets/venues/restaurant-a/restaurant-a-castle-premium.png',
    previewTitle: 'Customer workspace',
    previewNote: '客户侧是 read-only staging fixture。',
    actions: [
      { label: '客户身份 + My Quotes', command: 'customer', path: '/my/quotes', primary: true },
      { label: 'My Orders', path: '/my/orders' }
    ]
  },
  {
    id: 'admin',
    short: '后台',
    title: '后台 Admin Quote / Order',
    description: '后台视角展示运营如何看客户主题、套餐、餐厅渲染、供应商建议、owner、next action 和状态。',
    points: ['需要 admin demo fixture', '远程 API 仍可能显示 skeleton/fallback', '不触发外部系统'],
    image: '/party-assets/venues/restaurant-a/restaurant-a-forest-standard.png',
    previewTitle: 'Operations context',
    previewNote: '后台是 staging skeleton，不是 production ops。',
    actions: [
      { label: '启用后台身份', command: 'admin', primary: true },
      { label: 'Admin Quotes', path: '/admin/quotes' },
      { label: 'Admin Orders', path: '/admin/orders' }
    ]
  },
  {
    id: 'supplier-payment',
    short: '供应商/支付',
    title: '供应商与支付 readiness',
    description: '供应商页面展示场地/供应商数据库方向；Payment readiness 只证明边界和下一阶段准备，不做真实支付。',
    points: ['供应商是 local/staging seed', 'Payment readiness 不启动真实支付', 'Notification dry-run 不外发'],
    image: '/party-assets/packages/package-tier-matrix.png',
    previewTitle: 'Readiness checks',
    previewNote: '这一步用于说明当前 staging 和上线前差距。',
    actions: [
      { label: '供应商页面', path: '/suppliers', primary: true },
      { label: 'Payment readiness', path: '/payment/deposit' },
      { label: 'Notification dry-run', command: 'admin', path: '/admin/notifications/dry-run' }
    ]
  }
];

const routeGroups = [
  {
    title: 'Customer Story',
    note: '给投资人看的主路径。',
    routes: [
      { label: 'Home', path: '/' },
      { label: 'AI Concierge', path: '/ai-voice-intake' },
      { label: 'Quote Prefill', path: '/quote?theme=space&package=standard&scene=restaurant-a&source=ai_concierge' },
      { label: 'My Quotes', path: '/my/quotes' },
      { label: 'My Quote Detail', path: '/my/quotes/quote-local-501' },
      { label: 'My Orders', path: '/my/orders' },
      { label: 'My Order Detail', path: '/my/orders/order-local-1001' }
    ]
  },
  {
    title: 'Operations Story',
    note: '需要先启用后台演示身份。',
    routes: [
      { label: 'Admin Quotes', path: '/admin/quotes' },
      { label: 'Admin Quote Detail', path: '/admin/quotes/1' },
      { label: 'Admin Orders', path: '/admin/orders' },
      { label: 'Admin Order Detail', path: '/admin/orders/1' },
      { label: 'Notify Dry-run', path: '/admin/notifications/dry-run' }
    ]
  },
  {
    title: 'Supply / Readiness',
    note: '供应商、场地和支付边界。',
    routes: [
      { label: 'Suppliers', path: '/suppliers' },
      { label: 'Venues', path: '/venues' },
      ...(featureFlags.threeDExperienceEnabled ? [{ label: '3D Preview', path: '/experimental/party-3d' }] : []),
      { label: 'My Rewards', path: '/my/rewards' },
      { label: 'Partner Apply', path: '/partner/apply' },
      { label: 'Payment Readiness', path: '/payment/deposit' }
    ]
  }
];

const activeStep = computed(() => demoSteps[activeStepIndex.value]);

function startDemo() {
  startInvestorGuidedDemo();
  ElMessage.success('已启动投资人演示模式：客户 fixture、AI inquiry 和 quote prefill 已准备好。');
  router.push('/ai-voice-intake');
}

function bootstrapAdmin() {
  bootstrapInvestorAdminFixture();
  ElMessage.success('已启用 staging admin demo fixture。');
}

function clearDemo() {
  clearInvestorGuidedDemo();
  ElMessage.success('已清除投资人演示样例。');
}

function go(path) {
  router.push(path);
}

function handleAction(action) {
  if (action.command === 'start') startDemo();
  if (action.command === 'admin') bootstrapAdmin();
  if (action.command === 'customer') startInvestorGuidedDemo();
  if (action.path) go(action.path);
}
</script>

<style scoped>
.investor-demo-page {
  min-height: 100vh;
  padding: 96px 24px 64px;
  background:
    radial-gradient(circle at 15% 12%, rgba(255, 198, 220, 0.30), transparent 30%),
    radial-gradient(circle at 82% 18%, rgba(157, 220, 255, 0.28), transparent 32%),
    linear-gradient(135deg, #fff7fb 0%, #f7fbff 48%, #f7fff9 100%);
  color: #111827;
}

.demo-hero,
.demo-progress,
.active-step-card,
.route-board,
.unified-experience,
.launch-plan,
.guardrail-alert {
  max-width: 1180px;
  margin-left: auto;
  margin-right: auto;
}

.demo-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) 320px;
  gap: 24px;
  align-items: stretch;
  margin-bottom: 18px;
}

.demo-hero,
.active-step-card,
.route-group,
.unified-experience,
.launch-plan,
.stage-card {
  border: 1px solid rgba(148, 163, 184, 0.28);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.84);
  box-shadow: 0 24px 70px rgba(15, 23, 42, 0.10);
  backdrop-filter: blur(18px);
}

.demo-hero > div,
.stage-card {
  padding: 30px;
}

.eyebrow {
  margin: 0 0 10px;
  color: #7c3aed;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

h1,
h2,
h3 {
  margin: 0 0 12px;
  color: #111827;
}

h1 {
  max-width: 820px;
  font-size: clamp(34px, 5vw, 60px);
  line-height: 1.05;
}

p,
li,
.stage-card small,
.preview-caption span,
.route-group span {
  color: #4b5563;
  line-height: 1.7;
}

.hero-actions,
.step-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 20px;
}

.stage-card {
  display: grid;
  align-content: center;
  gap: 10px;
}

.stage-card span {
  color: #16a34a;
  font-size: 28px;
  font-weight: 900;
}

.guardrail-alert {
  margin-bottom: 18px;
}

.demo-progress {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 18px;
}

.progress-pill {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  min-height: 42px;
  padding: 0 14px;
  border: 1px solid #ddd6fe;
  border-radius: 999px;
  background: #fff;
  color: #4338ca;
  cursor: pointer;
  font-weight: 800;
}

.progress-pill span {
  width: 24px;
  height: 24px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #eef2ff;
}

.progress-pill.active {
  background: #7c3aed;
  color: #fff;
}

.active-step-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 420px;
  gap: 24px;
  padding: 28px;
  margin-bottom: 24px;
}

.step-copy ul,
.plan-grid ul {
  margin: 14px 0 0;
  padding-left: 18px;
}

.step-preview img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border-radius: 16px;
  box-shadow: 0 18px 44px rgba(15, 23, 42, 0.16);
}

.preview-caption {
  display: grid;
  gap: 4px;
  margin-top: 12px;
}

.route-board {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.route-group {
  padding: 20px;
}

.route-list {
  display: grid;
  gap: 10px;
  margin-top: 14px;
}

.route-list button {
  display: grid;
  gap: 2px;
  width: 100%;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #fff;
  text-align: left;
  cursor: pointer;
}

.route-list strong {
  color: #111827;
}

.unified-experience {
  padding: 28px;
  margin-bottom: 24px;
}

.unified-experience > div:first-child p:not(.eyebrow) {
  max-width: 880px;
}

.unified-columns {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-top: 18px;
}

.unified-columns article {
  padding: 18px;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  background: #fff;
}

.unified-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 18px;
}

.launch-plan {
  padding: 28px;
}

.plan-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.plan-grid article {
  padding: 18px;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  background: #fff;
}

@media (max-width: 900px) {
  .demo-hero,
  .active-step-card,
  .route-board,
  .unified-columns,
  .plan-grid {
    grid-template-columns: 1fr;
  }
}
</style>
