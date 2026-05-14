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
        <strong>PartyOnce AI Concierge</strong>
        <span>{{ conciergeMessage }}</span>
        <small>{{ $t('ai.safetyNote') }}</small>
      </div>
    </section>

    <section class="question-panel">
      <aside class="progress-rail">
        <div class="progress-meter">
          <span :style="{ width: `${progressPercent}%` }"></span>
        </div>
        <button
          v-for="(step, index) in intakeSteps"
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
          <button :disabled="activeIndex === 0" @click="previousStep">返回上一步</button>
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
          <button class="primary-action" :disabled="!draftAnswer" @click="commitInput">确认这一项</button>
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
          <img :src="card.packageVisual.image_path" :alt="card.packageVisual.title">
          <div>
            <strong>{{ card.packageVisual.themeName }}</strong>
            <span>{{ card.packageVisual.suitableAge }} 岁 · {{ card.packageVisual.suitableVenue }}</span>
          </div>
        </article>
      </div>
    </section>

    <section v-if="recommendation" class="recommendation-panel">
      <div class="recommendation-copy">
        <p class="eyebrow">AI recommendation</p>
        <h2>{{ recommendation.themeLabel }} · {{ recommendation.tierLabel }}</h2>
        <p>{{ recommendation.reasonHeadline }}</p>

        <div class="brief-box">
          <strong>Customer brief</strong>
          <p>{{ recommendation.customerBrief }}</p>
        </div>

        <dl>
          <div>
            <dt>推荐主题</dt>
            <dd>{{ recommendation.themeLabel }}</dd>
          </div>
          <div>
            <dt>推荐套餐</dt>
            <dd>{{ recommendation.tierLabel }} · {{ recommendation.visualContext.packageVisual.priceHint }}</dd>
          </div>
          <div>
            <dt>推荐场地 / Restaurant A</dt>
            <dd>{{ recommendation.visualContext.primaryVenue.name }} · {{ recommendation.visualContext.primaryVenue.capacity }}</dd>
          </div>
          <div>
            <dt>推荐理由</dt>
            <dd>
              <ul class="compact-list">
                <li v-for="item in recommendation.reason" :key="item">{{ item }}</li>
              </ul>
            </dd>
          </div>
          <div>
            <dt>适合年龄 / 人数</dt>
            <dd>{{ recommendation.visualContext.packageVisual.suitableAge }} 岁 · {{ recommendation.summary.guestCount }}</dd>
          </div>
          <div>
            <dt>预算匹配说明</dt>
            <dd>{{ recommendation.budgetMatch }}</dd>
          </div>
          <div>
            <dt>套餐包含内容</dt>
            <dd>
              <ul class="compact-list">
                <li v-for="item in recommendation.packageIncludes" :key="item">{{ item }}</li>
              </ul>
            </dd>
          </div>
          <div>
            <dt>价格差异来自哪里</dt>
            <dd>
              <ul class="compact-list">
                <li v-for="item in recommendation.priceDrivers" :key="item">{{ item }}</li>
              </ul>
            </dd>
          </div>
          <div>
            <dt>这个方案为什么适合我</dt>
            <dd>{{ recommendation.customerFit }}</dd>
          </div>
          <div>
            <dt>{{ recommendation.upgradeExplanation.title }}</dt>
            <dd>
              <ul class="compact-list">
                <li v-for="item in recommendation.upgradeExplanation.items" :key="item">{{ item }}</li>
              </ul>
            </dd>
          </div>
          <div>
            <dt>下一步</dt>
            <dd>{{ recommendation.nextStepSuggestion }} 当前为 staging preview，不会创建 Quote / Order，也不会触发 payment。</dd>
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
            {{ supplier.category }} · {{ supplier.name }}
          </span>
        </div>

        <div class="next-actions">
          <button class="primary-action" @click="goQuote">确认并继续到 Quote</button>
          <button class="secondary-action" @click="goThemes">查看主题视觉</button>
        </div>
      </div>

      <div class="recommendation-visual">
        <img :src="recommendation.visualContext.restaurant.image_path" :alt="recommendation.visualContext.restaurant.title">
        <div class="visual-caption">
          <strong>{{ recommendation.visualContext.restaurant.title }}</strong>
          <span>{{ recommendation.visualContext.restaurant.structureLock }}</span>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import {
  intakeSteps,
  saveIntakeForQuote,
  scoreRecommendation,
  speakText,
  stopSpeaking,
  voiceScripts
} from '@/services/aiVoiceIntakeService';
import { getVisualContext } from '@/data/visualAssets';

const router = useRouter();
const activeIndex = ref(0);
const answers = reactive({});
const draftAnswer = ref('');
const recommendation = ref(null);
const voiceEnabled = ref(false);

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

const answeredCount = computed(() => intakeSteps.filter((step) => hasAnswer(step.id)).length);
const progressPercent = computed(() => Math.round((answeredCount.value / intakeSteps.length) * 100));
const activeStep = computed(() => intakeSteps[activeIndex.value]);
const activePrompt = computed(() => activeStep.value?.prompt || voiceScripts.welcome);
const conciergeMessage = computed(() => {
  if (recommendation.value) {
    return `我建议先看 ${recommendation.value.themeLabel} ${recommendation.value.tierLabel}，并用 Restaurant A 样板进入 quote request。`;
  }
  return 'I can recommend a theme and package for you, then pre-fill your quote request.';
});
const themePreviewCards = computed(() => ['castle', 'space', 'forest'].map((theme) => ({
  theme,
  ...getVisualContext(theme, 'standard')
})));

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
  recommendation.value = null;
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
  const saved = saveIntakeForQuote({ ...answers }, recommendation.value);
  router.push({
    path: '/quote',
    query: {
      theme: saved.theme,
      package: saved.tier,
      scene: 'restaurant-a',
      source: 'ai_concierge'
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
  .theme-preview-grid {
    grid-template-columns: 1fr;
  }
}
</style>
