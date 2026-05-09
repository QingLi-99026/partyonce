<template>
  <div class="local-demo-page app-page app-page--wide">
    <header class="demo-header app-page-header">
      <div>
        <p class="app-eyebrow">Local acceptance hub</p>
        <h1 class="app-page-title">PartyOnce 本地演示流程</h1>
        <p class="app-page-subtitle">
          把第一阶段验收需要看的前台展示、报价留资、跟进记录、供应商资料和后台只读入口集中在一个页面。
          本页只使用本地页面与浏览器存储，不触发付款、webhook、n8n 或外发消息。
        </p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="seedInquiry">生成本地留资样例</el-button>
        <el-button type="success" @click="go('/admin/local-leads')">进入 Lead Review</el-button>
        <el-button @click="clearSeed">清除本页样例</el-button>
      </div>
    </header>

    <el-alert
      class="app-alert"
      type="warning"
      :closable="false"
      show-icon
      title="演示安全边界：不读取 .env；不创建真实付款；不调用 webhook / n8n；不发送邮件、短信、WhatsApp；不部署线上环境。"
    />

    <section class="status-grid app-section">
      <article v-for="item in statusCards" :key="item.label" class="status-card app-data-card">
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
        <p>{{ item.note }}</p>
      </article>
    </section>

    <section class="app-section app-data-card demo-flow-card">
      <div class="section-heading">
        <div>
          <p class="app-eyebrow">Recommended walkthrough</p>
          <h2>10 分钟验收路径</h2>
        </div>
        <span class="app-status-badge">local only</span>
      </div>

      <div class="flow-steps">
        <article v-for="step in walkthrough" :key="step.id" class="flow-step">
          <span class="step-number">{{ step.id }}</span>
          <div>
            <h3>{{ step.title }}</h3>
            <p>{{ step.description }}</p>
            <div class="step-actions">
              <el-button
                v-for="action in step.actions"
                :key="action.path"
                :type="action.primary ? 'primary' : 'default'"
                @click="go(action.path)"
              >
                {{ action.label }}
              </el-button>
            </div>
          </div>
        </article>
      </div>
    </section>

    <section class="app-section route-grid">
      <article v-for="group in routeGroups" :key="group.title" class="route-group app-data-card">
        <div class="route-group-header">
          <div>
            <h2>{{ group.title }}</h2>
            <p>{{ group.description }}</p>
          </div>
          <span class="app-status-badge" :class="group.badgeClass">{{ group.status }}</span>
        </div>
        <div class="route-list">
          <button
            v-for="route in group.routes"
            :key="route.path"
            class="route-item"
            type="button"
            @click="go(route.path)"
          >
            <span>
              <strong>{{ route.label }}</strong>
              <small>{{ route.note }}</small>
            </span>
            <em>{{ route.path }}</em>
          </button>
        </div>
      </article>
    </section>

    <section class="app-section app-data-card review-panel">
      <div class="section-heading">
        <div>
          <p class="app-eyebrow">Current build readout</p>
          <h2>真实状态复核</h2>
        </div>
      </div>
      <div class="review-grid">
        <div>
          <h3>已完成链路</h3>
          <ul>
            <li>首页入口到主题、场地、报价和留资的本地演示链路已存在。</li>
            <li>Legacy 报价页可本地保存方案和咨询记录。</li>
            <li>V1 Quote 草稿页存在，但需要登录，后端接线仍受限。</li>
            <li>供应商申请、状态页、公开供应商展示和后台供应商审核入口已存在。</li>
          </ul>
        </div>
        <div>
          <h3>仍是骨架或受限</h3>
          <ul>
            <li>真实订单跟进中心仍偏只读，留资到运营处理主要靠 localStorage demo。</li>
            <li>目标仓库当前没有 /admin/dashboard 和 /admin/orders 可演示页面。</li>
            <li>支付入口保持 test / guard 状态，本轮没有启用真实付款。</li>
            <li>合同、素材库、外部通知、n8n、Google Sheet/Drive 等仍应保持阻断。</li>
            <li>供应商资料审核已有页面，但与真实经营数据和自动外联尚未闭环。</li>
          </ul>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()
const seedKey = 'partyonce_local_demo_hub_seed'

const go = (path) => {
  router.push(path)
}

