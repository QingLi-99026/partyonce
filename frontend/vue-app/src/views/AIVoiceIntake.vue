<template>
  <main class="ai-intake-page">
    <section class="intake-hero">
      <div class="hero-copy">
        <p class="eyebrow">{{ $t('ai.eyebrow') }}</p>
        <h1>{{ $t('ai.title') }}</h1>
        <p>
          {{ $t('ai.intro') }}
        </p>
        <div class="hero-actions">
          <button class="primary-action" @click="useQuickDemo">{{ $t('ai.quickDemo') }}</button>
          <button class="secondary-action" @click="quickDemoToQuote">{{ $t('ai.sampleToQuote') }}</button>
          <button class="primary-action" @click="speak(activePrompt)">{{ $t('ai.listen') }}</button>
          <button class="secondary-action" @click="toggleVoice">
            {{ voiceEnabled ? $t('ai.soundOff') : $t('ai.soundOn') }}
          </button>
          <button class="secondary-action" @click="resetFlow">{{ $t('ai.restart') }}</button>
        </div>
      </div>

      <div class="ai-guide-card">
        <div class="bot-avatar">AI</div>
        <strong>Party Event AI Concierge</strong>
        <span>{{ conciergeMessage }}</span>
        <small>{{ $t('ai.safetyNote') }}</small>
      </div>
    </section>

    <section class="concierge-chat-panel" :dir="isArabicLocale ? 'rtl' : 'ltr'">
      <div class="chat-copy">
        <p class="eyebrow">{{ $t('ai.interaction.eyebrow') }}</p>
        <h2>{{ $t('ai.interaction.title') }}</h2>
        <p>{{ $t('ai.interaction.copy') }}</p>
      </div>

      <div class="starter-prompts" aria-label="AI Concierge starter prompts">
        <button
          v-for="prompt in localizedStarterPrompts"
          :key="prompt"
          type="button"
          @click="useStarterPrompt(prompt)"
        >
          {{ prompt }}
        </button>
      </div>

      <div class="speech-input-card" :class="{ listening: speechState === 'listening' }">
        <div>
          <p class="eyebrow">{{ $t('ai.speech.eyebrow') }}</p>
          <h3>{{ $t('ai.speech.title') }}</h3>
          <p>{{ speechStatusText }}</p>
        </div>
        <div v-if="lockedThemeName" class="theme-lock-pill">
          {{ $t('ai.speech.themeActive', { theme: lockedThemeName }) }}
        </div>
        <div class="speech-actions">
          <button class="primary-action" type="button" :disabled="!speechSupported || speechState === 'listening'" @click="startSpeechInput">
            {{ $t('ai.speech.start') }}
          </button>
          <button class="secondary-action" type="button" :disabled="speechState !== 'listening'" @click="stopSpeechInput">
            {{ $t('ai.speech.stop') }}
          </button>
          <button class="secondary-action" type="button" @click="retrySpeechInput">
            {{ $t('ai.speech.retry') }}
          </button>
          <button class="secondary-action" type="button" @click="useTextFallback">
            {{ $t('ai.speech.useText') }}
          </button>
        </div>
        <div class="speech-feedback" aria-live="polite">
          <span v-if="speechInterim">{{ $t('ai.speech.hearing') }} {{ speechInterim }}</span>
          <span v-else-if="speechTranscript">{{ $t('ai.speech.heard') }} {{ speechTranscript }}</span>
          <span v-else>{{ speechFallbackMessage }}</span>
        </div>
      </div>

      <div class="chat-input-card">
        <label for="freeTextNeed">{{ $t('ai.interaction.inputLabel') }}</label>
        <textarea
          id="freeTextNeed"
          v-model.trim="freeTextNeed"
          rows="4"
          :placeholder="$t('ai.interaction.placeholder')"
        ></textarea>
        <div class="chat-actions">
          <span>{{ $t('ai.interaction.voicePreview') }}</span>
          <button class="primary-action" type="button" :disabled="!freeTextNeed" @click="analyzeFreeText">
            {{ $t('ai.interaction.analyze') }}
          </button>
          <button class="secondary-action" type="button" @click="clearFreeText">
            {{ $t('ai.interaction.clear') }}
          </button>
        </div>
      </div>

      <div v-if="freeTextAnalysis" class="analysis-result-card">
        <div class="advisor-message">
          <span>AI</span>
          <p>{{ freeTextAnalysis.advisor_message }}</p>
        </div>

        <div class="analysis-grid">
          <article>
            <h3>{{ $t('ai.interaction.recognized') }}</h3>
            <dl>
              <div v-for="item in recognizedFields" :key="item.key">
                <dt>{{ item.label }}</dt>
                <dd>{{ item.value }}</dd>
              </div>
            </dl>
          </article>

          <article>
            <h3>{{ $t('ai.interaction.missing') }}</h3>
            <ul>
              <li v-for="field in freeTextAnalysis.missing_fields" :key="field">
                {{ localizeField(field) }}
              </li>
            </ul>
          </article>

          <article>
            <h3>{{ $t('ai.interaction.recommendation') }}</h3>
            <p><strong>{{ freeTextAnalysis.recommendation.theme }}</strong></p>
            <p>{{ freeTextAnalysis.recommendation.package }} · {{ freeTextAnalysis.recommendation.venue }}</p>
            <small>{{ freeTextAnalysis.recommendation.rationale }}</small>
          </article>
        </div>

        <div class="quote-ready-card">
          <strong>{{ $t('ai.interaction.quoteReady') }}</strong>
          <p>{{ freeTextAnalysis.quote_ready_summary.emotional_summary }}</p>
          <ul>
            <li v-for="question in freeTextAnalysis.quote_ready_summary.next_questions" :key="question">
              {{ question }}
            </li>
          </ul>
        </div>

        <div class="next-actions">
          <button class="primary-action" @click="goQuote">{{ $t('ai.continueQuote') }}</button>
          <button class="secondary-action" @click="goStep(0)">{{ $t('ai.interaction.editAnswers') }}</button>
          <button class="secondary-action" @click="resetFlow">{{ $t('ai.restart') }}</button>
          <button class="secondary-action" @click="goThemes">{{ $t('ai.viewThemes') }}</button>
        </div>
      </div>
    </section>

    <section class="question-panel">
      <aside class="progress-rail">
        <div class="progress-meter">
          <span :style="{ width: `${progressPercent}%` }"></span>
        </div>
        <button
          v-for="(step, index) in localizedIntakeSteps"
          :key="step.id"
          class="progress-step"
          :class="{ active: index === activeIndex, done: hasAnswer(step.id) }"
          @click="goStep(index)"
        >
          <span>{{ index + 1 }}</span>
          {{ step.label }}
        </button>
      </aside>

      <article class="question-card">
        <div class="question-header">
          <span>Step {{ activeIndex + 1 }} / {{ intakeSteps.length }}</span>
          <button :disabled="activeIndex === 0" @click="previousStep">{{ $t('ai.back') }}</button>
        </div>

        <p class="ai-line">{{ activePrompt }}</p>
        <h2>{{ activeStep.prompt }}</h2>
        <p class="question-helper">{{ activeStep.helper }}</p>

        <div v-if="activeStep.type === 'choice'" class="option-grid">
          <button
            v-for="option in activeStep.options"
            :key="option.value"
            class="option-card"
            :class="{ selected: answers[activeStep.id] === option.value }"
            @click="chooseOption(option)"
          >
            {{ option.label }}
          </button>
        </div>

        <div v-else class="input-card">
          <input
            v-model.trim="draftAnswer"
            :type="activeStep.type === 'date' ? 'date' : 'text'"
            :placeholder="activeStep.placeholder || ''"
            @keyup.enter="commitInput"
          >
          <button class="primary-action" :disabled="!draftAnswer" @click="commitInput">{{ $t('ai.confirmItem') }}</button>
        </div>
      </article>
    </section>

    <section class="theme-preview-band" aria-label="AI theme previews">
      <div class="preview-copy">
        <p class="eyebrow">{{ $t('ai.visualCues') }}</p>
        <h2>{{ $t('ai.compareThemes') }}</h2>
      </div>
      <div class="theme-preview-grid">
        <article v-for="card in themePreviewCards" :key="card.theme" class="theme-preview-card">
          <img v-if="isChineseLocale" :src="card.packageVisual.image_path" :alt="card.packageVisual.title">
          <div v-else class="theme-preview-placeholder">
            <span>{{ themeIcon(card.theme) }}</span>
            <strong>{{ displayThemeName(card.theme) }}</strong>
          </div>
          <div>
            <strong>{{ displayThemeName(card.theme) }}</strong>
            <span>{{ displayPackageCue(card) }}</span>
          </div>
        </article>
      </div>
    </section>

    <section v-if="recommendation" class="recommendation-panel">
      <div class="recommendation-copy">
        <p class="eyebrow">{{ $t('ai.recommendation.title') }}</p>
        <h2>{{ displayRecommendationTheme }} · {{ displayRecommendationTier }}</h2>
        <p>{{ displayRecommendationHeadline }}</p>

        <div class="brief-box">
          <strong>{{ $t('ai.recommendation.customerBrief') }}</strong>
          <p>{{ displayRecommendationBrief }}</p>
        </div>

        <dl>
          <div>
            <dt>{{ $t('ai.recommendation.theme') }}</dt>
            <dd>{{ displayRecommendationTheme }}</dd>
          </div>
          <div>
            <dt>{{ $t('ai.recommendation.package') }}</dt>
            <dd>{{ displayRecommendationTier }} · {{ recommendation.visualContext.packageVisual.priceHint }}</dd>
          </div>
          <div>
            <dt>{{ $t('ai.recommendation.venue') }}</dt>
            <dd>{{ displayRecommendationVenue }}</dd>
          </div>
          <div>
            <dt>{{ $t('ai.recommendation.reason') }}</dt>
            <dd>
              <ul class="compact-list">
                <li v-for="item in displayRecommendationReasons" :key="item">{{ item }}</li>
              </ul>
            </dd>
          </div>
          <div>
            <dt>{{ $t('ai.recommendation.ageGuests') }}</dt>
            <dd>{{ displayRecommendationAgeGuests }}</dd>
          </div>
          <div>
            <dt>{{ $t('ai.recommendation.budget') }}</dt>
            <dd>{{ displayRecommendationBudget }}</dd>
          </div>
          <div>
            <dt>{{ $t('ai.recommendation.includes') }}</dt>
            <dd>
              <ul class="compact-list">
                <li v-for="item in displayRecommendationIncludes" :key="item">{{ item }}</li>
              </ul>
            </dd>
          </div>
          <div>
            <dt>{{ $t('ai.recommendation.priceDrivers') }}</dt>
            <dd>
              <ul class="compact-list">
                <li v-for="item in displayRecommendationPriceDrivers" :key="item">{{ item }}</li>
              </ul>
            </dd>
          </div>
          <div>
            <dt>{{ $t('ai.recommendation.customerFit') }}</dt>
            <dd>{{ displayRecommendationCustomerFit }}</dd>
          </div>
          <div>
            <dt>{{ displayRecommendationUpgradeTitle }}</dt>
            <dd>
              <ul class="compact-list">
                <li v-for="item in displayRecommendationUpgradeItems" :key="item">{{ item }}</li>
              </ul>
            </dd>
          </div>
          <div>
            <dt>{{ $t('ai.recommendation.nextStep') }}</dt>
            <dd>{{ isChineseLocale ? `${recommendation.nextStepSuggestion} 当前为 staging preview，不会创建 Quote / Order，也不会触发 payment。` : $t('ai.recommendation.nextStepBoundary') }}</dd>
          </div>
          <div>
            <dt>party_scene_config</dt>
            <dd>
              <ul class="compact-list">
                <li>Layout: {{ recommendation.sceneConfigSummary.layout }}</li>
                <li>Decor: {{ recommendation.sceneConfigSummary.decor }}</li>
                <li>Venue: {{ recommendation.sceneConfigSummary.venue }}</li>
                <li>Future 3D ready: {{ recommendation.party_scene_config.future3d.engineReady ? 'yes' : 'no' }}</li>
              </ul>
            </dd>
          </div>
        </dl>

        <div class="supplier-strip">
          <span v-for="supplier in recommendation.visualContext.suppliers" :key="supplier.id">
            {{ displaySupplier(supplier) }}
          </span>
        </div>

        <div class="next-actions">
          <button class="primary-action" @click="goQuote">{{ $t('ai.continueQuote') }}</button>
          <button class="secondary-action" @click="goThemes">{{ $t('ai.viewThemes') }}</button>
        </div>
      </div>

      <div class="recommendation-visual">
        <img v-if="isChineseLocale" :src="recommendation.visualContext.restaurant.image_path" :alt="recommendation.visualContext.restaurant.title">
        <div v-else class="recommendation-visual-placeholder">
          <span>🍽️</span>
          <strong>{{ $t('ai.restaurantPlaceholderTitle') }}</strong>
        </div>
        <div class="visual-caption">
          <strong>{{ isChineseLocale ? recommendation.visualContext.restaurant.title : $t('ai.restaurantPlaceholderTitle') }}</strong>
          <span>{{ isChineseLocale ? recommendation.visualContext.restaurant.structureLock : $t('ai.restaurantPlaceholderCopy') }}</span>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import {
  intakeSteps,
  saveIntakeForQuote,
  scoreRecommendation,
  speakText,
  stopSpeaking,
  voiceScripts
} from '@/services/aiVoiceIntakeService';
import {
  analyzeFreeTextIntake,
  localizeFieldLabel,
  mapAnalysisToAnswers,
  starterPromptTemplates
} from '@/services/aiConciergeService';
import {
  createOneShotSpeechRecognizer,
  getBrowserSpeechSupport,
  speechLangForLocale
} from '@/services/browserSpeechService';
import { getVisualContext } from '@/data/visualAssets';

