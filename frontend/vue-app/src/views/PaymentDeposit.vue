<template>
  <main class="payment-readiness-page">
    <header class="page-hero">
      <div>
        <p class="eyebrow">{{ copy.kicker }}</p>
        <h1>{{ copy.title }}</h1>
        <p>{{ copy.subtitle }}</p>
      </div>
      <el-tag :type="readiness.ready ? 'success' : 'warning'" effect="plain" size="large">
        {{ readiness.ready ? copy.ready : copy.blocked }}
      </el-tag>
    </header>

    <el-alert
      class="scope-alert"
      type="warning"
      :closable="false"
      show-icon
      :title="copy.alertTitle"
    />

    <section class="parent-trust-panel">
      <div>
        <p class="eyebrow">{{ copy.parentBoundaryKicker }}</p>
        <h2>{{ copy.parentBoundaryTitle }}</h2>
        <p>{{ copy.parentBoundaryBody }}</p>
      </div>
      <ul>
        <li v-for="item in trustChecklist" :key="item">{{ item }}</li>
      </ul>
    </section>

    <section class="process-panel">
      <p class="eyebrow">{{ copy.processKicker }}</p>
      <h2>{{ copy.processTitle }}</h2>
      <div class="process-grid">
        <article v-for="(step, index) in quoteProcessSteps" :key="step.id">
          <span>{{ index + 1 }}</span>
          <strong>{{ step.title }}</strong>
          <small>{{ step.body }}</small>
        </article>
      </div>
    </section>

    <section class="content-grid">
      <article class="panel">
        <h2>{{ copy.orderSnapshot }}</h2>
        <dl class="detail-list">
          <div><dt>{{ copy.orderNumber }}</dt><dd>{{ snapshot.order.order_number }}</dd></div>
          <div><dt>{{ copy.eventType }}</dt><dd>{{ snapshot.order.event_type }}</dd></div>
          <div><dt>{{ copy.eventDate }}</dt><dd>{{ snapshot.order.event_date || '-' }}</dd></div>
          <div><dt>{{ copy.venue }}</dt><dd>{{ snapshot.order.venue_name }}</dd></div>
          <div><dt>{{ copy.depositPlaceholder }}</dt><dd>{{ formatMoney(snapshot.order.deposit_amount, snapshot.order.currency) }}</dd></div>
        </dl>
      </article>

      <article class="panel">
        <h2>{{ copy.checksTitle }}</h2>
        <ul class="check-list">
          <li :class="{ ok: readiness.testModeEnabled }">
            <span>{{ readiness.testModeEnabled ? copy.ok : copy.wait }}</span>
            <p>{{ copy.testModeFlag }}</p>
          </li>
          <li :class="{ ok: readiness.hasTestPublishableKey }">
            <span>{{ readiness.hasTestPublishableKey ? copy.ok : copy.wait }}</span>
            <p>{{ copy.testKey }}</p>
          </li>
          <li :class="{ ok: !readiness.hasLivePublishableKey }">
            <span>{{ !readiness.hasLivePublishableKey ? copy.ok : copy.block }}</span>
            <p>{{ copy.noLiveKey }}</p>
          </li>
        </ul>
        <p class="key-line">{{ copy.configuredKey }}: {{ readiness.publishableKeyMasked || copy.notConfigured }}</p>
      </article>
    </section>

    <section class="panel">
      <h2>{{ copy.blockersTitle }}</h2>
      <el-empty v-if="readiness.blockers.length === 0" :description="copy.noBlockers" />
      <ul v-else class="blocker-list">
        <li v-for="blocker in readiness.blockers" :key="blocker">{{ blocker }}</li>
      </ul>
    </section>

    <section class="panel">
      <h2>{{ copy.nextStepTitle }}</h2>
      <p>{{ boundaryText }}</p>
      <div class="actions">
        <el-button type="primary" :disabled="!readiness.ready" @click="prepareTestMode">
          {{ copy.prepareTestCard }}
        </el-button>
        <el-button @click="router.push('/my/orders')">{{ copy.backOrders }}</el-button>
        <el-button @click="router.push('/payment/cancelled')">{{ copy.cancelledState }}</el-button>
      </div>
      <div v-if="stripeMounted" class="test-card-shell">
        <p>{{ copy.cardMounted }}</p>
        <div ref="cardMountRef" class="card-mount"></div>
        <el-button disabled>{{ copy.confirmDisabled }}</el-button>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  buildPaymentReadinessSnapshot,
  getPaymentReadiness,
  savePaymentReadinessSnapshot
} from '@/services/paymentReadinessService'