const statusCards = computed(() => [
  {
    label: 'Frontend',
    value: '可演示',
    note: '首页、主题、报价、供应商展示均已有入口。'
  },
  {
    label: 'Quote / Lead',
    value: '本地闭环',
    note: '可用 localStorage 演示报价到留资。'
  },
  {
    label: 'Supplier',
    value: '轻后台',
    note: '申请、状态、公开库、审核入口已存在。'
  },
  {
    label: 'External',
    value: '已阻断',
    note: '付款、webhook、外发消息本页均不触发。'
  }
])

const walkthrough = [
  {
    id: '01',
    title: '看第一屏和用户选择入口',
    description: '从视觉入口进入，让验收人确认 PartyOnce 的首屏和两个主要 CTA 是否清楚。',
    actions: [
      { label: '打开首页', path: '/', primary: true },
      { label: '主题入口', path: '/themes' },
      { label: '场地列表', path: '/venues' }
    ]
  },
  {
    id: '02',
    title: '走报价与留资',
    description: '使用 legacy 本地报价页验证选择、加购、保存方案和本地咨询记录。',
    actions: [
      { label: '打开报价预览', path: '/quote?theme=forest&scene=clearing&package=standard', primary: true },
      { label: '我的咨询记录', path: '/my/inquiries' },
      { label: 'Lead Review', path: '/admin/local-leads' }
    ]
  },
  {
    id: '03',
    title: '看供应商资料和审核入口',
    description: '验证供应商展示、客户选择、申请状态和后台审核的轻量管理体验。',
    actions: [
      { label: '供应商展示', path: '/suppliers', primary: true },
      { label: '供应商申请', path: '/partner/apply' },
      { label: '申请状态', path: '/partner/status' }
    ]
  },
  {
    id: '04',
    title: '看后台与运营跟进入口',
    description: 'Lead Review 是本地免登录演示；供应商审核等真实后台入口仍需要 admin 账号。',
    actions: [
      { label: 'Lead Review', path: '/admin/local-leads', primary: true },
      { label: '后台供应商', path: '/admin/partners' }
    ]
  }
]

const routeGroups = [
  {
    title: '前台展示',
    description: '第一屏、主题、场地、模板和 AI 引导入口。',
    status: 'customer-facing',
    routes: [
      { label: 'Public Home', path: '/', note: '当前默认首页' },
      { label: 'Themes & Packages', path: '/themes', note: '主题展示入口' },
      { label: 'Venues', path: '/venues', note: '场地列表' },
      { label: 'Templates', path: '/templates', note: '概念模板库' }
    ]
  },
  {
    title: '报价 / 留资 / 跟进',
    description: '本地可验证的报价保存、咨询记录和 V1 Quote 草稿。',
    status: 'local demo',
    badgeClass: 'app-status-badge--success',
    routes: [
      { label: 'Legacy Quote Preview', path: '/quote?theme=space&scene=command&package=standard', note: 'localStorage only' },
      { label: 'Inquiry Follow-up', path: '/my/inquiries', note: '本地咨询跟进' },
      { label: 'Lead Review Ops', path: '/admin/local-leads', note: '运营跟进中心' },
      { label: 'V1 Quote Draft', path: '/quotation', note: '需登录，后端接线受限' },
      { label: 'My Orders', path: '/orders', note: '登录后查看订单' }
    ]
  },
  {
    title: '供应商资料 / 审核',
    description: '供应商前台展示、资料提交、状态查询和审核演示。',
    status: 'supplier',
    routes: [
      { label: 'Supplier Showcase', path: '/suppliers', note: '公开供应商库' },
      { label: 'Become a Partner', path: '/partner/apply', note: '资料提交' },
      { label: 'Application Status', path: '/partner/status', note: '申请状态查询' },
      { label: 'Partner Dashboard', path: '/partner/dashboard', note: '需登录和 partner 权限' }
    ]
  },
  {
    title: '后台验收',
    description: '本地 Lead Review 可直接演示；正式后台入口受权限保护，目标仓库暂未提供 admin dashboard / admin orders 页面。',
    status: 'protected',
    badgeClass: 'app-status-badge--warning',
    routes: [
      { label: 'Local Lead Review', path: '/admin/local-leads', note: 'localStorage only' },
      { label: 'Admin Partners', path: '/admin/partners', note: '供应商审核' },
      { label: 'Admin Suppliers', path: '/admin/suppliers', note: '供应商管理' }
    ]
  }
]