const router = useRouter();
const route = useRoute();
const { t, locale } = useI18n();
const activeIndex = ref(0);
const answers = reactive({});
const draftAnswer = ref('');
const freeTextNeed = ref('');
const freeTextAnalysis = ref(null);
const recommendation = ref(null);
const voiceEnabled = ref(false);
const speechState = ref('idle');
const speechSupported = ref(false);
const speechTranscript = ref('');
const speechInterim = ref('');
const speechError = ref('');
const textFallbackVisible = ref(false);
let activeRecognizer = null;

const quickDemoAnswers = {
  childAge: '6-8',
  eventDate: '2026-06-20',
  guestCount: '16-25',
  budgetRange: 'standard',
  area: 'North Sydney / Chatswood',
  indoorOutdoor: 'indoor',
  themePreference: 'castle',
  venueStatus: 'need_restaurant',
  scenePriorities: 'dessert_backdrop',
  stylingPreference: 'balanced',
  customerName: 'Quick Demo Parent',
  customerContact: 'quick-demo@example.test'
};

const queryThemeMap = {
  castle: 'castle',
  'castle-princess': 'castle',
  space: 'space',
  'space-explorer': 'space',
  forest: 'forest',
  'forest-adventure': 'forest'
};

const answeredCount = computed(() => intakeSteps.filter((step) => hasAnswer(step.id)).length);
const progressPercent = computed(() => Math.round((answeredCount.value / intakeSteps.length) * 100));
const isChineseLocale = computed(() => locale.value === 'zh');
const isArabicLocale = computed(() => locale.value === 'ar');
const activeStep = computed(() => localizedIntakeSteps.value[activeIndex.value]);
const activePrompt = computed(() => activeStep.value?.prompt || voiceScripts.welcome);
const localizedStarterPrompts = computed(() => starterPromptTemplates[locale.value] || starterPromptTemplates.en);
const lockedThemeName = computed(() => {
  const theme = answers.themePreference;
  return theme ? displayThemeName(theme) : '';
});
const speechStatusText = computed(() => {
  if (speechState.value === 'listening') return t('ai.speech.listening');
  if (speechState.value === 'processing') return t('ai.speech.processing');
  if (speechTranscript.value) return t('ai.speech.ready');
  if (!speechSupported.value) return t('ai.speech.unsupported');
  return t('ai.speech.idle');
});
const speechFallbackMessage = computed(() => {
  if (speechError.value) return speechError.value;
  if (textFallbackVisible.value || !speechSupported.value) return t('ai.speech.fallback');
  return t('ai.speech.localOnly');
});
const recognizedFields = computed(() => {
  if (!freeTextAnalysis.value) return [];
  const extracted = freeTextAnalysis.value.extracted || {};
  return Object.entries(extracted)
    .filter(([, value]) => Array.isArray(value) ? value.length : Boolean(value))
    .map(([key, value]) => ({
      key,
      label: localizeField(key),
      value: Array.isArray(value) ? value.join(' / ') : value
    }));
});
const conciergeMessage = computed(() => {
  if (recommendation.value) {
    if (!isChineseLocale.value) {
      return `I recommend ${displayRecommendationTheme.value} ${recommendation.value.tierLabel}, using Restaurant A as the quote sample.`;
    }
    return `我建议先看 ${recommendation.value.themeLabel} ${recommendation.value.tierLabel}，并用 Restaurant A 样板进入 quote request。`;
  }
  return 'I can recommend a theme and package for you, then pre-fill your quote request.';
});
const themePreviewCards = computed(() => ['castle', 'space', 'forest'].map((theme) => ({
  theme,
  ...getVisualContext(theme, 'standard')
})));