const route = useRoute()
const router = useRouter()
const { locale } = useI18n()
const readiness = ref(getPaymentReadiness())
const cardMountRef = ref(null)
const stripeMounted = ref(false)
const trustChecklist = computed(() => copy.value.trustChecklist)
const quoteProcessSteps = computed(() => copy.value.quoteProcessSteps)
const snapshot = ref(buildPaymentReadinessSnapshot({
  order_number: route.query.order_number,
  amount: route.query.amount,
  event_date: route.query.event_date,
  venue_name: route.query.venue_name
}))

const formatMoney = (amount, currency = 'AUD') => {
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency }).format(Number(amount || 0))
}

const canMountStripe = computed(() => readiness.value.ready && !stripeMounted.value)

const copyByLocale = {
  zh: {
    kicker: '支付准备',
    title: '测试模式订金准备',
    subtitle: '这是本地 / staging 的支付准备门禁。当前预览不会启用订金扣款，也不会触发真实支付。',
    ready: '测试模式已准备',
    blocked: '已阻止',
    alertTitle: '仅做准备检查：不触发真实支付、webhook/n8n 或外发消息。',
    parentBoundaryKicker: '家长支付安全边界',
    parentBoundaryTitle: '当前预览不会扣卡',
    parentBoundaryBody: '家庭应先收到人工复核报价，确认场地和供应商档期后，才进入单独批准的订金步骤。',
    processKicker: '报价到订金流程',
    processTitle: '未来订金前必须经过四步',
    orderSnapshot: '订单快照',
    orderNumber: '订单编号',
    eventType: '活动类型',
    eventDate: '活动日期',
    venue: '场地',
    depositPlaceholder: '订金占位',
    checksTitle: '测试模式支付检查',
    ok: '通过',
    wait: '待定',
    block: '阻止',
    testModeFlag: '测试模式标记已启用',
    testKey: 'Publishable key 为 pk_test_*',
    noLiveKey: '未检测到 live key',
    configuredKey: '当前配置 key',
    notConfigured: '未配置',
    blockersTitle: '阻断项',
    noBlockers: '无本地准备阻断项',
    nextStepTitle: '测试模式下一步',
    prepareTestCard: '准备测试卡输入框',
    backOrders: '返回我的订单',
    cancelledState: '查看取消状态',
    cardMounted: '测试卡输入框已挂载。支付确认仍被禁用，直到单独批准的后端测试支付端点存在。',
    confirmDisabled: '确认测试支付 · 后端未启用',
    stripeError: '无法用测试 publishable key 初始化测试支付字段。',
    stripeMounted: '测试卡输入框已挂载。支付确认仍处于阻止状态。',
    boundaryFallback: '仅支付准备检查：当前预览不启用订金支付，也不会触发真实支付、webhook、n8n、外发消息或生产支付。',
    trustChecklist: [
      '正式报价前必须人工复核',
      '提交报价需求不会即时扣款',
      '策划师会复核场地规则、最低消费、供应商档期和执行细节',
      '订金准备只应在正式报价被接受后出现'
    ],
    quoteProcessSteps: [
      { id: 'prefill', title: '预填需求', body: '客户先提交主题、人数、日期、场地和预算方向。' },
      { id: 'review', title: '人工复核', body: '团队复核场地、供应商、餐饮、过敏和文化需求。' },
      { id: 'quote', title: '正式报价', body: '复核后才给客户可确认的正式报价。' },
      { id: 'deposit', title: '订金准备', body: '只有客户接受报价后，才进入单独批准的订金步骤。' }
    ]
  },
  en: {
    kicker: 'Payment readiness',
    title: 'Test-Mode Payment Preparation',
    subtitle: 'Local/staging readiness gate. Deposit payment is not enabled in this preview and no real payment will be triggered.',
    ready: 'test-mode ready',
    blocked: 'blocked',
    alertTitle: 'Readiness only: no live payment, no webhook/n8n, and no outbound message.',
    parentBoundaryKicker: 'Parent-safe payment boundary',
    parentBoundaryTitle: 'No card charge happens in this preview',
    parentBoundaryBody: 'This page is a staging readiness check only. Families should first receive a human-reviewed quote, confirm venue and supplier availability, then move to a separate approved deposit step.',
    processKicker: 'Quote-to-deposit path',
    processTitle: 'Four steps before any future deposit',
    orderSnapshot: 'Order Snapshot',
    orderNumber: 'Order number',
    eventType: 'Event type',
    eventDate: 'Event date',
    venue: 'Venue',
    depositPlaceholder: 'Deposit placeholder',
    checksTitle: 'Test-Mode Payment Checks',
    ok: 'OK',
    wait: 'WAIT',
    block: 'BLOCK',
    testModeFlag: 'Test mode flag enabled',
    testKey: 'Publishable key is `pk_test_*`',
    noLiveKey: 'No live key detected',
    configuredKey: 'Configured key',
    notConfigured: 'not configured',
    blockersTitle: 'Blockers',
    noBlockers: 'No local readiness blockers',
    nextStepTitle: 'Test-Mode Next Step',
    prepareTestCard: 'Prepare test card field',
    backOrders: 'Back to My Orders',
    cancelledState: 'Open Cancelled State',
    cardMounted: 'Test card field mounted. Payment confirmation remains disabled until a separate approved backend test-payment endpoint exists.',
    confirmDisabled: 'Confirm test payment · backend not enabled',
    stripeError: 'Test payment field could not be initialized with the test publishable key.',
    stripeMounted: 'Test card field mounted. Payment confirmation is still blocked.',
    boundaryFallback: 'Payment readiness check only: deposit payment is not enabled in this preview, and no real payment, webhook, n8n, outbound message, or production payment is triggered.',
    trustChecklist: [
      'Human review before formal quote',
      'No instant payment from quote request',
      'A human planner checks venue rules, minimum spend, supplier availability and execution details before a formal quote.',
      'Deposit readiness appears only after approval'
    ],
    quoteProcessSteps: [
      { id: 'prefill', title: 'Prefill request', body: 'Customer submits theme, guests, date, venue, and budget direction.' },
      { id: 'review', title: 'Human review', body: 'Team checks venue, suppliers, food, allergy, and cultural requirements.' },
      { id: 'quote', title: 'Formal quote', body: 'Customer receives a confirmable quote only after review.' },
      { id: 'deposit', title: 'Deposit readiness', body: 'Deposit is prepared only after the quote is accepted.' }
    ]
  },
  ko: {
    kicker: '결제 준비',
    title: '테스트 모드 결제 준비',
    subtitle: '로컬 / staging 준비 화면입니다. 이 미리보기에서는 보증금 결제가 켜지지 않으며 실제 결제가 발생하지 않습니다.',
    ready: '테스트 모드 준비됨',
    blocked: '차단됨',
    alertTitle: '준비 확인 전용: 실제 결제, webhook/n8n, 외부 메시지를 실행하지 않습니다.',
    parentBoundaryKicker: '부모 안심 결제 경계',
    parentBoundaryTitle: '이 미리보기에서는 카드 청구가 없습니다',
    parentBoundaryBody: '가족은 먼저 사람이 검토한 견적을 받고 장소와 공급업체 가능 여부를 확인한 뒤 별도 승인된 보증금 단계로 이동합니다.',
    processKicker: '견적에서 보증금까지',
    processTitle: '향후 보증금 전 네 단계',
    orderSnapshot: '주문 스냅샷',
    orderNumber: '주문 번호',
    eventType: '행사 유형',
    eventDate: '행사 날짜',
    venue: '장소',
    depositPlaceholder: '보증금 placeholder',
    checksTitle: '테스트 모드 결제 확인',
    ok: '통과',
    wait: '대기',
    block: '차단',
    testModeFlag: '테스트 모드 플래그 활성화',
    testKey: 'Publishable key가 pk_test_* 형식',
    noLiveKey: 'live key 감지 없음',
    configuredKey: '설정된 key',
    notConfigured: '미설정',
    blockersTitle: '차단 항목',
    noBlockers: '로컬 준비 차단 항목 없음',
    nextStepTitle: '테스트 모드 다음 단계',
    prepareTestCard: '테스트 카드 입력 준비',
    backOrders: '내 주문으로 돌아가기',
    cancelledState: '취소 상태 열기',
    cardMounted: '테스트 카드 입력이 표시되었습니다. 별도 승인된 백엔드 테스트 결제 endpoint가 생길 때까지 결제 확인은 비활성화됩니다.',
    confirmDisabled: '테스트 결제 확인 · 백엔드 비활성',
    stripeError: '테스트 publishable key로 테스트 결제 필드를 초기화할 수 없습니다.',
    stripeMounted: '테스트 카드 입력이 표시되었습니다. 결제 확인은 계속 차단됩니다.',
    boundaryFallback: '결제 준비 확인 전용: 이 미리보기에서는 보증금 결제가 켜지지 않으며 실제 결제, webhook, n8n, 외부 메시지 또는 production 결제를 실행하지 않습니다.',
    trustChecklist: [
      '공식 견적 전 사람 검토',
      '견적 요청만으로 즉시 결제 없음',
      '플래너가 장소 규칙, 최소 소비, 공급업체 가능 여부와 실행 세부 사항을 확인합니다.',
      '보증금 준비는 승인 후에만 표시됩니다'
    ],
    quoteProcessSteps: [
      { id: 'prefill', title: '요청 사전 입력', body: '고객이 테마, 인원, 날짜, 장소, 예산 방향을 제출합니다.' },
      { id: 'review', title: '사람 검토', body: '팀이 장소, 공급업체, 음식, 알레르기, 문화 요구를 확인합니다.' },
      { id: 'quote', title: '공식 견적', body: '검토 후 고객이 확인할 수 있는 견적을 받습니다.' },
      { id: 'deposit', title: '보증금 준비', body: '견적 수락 후에만 보증금 단계가 준비됩니다.' }
    ]
  },
  ar: {
    kicker: 'جاهزية الدفع',
    title: 'إعداد دفع وضع الاختبار',
    subtitle: 'بوابة جاهزية محلية / staging. دفع العربون غير مفعّل في هذه المعاينة ولن يتم تشغيل دفع حقيقي.',
    ready: 'وضع الاختبار جاهز',
    blocked: 'محظور',
    alertTitle: 'فحص جاهزية فقط: لا دفع حقيقي ولا webhook/n8n ولا رسالة خارجية.',
    parentBoundaryKicker: 'حدود دفع آمنة للعائلة',
    parentBoundaryTitle: 'لا يتم خصم أي بطاقة في هذه المعاينة',
    parentBoundaryBody: 'يجب أن تستلم العائلة عرض سعر تمت مراجعته بشرياً، ثم تأكيد القاعة والموردين قبل الانتقال إلى خطوة عربون منفصلة ومعتمدة.',
    processKicker: 'من عرض السعر إلى العربون',
    processTitle: 'أربع خطوات قبل أي عربون مستقبلي',
    orderSnapshot: 'ملخص الطلب',
    orderNumber: 'رقم الطلب',
    eventType: 'نوع المناسبة',
    eventDate: 'تاريخ المناسبة',
    venue: 'القاعة',
    depositPlaceholder: 'عربون placeholder',
    checksTitle: 'فحوص دفع وضع الاختبار',
    ok: 'تم',
    wait: 'انتظار',
    block: 'حظر',
    testModeFlag: 'تم تفعيل وضع الاختبار',
    testKey: 'مفتاح النشر بصيغة pk_test_*',
    noLiveKey: 'لم يتم اكتشاف live key',
    configuredKey: 'المفتاح الحالي',
    notConfigured: 'غير مهيأ',
    blockersTitle: 'العوائق',
    noBlockers: 'لا توجد عوائق جاهزية محلية',
    nextStepTitle: 'الخطوة التالية في وضع الاختبار',
    prepareTestCard: 'تجهيز حقل بطاقة اختبار',
    backOrders: 'العودة إلى طلباتي',
    cancelledState: 'فتح حالة الإلغاء',
    cardMounted: 'تم عرض حقل بطاقة الاختبار. تأكيد الدفع يبقى معطلاً حتى يوجد endpoint خلفي منفصل ومعتمد.',
    confirmDisabled: 'تأكيد دفع اختباري · الخلفية غير مفعّلة',
    stripeError: 'تعذر تهيئة حقل دفع الاختبار بمفتاح النشر التجريبي.',
    stripeMounted: 'تم عرض حقل بطاقة الاختبار. تأكيد الدفع لا يزال محظوراً.',
    boundaryFallback: 'فحص جاهزية دفع فقط: دفع العربون غير مفعّل في هذه المعاينة ولا يتم تشغيل دفع حقيقي أو webhook أو n8n أو رسالة خارجية أو دفع production.',
    trustChecklist: [
      'مراجعة بشرية قبل عرض السعر الرسمي',
      'لا دفع فوري من طلب عرض السعر',
      'يراجع المخطط قواعد القاعة، الحد الأدنى للصرف، توفر الموردين وتفاصيل التنفيذ قبل عرض السعر الرسمي.',
      'تجهيز العربون يظهر فقط بعد الموافقة'
    ],
    quoteProcessSteps: [
      { id: 'prefill', title: 'تعبئة الطلب', body: 'يرسل العميل الثيم والضيوف والتاريخ والقاعة واتجاه الميزانية.' },
      { id: 'review', title: 'مراجعة بشرية', body: 'يفحص الفريق القاعة والموردين والطعام والحساسية والمتطلبات الثقافية.' },
      { id: 'quote', title: 'عرض سعر رسمي', body: 'يتلقى العميل عرضاً قابلاً للتأكيد بعد المراجعة فقط.' },
      { id: 'deposit', title: 'جاهزية العربون', body: 'يتم تجهيز العربون فقط بعد قبول عرض السعر.' }
    ]
  }
}