const readInquirySubmissions = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem('inquirySubmissions') || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    return []
  }
}

const seedInquiry = () => {
  const existing = readInquirySubmissions()
  const existingSeed = existing.find((item) => item.demoSeedId === seedKey)
  if (existingSeed) {
    ElMessage.info('本地留资样例已存在')
    router.push('/my/inquiries')
    return
  }

  const seed = {
    demoSeedId: seedKey,
    customerInfo: {
      name: 'Local Demo Parent',
      contact: 'demo-parent@example.test',
      preferredDate: '2026-06-20',
      notes: '本地验收样例：森林主题，30 位小朋友，需要报价后人工跟进。'
    },
    selection: {
      themeId: 'forest',
      themeName: '奇幻森林',
      sceneId: 'clearing',
      sceneName: '林间空地',
      packageId: 'standard',
      packageName: '标准体验包',
      addons: [
        { id: 'cake', name: '定制主题蛋糕', price: 150 },
        { id: 'photo', name: '专业摄影服务', price: 300 }
      ]
    },
    pricing: {
      packagePrice: 1089,
      sceneFee: 220,
      addonsTotal: 450,
      finalTotal: 1759
    },
    submitTime: new Date().toISOString(),
    status: 'pending'
  }

  localStorage.setItem('inquirySubmissions', JSON.stringify([seed, ...existing]))
  ElMessage.success('已生成本地留资样例，未外发')
  router.push('/my/inquiries')
}

const clearSeed = () => {
  const existing = readInquirySubmissions()
  const next = existing.filter((item) => item.demoSeedId !== seedKey)
  localStorage.setItem('inquirySubmissions', JSON.stringify(next))
  ElMessage.success('已清除本页生成的本地样例')
}
</script>

<style scoped>
.local-demo-page {
  color: var(--text-primary);
}

.demo-header {
  align-items: flex-start;
}

.header-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.status-card {
  padding: 18px;
}

.status-card span {
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 700;
}

.status-card strong {
  display: block;
  margin-top: 8px;
  font-size: 24px;
}

.status-card p,
.route-group p,
.flow-step p {
  margin: 8px 0 0;
  color: var(--text-secondary);
  line-height: 1.6;
}

.demo-flow-card,
.review-panel,
.route-group {
  padding: 22px;
}

.section-heading,
.route-group-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.section-heading h2,
.route-group-header h2 {
  margin: 0;
  font-size: 22px;
}

.flow-steps {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-top: 18px;
}

.flow-step {
  display: grid;
  grid-template-columns: 52px 1fr;
  gap: 14px;
  padding: 16px;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-base);
  background: #fffdf9;
}

.step-number {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 999px;
  background: var(--primary-50);
  color: var(--primary-700);
  font-weight: 800;
}

.flow-step h3 {
  margin: 0;
  font-size: 17px;
}

.step-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}

.route-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.route-list {
  display: grid;
  gap: 10px;
  margin-top: 16px;
}

.route-item {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
  padding: 13px 14px;
  text-align: left;
  background: #fff;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-base);
  cursor: pointer;
}

.route-item:hover {
  border-color: var(--primary-200);
  background: var(--primary-50);
}

.route-item span {
  display: grid;
  gap: 4px;
}

.route-item small {
  color: var(--text-secondary);
}

.route-item em {
  flex: 0 0 auto;
  color: var(--primary-700);
  font-style: normal;
  font-family: var(--font-family-mono);
  font-size: 12px;
}

.review-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  margin-top: 14px;
}

.review-grid h3 {
  margin: 0 0 10px;
}

.review-grid ul {
  display: grid;
  gap: 8px;
  margin: 0;
  padding-left: 20px;
  color: var(--text-secondary);
  line-height: 1.6;
}

@media (max-width: 900px) {
  .status-grid,
  .flow-steps,
  .route-grid,
  .review-grid {
    grid-template-columns: 1fr;
  }

  .demo-header,
  .section-heading,
  .route-group-header {
    flex-direction: column;
  }

  .header-actions {
    justify-content: flex-start;
  }

  .route-item {
    flex-direction: column;
  }
}
</style>