const localizedStepCopy = {
  en: {
  childAge: {
    label: 'Child age',
    prompt: 'How old is the birthday child?',
    helper: 'I use age to choose the right theme mood and decor level.',
    options: { '3-5': '3-5 years', '6-8': '6-8 years', '9-10': '9-10 years' }
  },
  eventDate: {
    label: 'Event date',
    prompt: 'Which date are you considering?',
    helper: 'A rough date is fine. A human planner can confirm it later.'
  },
  guestCount: {
    label: 'Guest count',
    prompt: 'How many children and adults may attend?',
    helper: 'Guest count helps estimate whether Restaurant A and the table layout fit.',
    options: { '10-15': '10-15 guests', '16-25': '16-25 guests', '26-40': '26-40 guests' }
  },
  budgetRange: {
    label: 'Budget range',
    prompt: 'Which package level should we plan around first?',
    helper: 'This is only a planning level. It does not trigger payment or PaymentIntent.',
    options: { basic: 'Basic · controlled budget', standard: 'Standard · complete experience', premium: 'Premium · immersive setup' }
  },
  area: {
    label: 'Area',
    prompt: 'Which area should the party be arranged in?',
    helper: 'This helps match venue and supplier coverage.'
  },
  indoorOutdoor: {
    label: 'Indoor / outdoor',
    prompt: 'Do you prefer indoor or outdoor?',
    helper: 'Indoor is more stable. Outdoor works well for forest and nature themes.',
    options: { indoor: 'Indoor preferred', outdoor: 'Outdoor / garden', flexible: 'Flexible, let AI recommend' }
  },
  themePreference: {
    label: 'Theme preference',
    prompt: 'Which theme would attract your child most?',
    helper: 'If you are unsure, choose open recommendation and I will infer from earlier answers.',
    options: { castle: 'Princess / castle / fairytale', space: 'Rocket / space / science', forest: 'Animals / forest / nature', open: 'Not sure, recommend for me' }
  },
  venueStatus: {
    label: 'Venue status',
    prompt: 'Do you already have a venue?',
    helper: 'If not, we can use Restaurant A as a sample for the quote request.',
    options: { has_venue: 'Already have a restaurant or room', need_restaurant: 'Need restaurant recommendations', unsure: 'Not sure yet' }
  },
  scenePriorities: {
    label: 'Scene priority',
    prompt: 'Which visual area should stand out most?',
    helper: 'You can prioritize dessert table, photo corner, or children’s activity area.',
    options: { dessert_backdrop: 'Dessert table + theme backdrop', photo_arch: 'Photo corner + entrance arch', activity_tables: 'Activity zone + table mood', ai_default: 'Let AI recommend' }
  },
  stylingPreference: {
    label: 'Styling preference',
    prompt: 'Do you prefer simple styling or immersive decoration?',
    helper: 'This affects arches, backdrops, lighting, and prop density.',
    options: { simple: 'Simple and calm', balanced: 'Complete theme mood', immersive: 'Immersive photo-ready setup', budget_matched: 'Match automatically to budget' }
  },
  customerName: {
    label: 'Contact name',
    prompt: 'What should we call you?',
    helper: 'Used only for local/staging inquiry prefill. No outbound message is sent.',
    placeholder: 'e.g. Ava / Kevin'
  },
  customerContact: {
    label: 'Contact method',
    prompt: 'Leave a phone, WeChat, or email for later manual confirmation.',
    helper: 'This only writes local/staging lead data. No SMS, email, or WhatsApp is sent.',
    placeholder: 'Phone / WeChat / email'
  }
  },
  ko: {
    childAge: { label: '아이 나이', prompt: '생일 주인공은 몇 살인가요?', helper: '나이에 맞는 테마 분위기와 장식 강도를 고릅니다.', options: { '3-5': '3-5세', '6-8': '6-8세', '9-10': '9-10세' } },
    eventDate: { label: '행사 날짜', prompt: '어느 날짜를 생각하고 있나요?', helper: '대략적인 날짜도 괜찮습니다. 담당자가 나중에 확인할 수 있습니다.' },
    guestCount: { label: '예상 인원', prompt: '아이와 보호자를 포함해 몇 명 정도 참석하나요?', helper: '인원은 Restaurant A와 테이블 배치가 맞는지 판단하는 데 필요합니다.', options: { '10-15': '10-15명', '16-25': '16-25명', '26-40': '26-40명' } },
    budgetRange: { label: '예산 범위', prompt: '어떤 패키지 단계로 먼저 기획할까요?', helper: '기획용 단계일 뿐 결제나 PaymentIntent를 만들지 않습니다.', options: { basic: 'Basic · 예산 중심', standard: 'Standard · 완성형 경험', premium: 'Premium · 몰입형 구성' } },
    area: { label: '지역', prompt: '어느 지역에서 파티를 진행하고 싶나요?', helper: '장소와 공급사 서비스 범위를 맞추는 데 사용합니다.' },
    indoorOutdoor: { label: '실내 / 야외', prompt: '실내와 야외 중 어느 쪽을 선호하나요?', helper: '실내는 안정적이고 야외는 숲/자연 테마에 잘 맞습니다.', options: { indoor: '실내 우선', outdoor: '야외 / 정원', flexible: '상관없음, 추천받기' } },
    themePreference: { label: '테마 선호', prompt: '아이가 어떤 테마에 가장 끌릴까요?', helper: '확실하지 않으면 추천을 선택하세요.', options: { castle: '공주 / 성 / 동화', space: '로켓 / 우주 / 과학', forest: '동물 / 숲 / 자연', open: '아직 모름, 추천받기' } },
    venueStatus: { label: '장소 상태', prompt: '이미 장소가 있나요?', helper: '없어도 Restaurant A 샘플로 견적 요청을 시작할 수 있습니다.', options: { has_venue: '이미 식당/룸이 있음', need_restaurant: '식당 추천 필요', unsure: '아직 모름' } },
    scenePriorities: { label: '장면 우선순위', prompt: '가장 돋보였으면 하는 시각 영역은 무엇인가요?', helper: '디저트 테이블, 포토존, 활동 구역 중 선택할 수 있습니다.', options: { dessert_backdrop: '디저트 테이블 + 테마 배경', photo_arch: '포토존 + 입구 아치', activity_tables: '활동 구역 + 테이블 분위기', ai_default: 'AI 기본 추천' } },
    stylingPreference: { label: '스타일 선호', prompt: '심플한 스타일과 몰입형 장식 중 무엇을 원하나요?', helper: '아치, 배경, 조명, 소품 밀도에 영향을 줍니다.', options: { simple: '심플하고 차분하게', balanced: '완성된 테마감', immersive: '사진 찍기 좋은 몰입형', budget_matched: '예산에 맞춰 자동 선택' } },
    customerName: { label: '연락 이름', prompt: '어떻게 불러드릴까요?', helper: 'local/staging 문의 사전 입력에만 사용하며 외부 메시지를 보내지 않습니다.', placeholder: '예: Ava / Kevin' },
    customerContact: { label: '연락 방법', prompt: '수동 확인을 위한 전화, WeChat 또는 이메일을 남겨주세요.', helper: 'local/staging lead에만 저장되며 SMS, 이메일, WhatsApp을 보내지 않습니다.', placeholder: '전화 / WeChat / 이메일' }
  },
  ar: {
    childAge: { label: 'عمر الطفل', prompt: 'كم عمر صاحب الحفل؟', helper: 'نستخدم العمر لاختيار أجواء الثيم ومستوى الديكور.', options: { '3-5': '3-5 سنوات', '6-8': '6-8 سنوات', '9-10': '9-10 سنوات' } },
    eventDate: { label: 'تاريخ الحفل', prompt: 'ما التاريخ الذي تفكر فيه؟', helper: 'تاريخ تقريبي يكفي الآن، ويمكن للمنسق تأكيده لاحقاً.' },
    guestCount: { label: 'عدد الضيوف', prompt: 'كم عدد الأطفال والبالغين المتوقع حضورهم؟', helper: 'يساعد العدد في تقدير ملاءمة Restaurant A وتخطيط الطاولات.', options: { '10-15': '10-15 ضيفاً', '16-25': '16-25 ضيفاً', '26-40': '26-40 ضيفاً' } },
    budgetRange: { label: 'نطاق الميزانية', prompt: 'أي مستوى باقة نخطط حوله أولاً؟', helper: 'هذا مستوى تخطيط فقط ولا ينشئ دفعاً أو PaymentIntent.', options: { basic: 'Basic · ميزانية مضبوطة', standard: 'Standard · تجربة كاملة', premium: 'Premium · إعداد غامر' } },
    area: { label: 'المنطقة', prompt: 'في أي منطقة تريد إقامة الحفل؟', helper: 'يساعد ذلك في مطابقة القاعة ونطاق خدمة الموردين.' },
    indoorOutdoor: { label: 'داخلي / خارجي', prompt: 'هل تفضل مكاناً داخلياً أم خارجياً؟', helper: 'الداخلي أكثر استقراراً، والخارجي مناسب لثيمات الغابة والطبيعة.', options: { indoor: 'أفضل مكان داخلي', outdoor: 'خارجي / حديقة', flexible: 'مرن، دع AI يقترح' } },
    themePreference: { label: 'تفضيل الثيم', prompt: 'أي ثيم قد يجذب الطفل أكثر؟', helper: 'إذا لم تكن متأكداً، اختر توصية مفتوحة.', options: { castle: 'أميرة / قصر / حكاية', space: 'صاروخ / فضاء / علوم', forest: 'حيوانات / غابة / طبيعة', open: 'غير متأكد، اقترح لي' } },
    venueStatus: { label: 'حالة القاعة', prompt: 'هل لديك قاعة بالفعل؟', helper: 'إن لم تكن لديك قاعة، يمكن استخدام Restaurant A كنموذج لطلب العرض.', options: { has_venue: 'لدي مطعم أو غرفة', need_restaurant: 'أحتاج توصية مطعم', unsure: 'لست متأكداً بعد' } },
    scenePriorities: { label: 'أولوية المشهد', prompt: 'أي منطقة بصرية تريد أن تكون الأبرز؟', helper: 'يمكنك اختيار طاولة الحلويات أو منطقة الصور أو منطقة نشاط الأطفال.', options: { dessert_backdrop: 'طاولة حلويات + خلفية الثيم', photo_arch: 'منطقة صور + قوس المدخل', activity_tables: 'منطقة نشاط + أجواء الطاولات', ai_default: 'توصية AI الافتراضية' } },
    stylingPreference: { label: 'تفضيل الأسلوب', prompt: 'هل تفضل تنسيقاً بسيطاً أم ديكوراً غامراً؟', helper: 'يؤثر ذلك على الأقواس والخلفيات والإضاءة وكثافة العناصر.', options: { simple: 'بسيط وهادئ', balanced: 'أجواء ثيم كاملة', immersive: 'إعداد غامر للصور', budget_matched: 'مطابقة تلقائية للميزانية' } },
    customerName: { label: 'اسم التواصل', prompt: 'بماذا نناديك؟', helper: 'يستخدم فقط لتعبئة استفسار local/staging ولا يرسل رسائل خارجية.', placeholder: 'مثلاً Ava / Kevin' },
    customerContact: { label: 'طريقة التواصل', prompt: 'اترك هاتفاً أو WeChat أو بريداً للتأكيد اليدوي لاحقاً.', helper: 'يحفظ فقط في local/staging lead ولا يرسل SMS أو بريد أو WhatsApp.', placeholder: 'هاتف / WeChat / بريد' }
  }
};