const copy = computed(() => copyByLocale[locale.value] || copyByLocale.zh)
const boundaryText = computed(() => {
  const raw = readiness.value.boundary || ''
  return locale.value === 'en' ? raw || copy.value.boundaryFallback : copy.value.boundaryFallback
})

const prepareTestMode = async () => {
  if (!canMountStripe.value) return
  const { loadStripe } = await import('@stripe/stripe-js')
  const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  if (!stripe) {
    ElMessage.error(copy.value.stripeError)
    return
  }
  const elements = stripe.elements()
  const card = elements.create('card', { hidePostalCode: true })
  card.mount(cardMountRef.value)
  stripeMounted.value = true
  ElMessage.success(copy.value.stripeMounted)
}

onMounted(() => {
  readiness.value = getPaymentReadiness()
  snapshot.value = buildPaymentReadinessSnapshot(snapshot.value.order)
  savePaymentReadinessSnapshot(snapshot.value)
})
</script>

<style scoped>
.payment-readiness-page {
  max-width: 1120px;
  margin: 0 auto;
  padding: 96px 24px 56px;
}

.page-hero {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: flex-start;
  margin-bottom: 18px;
}

.eyebrow {
  margin: 0 0 8px;
  color: #64748b;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
}

h1,
h2 {
  margin: 0 0 8px;
  color: #0f172a;
}

