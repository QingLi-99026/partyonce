<template>
  <main class="ai-intake-page">
    <section class="intake-hero">
      <div class="hero-copy">
        <p class="eyebrow">AI Concierge · local/staging only</p>
        <h1>让 AI Concierge 帮你把派对需求整理成报价咨询</h1>
        <p>
          每一步只问一个问题。AI 会根据年龄、人数、预算、主题偏好和场地状态，
          推荐 Castle / Space / Forest 主题、套餐层级和 Restaurant A 样板，并自动预填 quote request。
        </p>
        <div class="hero-actions">
          <button class="primary-action" @click="speak(activePrompt)">听当前问题</button>
          <button class="secondary-action" @click="toggleVoice">
            {{ voiceEnabled ? '关闭声音' : '打开声音' }}
          </button>
          <button class="secondary-action" @click="resetFlow">重新开始</button>
        </div>
      </div>

      <div class="ai-guide-card">
        <div class="bot-avatar">AI</div>
        <strong>PartyOnce AI Concierge</strong>
        <span>{{ conciergeMessage }}</span>
        <small>不接付费 TTS，不上传真人声音，不触发付款、webhook、n8n 或外发消息。</small>
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

    <section v-if="recommendation" class="recommendation-panel">
      <div class="recommendation-copy">
        <p class="eyebrow">AI recommendation</p>
        <h2>{{ recommendation.themeLabel }} · {{ recommendation.tierLabel }}</h2>
        <p>{{ recommendation.reason.join(' ') }}</p>

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
            <dt>适合人数</dt>
            <dd>{{ recommendation.summary.guestCount }}</dd>
          </div>
          <div>
            <dt>适合场地</dt>
            <dd>{{ recommendation.venueType }}</dd>
          </div>
          <div>
            <dt>下一步</dt>
            <dd>进入 quote request，确认联系方式和日期后提交 inquiry。不会创建 Quote / Order，也不会触发 payment。</dd>
          </div>
        </dl>

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

const router = useRouter();
const activeIndex = ref(0);
const answers = reactive({});
const draftAnswer = ref('');
const recommendation = ref(null);
const voiceEnabled = ref(false);

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
  .recommendation-panel {
    grid-template-columns: 1fr;
  }

  .option-grid,
  .input-card {
    grid-template-columns: 1fr;
  }
}
</style>