const localizedIntakeSteps = computed(() => intakeSteps.map((step) => {
  if (isChineseLocale.value) return step;
  const copy = localizedStepCopy[locale.value]?.[step.id] || localizedStepCopy.en[step.id] || {};
  return {
    ...step,
    label: copy.label || step.label,
    prompt: copy.prompt || step.prompt,
    helper: copy.helper || step.helper,
    placeholder: copy.placeholder || step.placeholder,
    options: step.options?.map((option) => ({
      ...option,
      label: copy.options?.[option.value] || option.label
    }))
  };
}));

const displayRecommendationTheme = computed(() => {
  const theme = recommendation.value?.theme || recommendation.value?.themeId || recommendation.value?.visualContext?.theme?.id;
  if (theme === 'space') return t('themes.space.name');
  if (theme === 'forest') return t('themes.forest.name');
  return t('themes.castle.name');
});

const displayRecommendationTier = computed(() => {
  const tier = String(recommendation.value?.tier || recommendation.value?.tierLabel || '').toLowerCase();
  if (tier.includes('premium')) return t('quotePage.packages.premium.name');
  if (tier.includes('basic')) return t('quotePage.packages.basic.name');
  return t('quotePage.packages.standard.name');
});

const localizedRecommendationList = (keys, fallback = []) => (
  isChineseLocale.value
    ? fallback
    : keys.map((key) => t(`ai.recommendation.${key}`))
);