.page-hero p,
.panel p,
dt {
  color: #64748b;
}

.scope-alert,
.parent-trust-panel,
.content-grid,
.panel {
  margin-bottom: 18px;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.panel {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  padding: 18px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
}

.parent-trust-panel {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(260px, 0.9fr);
  gap: 16px;
  border: 1px solid #fde68a;
  border-radius: 8px;
  background: linear-gradient(135deg, #fff7ed, #fffbeb);
  padding: 18px;
}

.parent-trust-panel ul {
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.process-panel {
  border: 1px solid #dbeafe;
  border-radius: 8px;
  background: linear-gradient(135deg, #eff6ff, #f8fafc);
  margin-bottom: 18px;
  padding: 18px;
}

.process-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.process-grid article {
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  background: #fff;
  padding: 14px;
}

.process-grid span {
  display: inline-grid;
  width: 28px;
  height: 28px;
  place-items: center;
  border-radius: 999px;
  background: #2563eb;
  color: #fff;
  font-weight: 900;
}

.process-grid strong,
.process-grid small {
  display: block;
  margin-top: 8px;
}

.process-grid small {
  color: #64748b;
  line-height: 1.5;
}

.parent-trust-panel li {
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.76);
  color: #92400e;
  padding: 10px 12px;
  font-weight: 650;
}

.detail-list {
  display: grid;
  gap: 12px;
  margin: 0;
}

dd {
  margin: 4px 0 0;
  color: #0f172a;
  font-weight: 650;
}

.check-list,
.blocker-list {
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.check-list li {
  display: flex;
  gap: 10px;
  align-items: center;
  border-radius: 8px;
  background: #fff7ed;
  padding: 10px;
}

.check-list li.ok {
  background: #f0fdf4;
}

.check-list span {
  min-width: 52px;
  border-radius: 999px;
  background: #fed7aa;
  color: #9a3412;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 700;
  text-align: center;
}

.check-list li.ok span {
  background: #bbf7d0;
  color: #166534;
}

.check-list p {
  margin: 0;
}

.key-line {
  margin: 12px 0 0;
  font-family: monospace;
}

.blocker-list li {
  border-radius: 8px;
  background: #fef2f2;
  color: #991b1b;
  padding: 10px 12px;
}

.actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 12px;
}

.test-card-shell {
  margin-top: 16px;
  border-radius: 8px;
  background: #f8fafc;
  padding: 14px;
}

.card-mount {
  margin: 12px 0;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #fff;
  padding: 14px;
}

@media (max-width: 720px) {
  .page-hero {
    display: block;
  }

  .parent-trust-panel {
    grid-template-columns: 1fr;
  }

  .process-grid {
    grid-template-columns: 1fr;
  }
}
</style>
