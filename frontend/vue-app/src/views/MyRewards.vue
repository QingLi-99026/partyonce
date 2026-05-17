<template>
  <main class="rewards-page">
    <header class="page-hero">
      <div>
        <p class="eyebrow">{{ copy.kicker }}</p>
        <h1>{{ copy.title }}</h1>
        <p>{{ copy.subtitle }}</p>
      </div>
      <div class="hero-actions">
        <el-button @click="router.push('/my/orders')">{{ copy.openOrders }}</el-button>
        <el-button type="primary" @click="router.push('/share')">{{ copy.openShare }}</el-button>
      </div>
    </header>

    <el-alert
      class="scope-alert"
      type="warning"
      :closable="false"
      show-icon
      :title="copy.alertTitle"
      :description="copy.alertDescription"
    />

    <section class="reward-process panel">
      <h2>{{ copy.processTitle }}</h2>
      <div class="reward-process-grid">
        <article v-for="(step, index) in copy.processSteps" :key="step.title">
          <span>{{ index + 1 }}</span>
          <strong>{{ step.title }}</strong>
          <p>{{ step.body }}</p>
        </article>
      </div>
    </section>

    <section class="panel fixed-rewards-panel">
      <h2>{{ copy.optionsTitle }}</h2>
      <p class="panel-intro">{{ copy.optionsIntro }}</p>
      <div class="fixed-reward-grid">
        <article v-for="offer in localizedRewardOffers" :key="offer.id">
          <span>{{ offer.shortTitle }}</span>
          <strong>{{ offer.title }}</strong>
          <p>{{ offer.customerText }}</p>
          <small>{{ offer.trigger }}</small>
        </article>
      </div>
    </section>

    <section class="summary-grid">
      <article class="summary-card">
        <span>{{ copy.approvedCredit }}</span>
        <strong>{{ summary.approvedPoints }}</strong>
      </article>
      <article class="summary-card">
        <span>{{ copy.pendingCredit }}</span>
        <strong>{{ summary.pendingPoints }}</strong>
      </article>
      <article class="summary-card">
        <span>{{ copy.submissions }}</span>
        <strong>{{ summary.submissions.length }}</strong>
      </article>
      <article class="summary-card">
        <span>{{ copy.voucherPlaceholders }}</span>
        <strong>{{ summary.availableVouchers.length }} {{ copy.available }}</strong>
      </article>
    </section>

    <section class="content-grid">
      <article class="panel">
        <h2>{{ copy.choosePlatformTitle }}</h2>
        <p class="panel-intro">{{ copy.choosePlatformIntro }}</p>

        <label>
          {{ copy.platform }}
          <el-select v-model="form.platform" @change="syncTemplateText">
            <el-option v-for="platform in socialSharePlatforms" :key="platform.id" :label="platform.label" :value="platform.id" />
          </el-select>
        </label>

        <label>
          {{ copy.captionTemplate }}
          <el-select v-model="form.copy_template_id" @change="syncTemplateText">
            <el-option v-for="template in shareCopyTemplates" :key="template.id" :label="template.label" :value="template.id" />
          </el-select>
        </label>

        <label>
          {{ copy.shareCaption }}
          <el-input v-model="form.share_text" type="textarea" :rows="5" maxlength="700" show-word-limit />
        </label>

        <div class="button-row">
          <el-button type="primary" @click="copyShareText">{{ copy.copyCaption }}</el-button>
          <el-button @click="openPlatform">{{ copy.openPlatform }}</el-button>
        </div>
        <p class="platform-note">{{ currentPlatform.instruction }}</p>
        <el-alert
          v-if="copyFallback"
          class="manual-copy"
          type="info"
          :closable="false"
          :title="copy.clipboardFallback"
        />
      </article>

      <article class="panel">
        <h2>{{ copy.submitProofTitle }}</h2>
        <p class="panel-intro">{{ copy.submitProofIntro }}</p>

        <label>
          {{ copy.proofType }}
          <el-select v-model="form.proof_type">
            <el-option :label="copy.postUrl" value="post_url" />
            <el-option :label="copy.screenshotNote" value="screenshot_note" />
            <el-option :label="copy.privateShareNote" value="private_share_note" />
          </el-select>
        </label>

        <label>
          {{ copy.postUrl }}
          <el-input v-model="form.proof_url" :placeholder="copy.postUrlPlaceholder" />
        </label>

        <label>
          {{ copy.proofNote }}
          <el-input v-model="form.proof_note" type="textarea" :rows="4" maxlength="500" show-word-limit :placeholder="copy.proofNotePlaceholder" />
        </label>

        <div class="checks">
          <el-checkbox v-model="form.permission_to_reuse">{{ copy.permissionReuse }}</el-checkbox>
          <el-checkbox v-model="form.includes_partyonce_tag">{{ copy.mentionsBrand }}</el-checkbox>
          <el-checkbox v-model="form.includes_venue_or_theme">{{ copy.mentionsVenueTheme }}</el-checkbox>
        </div>

        <el-button type="primary" @click="submitShare">{{ copy.submitReview }}</el-button>
      </article>
    </section>

    <section class="panel">
      <h2>{{ copy.rulesTitle }}</h2>
      <p class="panel-intro">{{ copy.rulesIntro }}</p>
      <ul class="rules-list">
        <li v-for="rule in localizedRules" :key="rule.id">
          <strong>{{ rule.label }} · {{ rule.points }} {{ copy.points }}</strong>
          <span>{{ rule.customerText }}</span>
        </li>
      </ul>
    </section>

    <section class="panel">
      <h2>{{ copy.statusTitle }}</h2>
      <el-table :data="summary.submissions" :empty-text="copy.emptySubmissions">
        <el-table-column :label="copy.platform" width="150">
          <template #default="{ row }">{{ platformLabel(row.platform || row.channel) }}</template>
        </el-table-column>
        <el-table-column :label="copy.proof" min-width="260">
          <template #default="{ row }">
            <strong>{{ row.proof_url || row.post_url || row.proof_type }}</strong>
            <small>{{ row.proof_note || row.caption || row.share_text }}</small>
          </template>
        </el-table-column>
        <el-table-column :label="copy.status" width="150">
          <template #default="{ row }">
            <el-tag :type="statusType(row.review_status || row.status)">{{ row.review_status || row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="copy.reward" min-width="210">
          <template #default="{ row }">
            <strong>{{ row.points_awarded || row.points_pending }} {{ statusLabel(row.status) }} {{ copy.points }}</strong>
            <small v-if="row.voucher_placeholder_id">{{ voucherTitle(row.voucher_placeholder_id) }} · {{ row.voucher_status }}</small>
          </template>
        </el-table-column>
        <el-table-column :label="copy.reviewResult" min-width="260">
          <template #default="{ row }">
            <span>{{ row.review_reason || row.review_note }}</span>
          </template>
        </el-table-column>
      </el-table>
    </section>

    <section class="panel">
      <h2>{{ copy.voucherTitle }}</h2>
      <div class="voucher-grid">
        <article v-for="voucher in localizedVouchers" :key="voucher.id" class="voucher-card" :class="{ active: summary.availableVouchers.some((item) => item.id === voucher.id) }">
          <span>{{ voucher.value }}</span>
          <strong>{{ voucher.title }}</strong>
          <p>{{ voucher.pointsRequired }} {{ copy.pointsRequired }}</p>
          <small>{{ voucher.terms }}</small>
        </article>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  buildShareTemplateText,
  createRewardSubmission,
  getRewardSummary,
  seedRewardDemoIfEmpty,
  shareCopyTemplates,
  socialSharePlatforms
} from '@/services/socialRewardsService'

const router = useRouter()
const { locale } = useI18n()
const customerId = 'customer-local-41'
const refreshToken = ref(0)
const copyFallback = ref(false)

const form = reactive({
  platform: 'instagram',
  copy_template_id: 'venue_theme_story',
  share_text: '',
  proof_type: 'post_url',
  proof_url: '',
  proof_note: '',
  permission_to_reuse: true,
  includes_partyonce_tag: true,
  includes_venue_or_theme: true
})

const demoOrder = {
  theme: 'Castle Princess',
  event_location: 'Marrickville Family Dining Room'
}

const summary = computed(() => {
  refreshToken.value
  return getRewardSummary(customerId)
})

const currentPlatform = computed(() => socialSharePlatforms.find((item) => item.id === form.platform) || socialSharePlatforms[0])

const copyByLocale = {
  zh: {
    kicker: '分享返券 · 本地 / staging',
    title: '派对后分享，提交审核领取奖励',
    subtitle: '简单清楚的家长奖励流程：用自己的社交账号分享派对，提交链接或截图说明，由团队人工审核固定优惠券或免费升级占位。我们不收集社交账号密码，也不会外发消息。',
    openOrders: '查看我的订单',
    openShare: '打开分享页',
    alertTitle: '仅 staging：奖励只是优惠券 / 升级占位，正式政策批准前不可真实兑换。',
    alertDescription: '不会触发真实优惠券、支付折扣、webhook、n8n、邮件、短信、WhatsApp 或社交平台 API。',
    processTitle: '奖励如何运作',
    processSteps: [
      { title: '用自己的账号分享', body: '发布派对照片、短视频或私下推荐，可使用 TikTok、Instagram、小红书、Facebook 或私人渠道。' },
      { title: '朋友提交报价，或你提交证明', body: 'staging 中只收集帖子链接或截图说明。未来生产版本可连接到朋友提交报价的转介绍流程。' },
      { title: '团队审核并发放占位奖励', body: '审核通过后可解锁 $30 优惠券、免费气球升级或免费拍照角升级占位。' }
    ],
    optionsTitle: '简单奖励选项',
    optionsIntro: '家长不需要理解复杂积分。对外承诺保持简单：提交真实分享证明，等待人工审核，然后获得固定优惠券或免费升级占位。',
    approvedCredit: '已批准积分',
    pendingCredit: '待审核积分',
    submissions: '提交记录',
    voucherPlaceholders: '优惠券占位',
    available: '可用',
    choosePlatformTitle: '1. 选择平台并复制文案',
    choosePlatformIntro: '从你自己的账号发布。如果平台不支持网页直接上传，请复制文案后手动打开 App。',
    platform: '平台',
    captionTemplate: '文案模板',
    shareCaption: '分享文案 / 自由输入',
    copyCaption: '复制文案',
    openPlatform: '打开平台',
    clipboardFallback: '剪贴板不可用，请从上方文本框手动复制文案。',
    submitProofTitle: '2. 提交证明等待审核',
    submitProofIntro: '发布后粘贴公开帖子链接，或描述截图/证明。当前预览不上传文件，截图证据只作为文字说明记录。',
    proofType: '证明类型',
    postUrl: '帖子链接',
    screenshotNote: '截图文件名 / 说明',
    privateShareNote: '私下分享说明',
    postUrlPlaceholder: 'https://example.com/your-party-post',
    proofNote: '截图 / 证明说明',
    proofNotePlaceholder: '例如：截图文件名、发布时间、平台账号可见，或私下分享说明。',
    permissionReuse: '允许 Party Event 在 staging / 投资人演示中复用这份内容',
    mentionsBrand: '帖子提到 Party Event',
    mentionsVenueTheme: '帖子提到主题或场地',
    submitReview: '提交审核',
    rulesTitle: '奖励规则',
    rulesIntro: '生产规则应保持简单，不给家长复杂积分层级。当前积分只用于 staging 管理审核，对客奖励应是固定优惠券或免费升级。',
    points: '分',
    statusTitle: '提交状态',
    emptySubmissions: '暂无分享提交',
    proof: '证明',
    status: '状态',
    reward: '奖励',
    reviewResult: '审核结果',
    voucherTitle: '优惠券占位',
    pointsRequired: '分可用',
    approved: '已批准',
    pending: '待审核',
    copied: '文案已复制。请从你自己的社交账号发布。',
    copyUnavailable: '剪贴板不可用，请手动复制。',
    addCaption: '请先添加或复制文案。',
    addProof: '请添加帖子链接或证明说明。',
    submitted: '分享证明已提交本地 / staging 审核。未发送外部消息。',
    offers: {
      'offer-30-voucher': { shortTitle: '$30 优惠券', title: '$30 派对优惠券', customerText: '人工审核后，可作为未来派对的简单固定优惠。', trigger: '分享证明审核通过，或未来朋友提交报价。' },
      'offer-balloon-upgrade': { shortTitle: '气球升级', title: '免费气球升级', customerText: '在未来报价中，把小型气球点升级为更强的视觉效果。', trigger: '带有清楚派对布置的照片/视频分享审核通过。' },
      'offer-photo-corner': { shortTitle: '拍照角升级', title: '免费拍照角升级', customerText: '人工批准后增加简单拍照角升级占位。', trigger: '分享中提到主题或场地并审核通过。' }
    },
    rules: {
      ugc_share_submission: { label: '分享提交', customerText: '从自己的账号分享，然后提交帖子链接或截图说明等待审核。' },
      ugc_approved: { label: '审核通过的分享', customerText: '审核通过可在此预览中解锁固定优惠券或免费升级占位。' },
      venue_tag_bonus: { label: '场地 / 主题提及奖励', customerText: '帖子清楚提到主题、场地或 Party Event 时可加分。' },
      referral_placeholder: { label: '转介绍占位', customerText: '未来版本：朋友提交报价后，双方可获得固定奖励。' }
    },
    vouchers: {
      'voucher-500-20': { title: '$30 派对升级优惠券', terms: '仅 staging 占位。不可真实兑换，不连接支付，也不会外发。' },
      'voucher-balloon-upgrade': { title: '免费气球升级占位', terms: '未来生产奖励可把小气球点升级为更强视觉点。' },
      'voucher-photo-corner': { title: '免费拍照角升级占位', terms: '需要未来生产批准和供应商确认。' }
    }
  },
  en: {
    kicker: 'Social Sharing Rewards · local/staging',
    title: 'Share after party and claim reward',
    subtitle: 'A simple customer-friendly reward loop: share the party from your own social account, submit proof, and let the team review a fixed voucher or free upgrade placeholder. We never collect social passwords and no outbound message is sent.',
    openOrders: 'Open My Orders',
    openShare: 'Open /share',
    alertTitle: 'Staging only: rewards are voucher / upgrade placeholders until production policy is approved.',
    alertDescription: 'No real coupon, payment discount, webhook, n8n, email, SMS, WhatsApp, or social platform API is triggered.',
    processTitle: 'How the reward works',
    processSteps: [
      { title: 'Share with your own account', body: 'Post a party photo, short video, or private recommendation. Use your own TikTok, Instagram, Xiaohongshu, Facebook, or private channel.' },
      { title: 'Friend submits a quote or you submit proof', body: 'In staging, we collect a post link or screenshot note. Future production can connect this to referral quote submissions.' },
      { title: 'Team reviews and issues a placeholder reward', body: 'Approval can unlock a $30 voucher, free balloon upgrade, or free photo-corner upgrade placeholder.' }
    ],
    optionsTitle: 'Simple reward options',
    optionsIntro: 'Parents should not need to understand a complex points ladder. The visible customer promise stays simple: submit a real share proof, wait for manual review, then receive one fixed voucher or free upgrade placeholder.',
    approvedCredit: 'Approved review credit',
    pendingCredit: 'Pending review credit',
    submissions: 'Submissions',
    voucherPlaceholders: 'Voucher placeholders',
    available: 'available',
    choosePlatformTitle: '1. Choose a platform and copy a caption',
    choosePlatformIntro: 'Publish from your own account. If a platform does not support direct web upload, copy the caption and open the app manually.',
    platform: 'Platform',
    captionTemplate: 'Caption template',
    shareCaption: 'Share caption / free text',
    copyCaption: 'Copy caption',
    openPlatform: 'Open platform',
    clipboardFallback: 'Clipboard was not available. Please copy the caption manually from the text box above.',
    submitProofTitle: '2. Submit proof for review',
    submitProofIntro: 'After posting, paste a public post link or describe the screenshot/proof. File upload is mocked in this preview, so screenshot evidence is captured as a note.',
    proofType: 'Proof type',
    postUrl: 'Post URL',
    screenshotNote: 'Screenshot filename / note',
    privateShareNote: 'Private share note',
    postUrlPlaceholder: 'https://example.com/your-party-post',
    proofNote: 'Screenshot / proof note',
    proofNotePlaceholder: 'Example: uploaded screenshot filename, post time, platform handle visible, or private share explanation.',
    permissionReuse: 'Party Event may reuse this content in staging/investor demo',
    mentionsBrand: 'Post mentions Party Event',
    mentionsVenueTheme: 'Post mentions theme or venue',
    submitReview: 'Submit for review',
    rulesTitle: 'Reward rules',
    rulesIntro: 'Keep production rules simple: no complicated point tiers for parents. The current point display is a staging accounting layer for admin review only; customer-facing rewards should be fixed vouchers or free upgrades.',
    points: 'pts',
    statusTitle: 'Submission status',
    emptySubmissions: 'No share submissions yet',
    proof: 'Proof',
    status: 'Status',
    reward: 'Reward',
    reviewResult: 'Review result',
    voucherTitle: 'Voucher placeholders',
    pointsRequired: 'points required',
    approved: 'approved',
    pending: 'pending',
    copied: 'Caption copied. Publish from your own social account.',
    copyUnavailable: 'Clipboard unavailable. Please copy the caption manually.',
    addCaption: 'Add or copy a caption before submitting.',
    addProof: 'Add a post URL or proof note for review.',
    submitted: 'Share proof submitted for local/staging review. No external message was sent.',
    offers: {},
    rules: {},
    vouchers: {}
  }
}
copyByLocale.ko = {
  ...copyByLocale.en,
  kicker: '공유 리워드 · 로컬 / staging',
  title: '파티 후 공유하고 리워드 신청',
  subtitle: '가족에게 이해하기 쉬운 리워드 흐름입니다. 본인 소셜 계정으로 파티를 공유하고 증빙을 제출하면 팀이 고정 쿠폰 또는 무료 업그레이드 placeholder를 수동 검토합니다. 소셜 비밀번호를 수집하지 않고 외부 메시지를 보내지 않습니다.',
  openOrders: '내 주문 열기',
  openShare: '공유 페이지 열기',
  alertTitle: 'staging 전용: 리워드는 운영 정책 승인 전까지 쿠폰 / 업그레이드 placeholder입니다.',
  alertDescription: '실제 쿠폰, 결제 할인, webhook, n8n, 이메일, SMS, WhatsApp 또는 소셜 플랫폼 API를 실행하지 않습니다.',
  processTitle: '리워드 작동 방식',
  processSteps: [
    { title: '본인 계정으로 공유', body: '파티 사진, 짧은 영상 또는 개인 추천을 올립니다. TikTok, Instagram, Xiaohongshu, Facebook 또는 개인 채널을 사용할 수 있습니다.' },
    { title: '친구가 견적을 제출하거나 증빙 제출', body: 'staging에서는 게시물 링크나 스크린샷 메모만 수집합니다. 향후 운영 버전은 친구 견적 제출과 연결할 수 있습니다.' },
    { title: '팀이 검토 후 placeholder 리워드 발급', body: '승인되면 $30 쿠폰, 무료 풍선 업그레이드 또는 무료 포토 코너 업그레이드 placeholder를 열 수 있습니다.' }
  ],
  optionsTitle: '간단한 리워드 옵션',
  optionsIntro: '부모가 복잡한 포인트 구조를 이해할 필요는 없습니다. 고객 약속은 간단하게 유지합니다: 실제 공유 증빙 제출, 수동 검토 대기, 고정 쿠폰 또는 무료 업그레이드 placeholder 수령.',
  approvedCredit: '승인된 검토 포인트',
  pendingCredit: '대기 중인 검토 포인트',
  submissions: '제출',
  voucherPlaceholders: '쿠폰 placeholder',
  available: '사용 가능',
  choosePlatformTitle: '1. 플랫폼 선택 및 문구 복사',
  choosePlatformIntro: '본인 계정에서 게시합니다. 플랫폼이 웹 업로드를 지원하지 않으면 문구를 복사한 뒤 앱을 직접 여세요.',
  platform: '플랫폼',
  captionTemplate: '문구 템플릿',
  shareCaption: '공유 문구 / 자유 입력',
  copyCaption: '문구 복사',
  openPlatform: '플랫폼 열기',
  clipboardFallback: '클립보드를 사용할 수 없습니다. 위 텍스트 상자에서 문구를 직접 복사하세요.',
  submitProofTitle: '2. 검토용 증빙 제출',
  submitProofIntro: '게시 후 공개 게시물 링크를 붙여넣거나 스크린샷/증빙을 설명하세요. 이 미리보기에서는 파일 업로드를 모킹하므로 스크린샷 증빙은 메모로 저장됩니다.',
  proofType: '증빙 유형',
  postUrl: '게시물 URL',
  screenshotNote: '스크린샷 파일명 / 메모',
  privateShareNote: '개인 공유 메모',
  proofNote: '스크린샷 / 증빙 메모',
  permissionReuse: 'Party Event가 이 콘텐츠를 staging / 투자자 데모에서 재사용할 수 있음',
  mentionsBrand: '게시물이 Party Event를 언급함',
  mentionsVenueTheme: '게시물이 테마 또는 장소를 언급함',
  submitReview: '검토 제출',
  rulesTitle: '리워드 규칙',
  rulesIntro: '운영 규칙은 단순해야 합니다. 현재 포인트는 staging 관리 검토용 회계 레이어이며, 고객-facing 리워드는 고정 쿠폰 또는 무료 업그레이드여야 합니다.',
  points: '점',
  statusTitle: '제출 상태',
  emptySubmissions: '아직 공유 제출이 없습니다',
  proof: '증빙',
  status: '상태',
  reward: '리워드',
  reviewResult: '검토 결과',
  voucherTitle: '쿠폰 placeholder',
  pointsRequired: '점 필요',
  approved: '승인됨',
  pending: '대기 중',
  copied: '문구가 복사되었습니다. 본인 소셜 계정에서 게시하세요.',
  copyUnavailable: '클립보드를 사용할 수 없습니다. 문구를 직접 복사하세요.',
  addCaption: '제출 전에 문구를 추가하거나 복사하세요.',
  addProof: '검토할 게시물 URL 또는 증빙 메모를 추가하세요.',
  submitted: '공유 증빙이 로컬 / staging 검토로 제출되었습니다. 외부 메시지는 발송되지 않았습니다.',
  offers: {
    'offer-30-voucher': { shortTitle: '$30 쿠폰', title: '$30 파티 쿠폰', customerText: '수동 검토 후 향후 파티 할인으로 사용할 수 있는 단순 고정 혜택입니다.', trigger: '공유 증빙 승인 또는 향후 친구 견적 제출.' },
    'offer-balloon-upgrade': { shortTitle: '풍선 업그레이드', title: '무료 풍선 업그레이드', customerText: '향후 견적에서 작은 풍선 장식을 더 강한 비주얼 포인트로 업그레이드합니다.', trigger: '파티 세팅이 보이는 사진/영상 공유 승인.' },
    'offer-photo-corner': { shortTitle: '포토 코너 업그레이드', title: '무료 포토 코너 업그레이드', customerText: '수동 승인 후 간단한 포토 코너 업그레이드 placeholder를 추가합니다.', trigger: '테마 또는 장소를 언급한 공유 승인.' }
  },
  rules: {
    ugc_share_submission: { label: '공유 제출', customerText: '본인 계정에서 공유한 뒤 게시물 링크나 스크린샷 메모를 제출해 검토를 받습니다.' },
    ugc_approved: { label: '승인된 공유', customerText: '승인되면 이 미리보기에서 고정 쿠폰 또는 무료 업그레이드 placeholder가 열릴 수 있습니다.' },
    venue_tag_bonus: { label: '장소 / 테마 언급 보너스', customerText: '게시물이 테마, 장소 또는 Party Event를 명확히 언급하면 보너스를 받을 수 있습니다.' },
    referral_placeholder: { label: '추천 placeholder', customerText: '향후 버전: 친구가 견적을 제출하면 양쪽 모두 고정 리워드를 받을 수 있습니다.' }
  },
  vouchers: {
    'voucher-500-20': { title: '$30 파티 업그레이드 쿠폰', terms: 'staging placeholder 전용. 실제 사용 불가, 결제 연결 없음, 외부 발송 없음.' },
    'voucher-balloon-upgrade': { title: '무료 풍선 업그레이드 placeholder', terms: '향후 운영 리워드는 작은 풍선 포인트를 더 강한 비주얼 포인트로 올릴 수 있습니다.' },
    'voucher-photo-corner': { title: '무료 포토 코너 업그레이드 placeholder', terms: '향후 운영 승인과 공급업체 확인이 필요합니다.' }
  }
}
copyByLocale.ar = {
  ...copyByLocale.en,
  kicker: 'مكافآت المشاركة · محلي / staging',
  title: 'شارك بعد الحفل واطلب المكافأة',
  subtitle: 'مسار مكافأة بسيط للعائلات: شارك الحفل من حسابك الاجتماعي، أرسل الدليل، ثم يراجع الفريق قسيمة ثابتة أو ترقية مجانية placeholder. لا نجمع كلمات مرور اجتماعية ولا نرسل رسائل خارجية.',
  openOrders: 'فتح طلباتي',
  openShare: 'فتح صفحة المشاركة',
  alertTitle: 'staging فقط: المكافآت هي قسائم / ترقيات placeholder حتى اعتماد سياسة الإنتاج.',
  alertDescription: 'لا يتم تشغيل قسيمة حقيقية أو خصم دفع أو webhook أو n8n أو بريد أو SMS أو WhatsApp أو API منصة اجتماعية.',
  processTitle: 'كيف تعمل المكافأة',
  processSteps: [
    { title: 'شارك من حسابك', body: 'انشر صورة حفلة أو فيديو قصير أو توصية خاصة عبر TikTok أو Instagram أو Xiaohongshu أو Facebook أو قناة خاصة.' },
    { title: 'يرسل صديق عرض سعر أو ترسل أنت الدليل', body: 'في staging نجمع رابط المنشور أو ملاحظة لقطة شاشة فقط. يمكن للإنتاج مستقبلاً ربط ذلك بطلبات عروض أسعار الإحالة.' },
    { title: 'يراجع الفريق ويصدر مكافأة placeholder', body: 'الموافقة قد تفتح قسيمة $30 أو ترقية بالونات مجانية أو ترقية ركن تصوير مجانية placeholder.' }
  ],
  optionsTitle: 'خيارات مكافأة بسيطة',
  optionsIntro: 'لا يجب أن يفهم الآباء سلماً معقداً للنقاط. يبقى الوعد بسيطاً: أرسل دليل مشاركة حقيقي، انتظر المراجعة، ثم احصل على قسيمة ثابتة أو ترقية مجانية placeholder.',
  approvedCredit: 'رصيد مراجعة معتمد',
  pendingCredit: 'رصيد مراجعة قيد الانتظار',
  submissions: 'الإرسالات',
  voucherPlaceholders: 'قسائم placeholder',
  available: 'متاح',
  choosePlatformTitle: '1. اختر منصة وانسخ النص',
  choosePlatformIntro: 'انشر من حسابك. إذا لم تدعم المنصة الرفع عبر الويب، انسخ النص وافتح التطبيق يدوياً.',
  platform: 'المنصة',
  captionTemplate: 'قالب النص',
  shareCaption: 'نص المشاركة / إدخال حر',
  copyCaption: 'نسخ النص',
  openPlatform: 'فتح المنصة',
  clipboardFallback: 'الحافظة غير متاحة. يرجى نسخ النص يدوياً من مربع النص أعلاه.',
  submitProofTitle: '2. أرسل الدليل للمراجعة',
  submitProofIntro: 'بعد النشر، الصق رابط منشور عام أو صف لقطة الشاشة/الدليل. رفع الملفات mocked في هذه المعاينة، لذلك يحفظ دليل لقطة الشاشة كملاحظة.',
  proofType: 'نوع الدليل',
  postUrl: 'رابط المنشور',
  screenshotNote: 'اسم لقطة الشاشة / ملاحظة',
  privateShareNote: 'ملاحظة مشاركة خاصة',
  proofNote: 'لقطة شاشة / ملاحظة دليل',
  permissionReuse: 'يمكن لـ Party Event إعادة استخدام هذا المحتوى في staging / عرض المستثمر',
  mentionsBrand: 'المنشور يذكر Party Event',
  mentionsVenueTheme: 'المنشور يذكر الثيم أو القاعة',
  submitReview: 'إرسال للمراجعة',
  rulesTitle: 'قواعد المكافأة',
  rulesIntro: 'يجب أن تبقى قواعد الإنتاج بسيطة. عرض النقاط الحالي طبقة مراجعة إدارية في staging فقط؛ مكافآت العملاء يجب أن تكون قسائم ثابتة أو ترقيات مجانية.',
  points: 'نقطة',
  statusTitle: 'حالة الإرسال',
  emptySubmissions: 'لا توجد مشاركات بعد',
  proof: 'الدليل',
  status: 'الحالة',
  reward: 'المكافأة',
  reviewResult: 'نتيجة المراجعة',
  voucherTitle: 'قسائم placeholder',
  pointsRequired: 'نقطة مطلوبة',
  approved: 'معتمد',
  pending: 'قيد الانتظار',
  copied: 'تم نسخ النص. انشر من حسابك الاجتماعي.',
  copyUnavailable: 'الحافظة غير متاحة. يرجى نسخ النص يدوياً.',
  addCaption: 'أضف أو انسخ نصاً قبل الإرسال.',
  addProof: 'أضف رابط منشور أو ملاحظة دليل للمراجعة.',
  submitted: 'تم إرسال دليل المشاركة للمراجعة المحلية / staging. لم يتم إرسال رسالة خارجية.',
  offers: {
    'offer-30-voucher': { shortTitle: 'قسيمة $30', title: 'قسيمة حفلة $30', customerText: 'خصم ثابت بسيط لحفلة مستقبلية بعد المراجعة اليدوية.', trigger: 'اعتماد دليل المشاركة أو إرسال صديق عرض سعر مستقبلاً.' },
    'offer-balloon-upgrade': { shortTitle: 'ترقية بالونات', title: 'ترقية بالونات مجانية', customerText: 'ترقية نقطة بالونات صغيرة إلى لحظة بصرية أقوى في عرض سعر مستقبلي.', trigger: 'اعتماد صورة/فيديو يظهر تجهيز الحفل.' },
    'offer-photo-corner': { shortTitle: 'ترقية ركن تصوير', title: 'ترقية ركن تصوير مجانية', customerText: 'إضافة ترقية ركن تصوير بسيطة placeholder بعد موافقة يدوية.', trigger: 'اعتماد مشاركة تذكر الثيم أو القاعة.' }
  },
  rules: {
    ugc_share_submission: { label: 'إرسال مشاركة', customerText: 'شارك من حسابك ثم أرسل رابط المنشور أو ملاحظة لقطة شاشة للمراجعة.' },
    ugc_approved: { label: 'مشاركة معتمدة', customerText: 'قد تفتح الموافقة قسيمة ثابتة أو ترقية مجانية placeholder في هذه المعاينة.' },
    venue_tag_bonus: { label: 'مكافأة ذكر القاعة / الثيم', customerText: 'مكافأة عندما يذكر المنشور الثيم أو القاعة أو Party Event بوضوح.' },
    referral_placeholder: { label: 'إحالة placeholder', customerText: 'نسخة مستقبلية: عندما يرسل صديق عرض سعر، يمكن للطرفين الحصول على مكافأة ثابتة.' }
  },
  vouchers: {
    'voucher-500-20': { title: 'قسيمة ترقية حفلة $30', terms: 'placeholder في staging فقط. غير قابلة للاسترداد، لا تتصل بالدفع، ولا ترسل خارجياً.' },
    'voucher-balloon-upgrade': { title: 'ترقية بالونات مجانية placeholder', terms: 'يمكن لمكافأة إنتاج مستقبلية ترقية مجموعة بالونات صغيرة إلى لحظة بصرية أقوى.' },
    'voucher-photo-corner': { title: 'ترقية ركن تصوير مجانية placeholder', terms: 'تحتاج موافقة إنتاج مستقبلية وتأكيد المورد.' }
  }
}

const copy = computed(() => copyByLocale[locale.value] || copyByLocale.zh)

const localizedRewardOffers = computed(() => summary.value.fixedRewardOffers.map((offer) => ({
  ...offer,
  ...(copy.value.offers?.[offer.id] || {})
})))

const localizedRules = computed(() => summary.value.rewardPointRules.map((rule) => ({
  ...rule,
  ...(copy.value.rules?.[rule.id] || {})
})))

const localizedVouchers = computed(() => summary.value.voucherPlaceholders.map((voucher) => ({
  ...voucher,
  ...(copy.value.vouchers?.[voucher.id] || {})
})))

const syncTemplateText = () => {
  form.share_text = buildShareTemplateText(form.copy_template_id, demoOrder)
}

const platformLabel = (id) => socialSharePlatforms.find((item) => item.id === id)?.label || id
const voucherTitle = (id) => localizedVouchers.value.find((item) => item.id === id)?.title || id
const statusType = (status) => status === 'approved' ? 'success' : status === 'rejected' ? 'danger' : 'warning'
const statusLabel = (status) => status === 'approved' ? copy.value.approved : copy.value.pending

const copyShareText = async () => {
  copyFallback.value = false
  try {
    await navigator.clipboard.writeText(form.share_text)
    ElMessage.success(copy.value.copied)
  } catch (error) {
    copyFallback.value = true
    ElMessage.info(copy.value.copyUnavailable)
  }
}

const openPlatform = () => {
  if (!currentPlatform.value.openUrl) {
    ElMessage.info(currentPlatform.value.instruction)
    return
  }
  window.open(currentPlatform.value.openUrl, '_blank', 'noopener')
}

const submitShare = () => {
  if (!form.share_text.trim()) {
    ElMessage.warning(copy.value.addCaption)
    return
  }
  if (!form.proof_url.trim() && !form.proof_note.trim()) {
    ElMessage.warning(copy.value.addProof)
    return
  }
  createRewardSubmission({
    ...form,
    channel: form.platform,
    caption: form.share_text,
    post_url: form.proof_url,
    customer_id: customerId,
    customer_name: 'Local Demo Customer',
    order_id: 'order-local-1001',
    order_number: 'PO-LOCAL-1001'
  })
  form.proof_url = ''
  form.proof_note = ''
  refreshToken.value += 1
  ElMessage.success(copy.value.submitted)
}

onMounted(() => {
  seedRewardDemoIfEmpty()
  syncTemplateText()
  refreshToken.value += 1
})
</script>

<style scoped>
.rewards-page {
  max-width: 1180px;
  margin: 0 auto;
  padding: 96px 24px 56px;
}

.page-hero {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: flex-start;
}

.hero-actions,
.button-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.eyebrow {
  margin: 0 0 8px;
  color: #7c3aed;
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
}

h1,
h2 {
  margin: 0 0 10px;
  color: #0f172a;
}

.page-hero p,
.panel-intro,
.rules-list span,
.voucher-card small,
.platform-note,
:deep(.el-table small) {
  display: block;
  color: #64748b;
  line-height: 1.6;
}

.scope-alert,
.summary-grid,
.content-grid,
.panel,
.manual-copy {
  margin-top: 18px;
}

.summary-grid,
.content-grid,
.voucher-grid,
.fixed-reward-grid {
  display: grid;
  gap: 16px;
}

.summary-grid {
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

.reward-process {
  background:
    linear-gradient(135deg, rgba(255, 247, 237, 0.96), rgba(239, 246, 255, 0.96)),
    #fff;
}

.reward-process-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.reward-process-grid article {
  display: grid;
  gap: 8px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #fff;
  padding: 16px;
}

.reward-process-grid span {
  display: inline-grid;
  width: 30px;
  height: 30px;
  place-items: center;
  border-radius: 999px;
  background: #2563eb;
  color: #fff;
  font-weight: 900;
}

.reward-process-grid strong {
  color: #0f172a;
}

.reward-process-grid p {
  margin: 0;
  color: #64748b;
  line-height: 1.55;
}

.content-grid {
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
}

.voucher-grid {
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.fixed-reward-grid {
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
}

.summary-card,
.panel,
.voucher-card,
.fixed-reward-grid article {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  padding: 18px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
}

.summary-card span,
.voucher-card span,
.fixed-reward-grid span {
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
}

.fixed-rewards-panel {
  border-color: #facc15;
  background:
    linear-gradient(135deg, rgba(255, 251, 235, 0.92), rgba(255, 255, 255, 0.98)),
    #fff;
}

.fixed-reward-grid article {
  display: grid;
  gap: 8px;
  box-shadow: none;
}

.fixed-reward-grid strong {
  color: #0f172a;
  font-size: 18px;
}

.fixed-reward-grid p,
.fixed-reward-grid small {
  margin: 0;
  color: #64748b;
  line-height: 1.55;
}

.summary-card strong {
  display: block;
  margin-top: 6px;
  font-size: 26px;
}

label,
.rules-list,
.checks {
  display: grid;
  gap: 10px;
  margin-bottom: 14px;
  font-weight: 700;
}

.rules-list {
  padding: 0;
  list-style: none;
}

.rules-list li {
  display: grid;
  gap: 5px;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.voucher-card.active {
  border-color: #22c55e;
  background: #f0fdf4;
}

@media (max-width: 820px) {
  .page-hero {
    display: block;
  }

  .hero-actions {
    margin-top: 14px;
  }
}
</style>