const displayRecommendationHeadline = computed(() => (
  isChineseLocale.value
    ? recommendation.value?.reasonHeadline
    : t('ai.recommendation.genericHeadline')
));

const displayRecommendationBrief = computed(() => (
  isChineseLocale.value
    ? recommendation.value?.customerBrief
    : t('ai.recommendation.genericBrief')
));

const displayRecommendationBudget = computed(() => (
  isChineseLocale.value
    ? recommendation.value?.budgetMatch
    : t('ai.recommendation.budgetGeneric')
));

const displayRecommendationReasons = computed(() => localizedRecommendationList(
  ['reasonGeneric1', 'reasonGeneric2'],
  recommendation.value?.reason || []
));

const displayRecommendationIncludes = computed(() => localizedRecommendationList(
  ['includeGeneric1', 'includeGeneric2'],
  recommendation.value?.packageIncludes || []
));

const displayRecommendationPriceDrivers = computed(() => localizedRecommendationList(
  ['priceDriverGeneric1', 'priceDriverGeneric2'],
  recommendation.value?.priceDrivers || []
));

const displayRecommendationCustomerFit = computed(() => (
  isChineseLocale.value
    ? recommendation.value?.customerFit
    : t('ai.recommendation.customerFitGeneric')
));

const displayRecommendationUpgradeTitle = computed(() => (
  isChineseLocale.value
    ? recommendation.value?.upgradeExplanation?.title
    : t('ai.recommendation.upgradeTitle')
));

const displayRecommendationUpgradeItems = computed(() => localizedRecommendationList(
  ['upgradeGeneric1', 'upgradeGeneric2'],
  recommendation.value?.upgradeExplanation?.items || []
));

const displayRecommendationVenue = computed(() => (
  isChineseLocale.value
    ? `${recommendation.value?.visualContext.primaryVenue.name} · ${recommendation.value?.visualContext.primaryVenue.capacity}`
    : t('quotePage.sampleRoom')
));

const displayRecommendationAgeGuests = computed(() => (
  isChineseLocale.value
    ? `${recommendation.value?.visualContext.packageVisual.suitableAge} 岁 · ${recommendation.value?.summary.guestCount}`
    : `${t('ai.ageRange')} · ${recommendation.value?.summary.guestCount}`
));

function hasAnswer(stepId) {
  return Boolean(answers[stepId]);
}

function maybeRecommend() {
  if (answeredCount.value === intakeSteps.length) {
    recommendation.value = scoreRecommendation({ ...answers });
    speak(`${recommendation.value.themeLabel} ${recommendation.value.tierLabel}. ${voiceScripts.quote}`);
  }
}

function chooseOption(option) {
  answers[activeStep.value.id] = option.value;
  maybeRecommend();
  if (activeIndex.value < intakeSteps.length - 1) {
    activeIndex.value += 1;
  }
}

function themeIcon(theme) {
  return { castle: '🏰', space: '🚀', forest: '🌲' }[theme] || '🎉';
}

function displayThemeName(theme) {
  return {
    castle: t('themes.castle.name'),
    space: t('themes.space.name'),
    forest: t('themes.forest.name')
  }[theme] || theme;
}

function displayPackageCue(card) {
  if (isChineseLocale.value) {
    return `${card.packageVisual.suitableAge} 岁 · ${card.packageVisual.suitableVenue}`;
  }
  return t(`ai.themeCue.${card.theme}`);
}

function displaySupplier(supplier) {
  if (isChineseLocale.value) return `${supplier.category} · ${supplier.name}`;
  return `${t('ai.supplier')} · ${supplier.nameEn || supplier.name}`;
}

function localizeField(field) {
  return localizeFieldLabel(field, locale.value);
}

function useStarterPrompt(prompt) {
  freeTextNeed.value = prompt;
  analyzeFreeText();
}

function analyzeFreeText() {
  if (!freeTextNeed.value) return;
  const analysis = analyzeFreeTextIntake(freeTextNeed.value, locale.value);
  const derivedAnswers = mapAnalysisToAnswers(analysis);
  Object.entries(derivedAnswers).forEach(([key, value]) => {
    if (key === 'themePreference' && value === 'open' && answers.themePreference && answers.themePreference !== 'open') {
      return;
    }
    if (value) answers[key] = value;
  });
  if (!speechTranscript.value) {
    speechTranscript.value = freeTextNeed.value;
  }
  recommendation.value = {
    ...scoreRecommendation({ ...answers }),
    quote_ready_summary: analysis.quote_ready_summary,
    free_text_analysis: analysis,
    advisor_message: analysis.advisor_message
  };
  freeTextAnalysis.value = analysis;
  speak(analysis.advisor_message);
}

function resolveSpeechSupport() {
  const support = getBrowserSpeechSupport();
  speechSupported.value = support.supported;
  if (!support.supported) {
    speechError.value = support.reason;
    textFallbackVisible.value = true;
  }
}

function startSpeechInput() {
  resolveSpeechSupport();
  if (!speechSupported.value) return;
  speechError.value = '';
  speechTranscript.value = '';
  speechInterim.value = '';
  speechState.value = 'listening';
  activeRecognizer = createOneShotSpeechRecognizer({
    lang: speechLangForLocale(locale.value),
    onStart: () => {
      speechState.value = 'listening';
    },
    onInterim: (text) => {
      speechInterim.value = text;
    },
    onResult: (text) => {
      speechTranscript.value = text;
      speechInterim.value = '';
      speechState.value = 'processing';
      applySpeechTranscript(text);
    },
    onError: (error) => {
      speechError.value = error.message;
      textFallbackVisible.value = true;
      speechState.value = 'idle';
    },
    onEnd: () => {
      if (speechState.value === 'listening') {
        speechState.value = 'idle';
      }
      activeRecognizer = null;
    }
  });

  try {
    activeRecognizer?.start();
  } catch (error) {
    speechError.value = t('ai.speech.startFailed');
    textFallbackVisible.value = true;
    speechState.value = 'idle';
  }
}

function stopSpeechInput() {
  if (activeRecognizer) {
    activeRecognizer.stop();
  }
  speechState.value = speechTranscript.value ? 'processing' : 'idle';
}

function retrySpeechInput() {
  stopSpeechInput();
  speechTranscript.value = '';
  speechInterim.value = '';
  speechError.value = '';
  freeTextNeed.value = '';
  freeTextAnalysis.value = null;
  startSpeechInput();
}

function useTextFallback() {
  stopSpeechInput();
  textFallbackVisible.value = true;
  speechError.value = t('ai.speech.fallback');
}

function applySpeechTranscript(text) {
  if (!text) return;
  freeTextNeed.value = text;
  analyzeFreeText();
  speechState.value = 'idle';
}

function clearFreeText() {
  freeTextNeed.value = '';
  freeTextAnalysis.value = null;
}

function commitInput() {
  if (!draftAnswer.value) return;
  answers[activeStep.value.id] = draftAnswer.value;
  maybeRecommend();
  if (activeIndex.value < intakeSteps.length - 1) {
    activeIndex.value += 1;
  }
}

function previousStep() {
  if (activeIndex.value > 0) {
    activeIndex.value -= 1;
  }
}

function goStep(index) {
  activeIndex.value = index;
}

function speak(text) {
  return speakText(text, voiceEnabled.value);
}

function toggleVoice() {
  voiceEnabled.value = !voiceEnabled.value;
  if (!voiceEnabled.value) {
    stopSpeaking();
  } else {
    speak(voiceScripts.welcome);
  }
}

function resetFlow() {
  stopSpeaking();
  Object.keys(answers).forEach((key) => delete answers[key]);
  activeIndex.value = 0;
  draftAnswer.value = '';
  freeTextNeed.value = '';
  freeTextAnalysis.value = null;
  speechTranscript.value = '';
  speechInterim.value = '';
  speechError.value = '';
  speechState.value = 'idle';
  recommendation.value = null;
}

function applyThemeQuery() {
  const queryTheme = queryThemeMap[String(route.query.theme || '').toLowerCase()];
  if (!queryTheme) return;
  answers.themePreference = queryTheme;
  activeIndex.value = intakeSteps.findIndex((step) => step.id === 'childAge');
  speak(`${t('ai.prefill.themeLocked')} ${displayThemeName(queryTheme)}. ${activePrompt.value}`);
}

function applyQuickDemoAnswers() {
  Object.keys(answers).forEach((key) => delete answers[key]);
  Object.entries(quickDemoAnswers).forEach(([key, value]) => {
    answers[key] = value;
  });
  activeIndex.value = intakeSteps.length - 1;
  draftAnswer.value = quickDemoAnswers.customerContact;
  recommendation.value = scoreRecommendation({ ...answers });
  speak(`${recommendation.value.themeLabel} ${recommendation.value.tierLabel}. ${voiceScripts.quote}`);
}

function useQuickDemo() {
  applyQuickDemoAnswers();
}

function quickDemoToQuote() {
  applyQuickDemoAnswers();
  goQuote();
}

function goQuote() {
  if (!recommendation.value && freeTextNeed.value) {
    analyzeFreeText();
  }
  const saved = saveIntakeForQuote({ ...answers }, recommendation.value);
  router.push({
    path: '/quote',
    query: {
      theme: saved.theme,
      package: saved.tier,
      scene: 'restaurant-a',
      source: 'ai'
    }
  });
}

function goThemes() {
  router.push({
    path: '/themes',
    query: { theme: recommendation.value?.theme || 'space' }
  });
}

watch(activeIndex, () => {
  draftAnswer.value = answers[activeStep.value?.id] || '';
});

onMounted(() => {
  resolveSpeechSupport();
  applyThemeQuery();
});
</script>

<style scoped>
.ai-intake-page {
  min-height: 100vh;
  padding: 96px 24px 64px;
  background:
    radial-gradient(circle at 12% 12%, rgba(255, 198, 220, 0.34), transparent 32%),
    radial-gradient(circle at 82% 18%, rgba(157, 220, 255, 0.32), transparent 30%),
    linear-gradient(135deg, #fff7fb 0%, #f7fbff 48%, #f7fff9 100%);
  color: #1f2937;
}

.intake-hero,
.question-panel,
.theme-preview-band,
.recommendation-panel {
  max-width: 1180px;
  margin: 0 auto 24px;
}

.intake-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(280px, 0.6fr);
  gap: 24px;
  align-items: stretch;
}

.hero-copy,
.ai-guide-card,
.question-card,
.recommendation-panel {
  border: 1px solid rgba(148, 163, 184, 0.28);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.80);
  box-shadow: 0 24px 70px rgba(15, 23, 42, 0.10);
  backdrop-filter: blur(18px);
}

.hero-copy {
  padding: 34px;
}

.eyebrow {
  margin: 0 0 10px;
  color: #7c3aed;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

h1,
h2 {
  margin: 0 0 14px;
  color: #111827;
  line-height: 1.08;
}

h1 {
  max-width: 820px;
  font-size: clamp(34px, 5vw, 62px);
}

.hero-copy p,
.recommendation-copy p,
dd,
.question-helper,
.ai-line,
.ai-guide-card span,
.ai-guide-card small {
  color: #4b5563;
  line-height: 1.7;
}

.hero-actions,
.next-actions,
.question-header {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}

button {
  cursor: pointer;
  border: 0;
  font-weight: 800;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.primary-action,
.secondary-action,
.question-header button {
  min-height: 44px;
  padding: 0 18px;
  border-radius: 999px;
}

.primary-action {
  background: #7c3aed;
  color: #fff;
  box-shadow: 0 14px 32px rgba(124, 58, 237, 0.26);
}

.secondary-action,
.question-header button {
  background: #fff;
  color: #4338ca;
  border: 1px solid #ddd6fe;
}

.ai-guide-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
  padding: 28px;
}

.bot-avatar {
  width: 86px;
  height: 86px;
  display: grid;
  place-items: center;
  border-radius: 26px;
  background: linear-gradient(135deg, #e0f2fe, #fce7f3);
  color: #4338ca;
  font-size: 26px;
  font-weight: 900;
}

.question-panel {
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  gap: 18px;
}

.progress-rail {
  display: grid;
  gap: 10px;
  align-content: start;
}

.progress-meter {
  height: 10px;
  overflow: hidden;
  border-radius: 999px;
  background: #e5e7eb;
}

.progress-meter span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #8b5cf6, #38bdf8);
  transition: width 160ms ease;
}

.progress-step,
.option-card {
  text-align: left;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #374151;
}

.progress-step {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 12px;
  border-radius: 14px;
}

.progress-step span {
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #eef2ff;
  color: #4338ca;
}

.progress-step.active,
.progress-step.done,
.option-card.selected {
  border-color: #8b5cf6;
  box-shadow: 0 10px 28px rgba(124, 58, 237, 0.14);
}

.concierge-chat-panel {
  max-width: 1180px;
  margin: 0 auto 24px;
  padding: 24px;
  border: 1px solid rgba(124, 58, 237, 0.14);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.84);
  box-shadow: 0 18px 54px rgba(15, 23, 42, 0.09);
}

.chat-copy {
  display: grid;
  gap: 8px;
  max-width: 760px;
  margin-bottom: 18px;
}

.chat-copy h2 {
  margin: 0;
  color: #111827;
  font-size: clamp(24px, 3vw, 36px);
}

.chat-copy p:last-child {
  margin: 0;
  color: #526174;
  line-height: 1.65;
}

.starter-prompts {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 18px;
}

.starter-prompts button {
  padding: 10px 12px;
  border: 1px solid #e9d5ff;
  border-radius: 999px;
  background: #faf5ff;
  color: #6d28d9;
  font-weight: 800;
  cursor: pointer;
}

.speech-input-card {
  display: grid;
  gap: 14px;
  margin-bottom: 18px;
  padding: 18px;
  border: 1px solid #bfdbfe;
  border-radius: 18px;
  background: #eff6ff;
}

.speech-input-card.listening {
  border-color: #38bdf8;
  background: #ecfeff;
  box-shadow: 0 16px 36px rgba(14, 165, 233, 0.16);
}

.speech-input-card h3 {
  margin: 0 0 8px;
  color: #0f172a;
  font-size: 20px;
}

.speech-input-card p {
  margin: 0;
  color: #475569;
  line-height: 1.6;
}

.speech-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.speech-feedback {
  min-height: 42px;
  padding: 12px;
  border-radius: 14px;
  background: #fff;
  color: #1e293b;
  font-weight: 800;
  line-height: 1.45;
}

.theme-lock-pill {
  width: fit-content;
  padding: 8px 10px;
  border-radius: 999px;
  background: #fff7ed;
  color: #9a3412;
  font-size: 13px;
  font-weight: 900;
}

.chat-input-card {
  display: grid;
  gap: 10px;
}

.chat-input-card label {
  color: #111827;
  font-weight: 900;
}

.chat-input-card textarea {
  width: 100%;
  min-height: 112px;
  padding: 16px;
  border: 1px solid #ddd6fe;
  border-radius: 18px;
  color: #111827;
  font-size: 16px;
  line-height: 1.65;
  resize: vertical;
}

.chat-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.chat-actions span {
  color: #7c3aed;
  font-size: 13px;
  font-weight: 900;
}

.analysis-result-card {
  display: grid;
  gap: 16px;
  margin-top: 20px;
}

.advisor-message {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 12px;
  align-items: start;
  padding: 16px;
  border-radius: 18px;
  background: linear-gradient(135deg, #eef2ff, #fff7ed);
}

.advisor-message span {
  display: inline-grid;
  width: 40px;
  height: 40px;
  place-items: center;
  border-radius: 50%;
  background: #7c3aed;
  color: #fff;
  font-weight: 900;
}

.advisor-message p {
  margin: 0;
  color: #30394b;
  line-height: 1.65;
}

.analysis-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.analysis-grid article,
.quote-ready-card {
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  background: #fff;
}

.analysis-grid h3 {
  margin: 0 0 10px;
  color: #111827;
}

.analysis-grid dl {
  gap: 8px;
  margin: 0;
}

.analysis-grid dt {
  color: #64748b;
  font-size: 12px;
}

.analysis-grid dd {
  margin: 0;
  color: #111827;
  font-weight: 800;
}

.analysis-grid ul,
.quote-ready-card ul {
  margin: 0;
  padding-left: 18px;
  color: #4b5563;
  line-height: 1.55;
}

.quote-ready-card {
  background: #f8fafc;
}

.quote-ready-card strong {
  color: #111827;
}

.quote-ready-card p {
  margin: 8px 0 12px;
  color: #4b5563;
  line-height: 1.65;
}

.concierge-chat-panel[dir='rtl'] {
  text-align: right;
}

.concierge-chat-panel[dir='rtl'] .advisor-message {
  grid-template-columns: minmax(0, 1fr) auto;
}

.concierge-chat-panel[dir='rtl'] .advisor-message span {
  order: 2;
}

.concierge-chat-panel[dir='rtl'] .analysis-grid ul,
.concierge-chat-panel[dir='rtl'] .quote-ready-card ul {
  padding-right: 18px;
  padding-left: 0;
}

.question-card {
  padding: 28px;
}

.theme-preview-band {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  gap: 18px;
  align-items: stretch;
  padding: 22px;
  border: 1px solid rgba(148, 163, 184, 0.24);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 16px 46px rgba(15, 23, 42, 0.08);
}

.preview-copy h2 {
  margin: 0;
  font-size: 22px;
}

.theme-preview-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.theme-preview-card {
  overflow: hidden;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  background: #fff;
}

.theme-preview-card img {
  width: 100%;
  height: 126px;
  object-fit: cover;
  display: block;
}

.theme-preview-placeholder,
.recommendation-visual-placeholder {
  min-height: 126px;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 8px;
  padding: 16px;
  text-align: center;
  color: #1f2937;
  background:
    radial-gradient(circle at 20% 16%, rgba(124, 58, 237, 0.18), transparent 28%),
    linear-gradient(135deg, #fff, #eef6ff);
}

.theme-preview-placeholder span,
.recommendation-visual-placeholder span {
  font-size: 2.4rem;
}

.theme-preview-placeholder strong,
.recommendation-visual-placeholder strong {
  font-size: 1rem;
  line-height: 1.2;
}

.theme-preview-card div {
  display: grid;
  gap: 4px;
  padding: 12px;
}

.theme-preview-card span {
  color: #64748b;
  font-size: 13px;
  line-height: 1.45;
}

.question-header {
  justify-content: space-between;
  margin-bottom: 18px;
  color: #64748b;
  font-weight: 700;
}

.ai-line {
  margin: 0 0 8px;
  font-weight: 800;
  color: #6d28d9;
}

.option-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.option-card {
  min-height: 92px;
  padding: 18px;
  border-radius: 16px;
  font-size: 16px;
}

.input-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
}

.input-card input {
  min-height: 48px;
  padding: 0 16px;
  border: 1px solid #ddd6fe;
  border-radius: 16px;
  color: #111827;
  font-size: 16px;
}

.recommendation-panel {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 430px;
  gap: 24px;
  padding: 28px;
}

dl {
  display: grid;
  gap: 14px;
  margin: 22px 0;
}

dt {
  color: #111827;
  font-weight: 800;
}

.brief-box {
  margin-top: 18px;
  padding: 16px;
  border: 1px solid #ddd6fe;
  border-radius: 16px;
  background: #f8f5ff;
}

.brief-box p {
  margin: 6px 0 0;
}

.compact-list {
  margin: 0;
  padding-left: 18px;
}

.compact-list li + li {
  margin-top: 4px;
}

.supplier-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: -4px 0 22px;
}

.supplier-strip span {
  padding: 8px 10px;
  border-radius: 999px;
  background: #eef2ff;
  color: #4338ca;
  font-size: 12px;
  font-weight: 800;
}

.recommendation-visual img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border-radius: 16px;
  box-shadow: 0 18px 44px rgba(15, 23, 42, 0.16);
}

.recommendation-visual-placeholder {
  min-height: 320px;
  border-radius: 16px;
  box-shadow: 0 18px 44px rgba(15, 23, 42, 0.12);
}

.visual-caption {
  margin-top: 12px;
  display: grid;
  gap: 4px;
  color: #4b5563;
}

@media (max-width: 860px) {
  .intake-hero,
  .question-panel,
  .theme-preview-band,
  .recommendation-panel {
    grid-template-columns: 1fr;
  }

  .option-grid,
  .input-card,
  .theme-preview-grid,
  .analysis-grid {
    grid-template-columns: 1fr;
  }
}
</style>
