<template>
  <main class="ai-intake-page">
    <section class="intake-hero">
      <div class="hero-copy">
        <p class="eyebrow">AI voice-style intake · local/staging only</p>
        <h1>让 AI 引导官帮你把派对需求说清楚</h1>
        <p>
          通过 5 个点击式问题，快速推荐 Castle / Space / Forest 主题、套餐层级、Restaurant A 样板和供应商方向。
          本页不接真实语音识别，不触发付款、webhook、n8n 或任何外发消息。
        </p>
        <div class="hero-actions">
          <button class="primary-action" @click="playWelcome">🔊 听 AI 欢迎语</button>
          <button class="secondary-action" @click="resetFlow">重新开始</button>
        </div>
      </div>

      <div class="ai-guide-card">
        <div class="bot-avatar">🤖</div>
        <strong>PartyOnce AI Guide</strong>
        <span>{{ activePrompt }}</span>
      </div>
    </section>

    <section class="question-panel">
      <aside class="progress-rail">
        <button
          v-for="(step, index) in intakeSteps"
          :key="step.id"
          class="progress-step"
          :class="{ active: index === activeIndex, done: answers[step.id] }"
          @click="activeIndex = index"
        >
          <span>{{ index + 1 }}</span>
          {{ step.label }}
        </button>
      </aside>

      <article class="question-card">
        <div class="question-header">
          <span>Step {{ activeIndex + 1 }} / {{ intakeSteps.length }}</span>
          <button @click="speak(activePrompt)">🔊 播放问题</button>
        </div>
        <h2>{{ activePrompt }}</h2>
        <div class="option-grid">
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
      </article>
    </section>

    <section v-if="recommendation" class="recommendation-panel">
      <div class="recommendation-copy">
        <p class="eyebrow">AI recommendation</p>
        <h2>{{ recommendation.packageVisual.title }}</h2>
        <p>{{ recommendation.packageVisual.buyerCue }}</p>
        <dl>
          <div>
            <dt>套餐</dt>
            <dd>{{ recommendation.packageVisual.tierLabelZh }} · {{ recommendation.packageVisual.priceHint }}</dd>
          </div>
          <div>
            <dt>装饰层</dt>
            <dd>{{ recommendation.packageVisual.scope }}</dd>
          </div>
          <div>
            <dt>适合场地</dt>
            <dd>{{ recommendation.packageVisual.suitableVenue }}</dd>
          </div>
        </dl>
        <div class="next-actions">
          <button class="primary-action" @click="goQuote">带入报价页</button>
          <button class="secondary-action" @click="goThemes">查看主题视觉</button>
        </div>
      </div>
      <div class="recommendation-visual">
        <img :src="recommendation.packageVisual.image_path" :alt="recommendation.packageVisual.title">
        <div class="visual-caption">
          <strong>Restaurant A 样板</strong>
          <span>{{ recommendation.visualContext.restaurant.structureLock }}</span>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  intakeSteps,
  saveIntakeForQuote,
  scoreRecommendation,
  speakText,
  voiceScripts
} from '@/services/aiVoiceIntakeService';

const router = useRouter();
const activeIndex = ref(0);
const answers = reactive({});
const recommendation = ref(null);

const activeStep = computed(() => intakeSteps[activeIndex.value]);
const activePrompt = computed(() => activeStep.value?.prompt || voiceScripts.welcome);

const chooseOption = (option) => {
  answers[activeStep.value.id] = option.value;
  if (activeIndex.value < intakeSteps.length - 1) {
    activeIndex.value += 1;
  }
  if (Object.keys(answers).length === intakeSteps.length) {
    recommendation.value = scoreRecommendation(answers);
    speakText(`${voiceScripts[recommendation.value.theme]} ${voiceScripts.quote}`);
  }
};

const speak = (text) => speakText(text);
const playWelcome = () => speakText(voiceScripts.welcome);

const resetFlow = () => {
  Object.keys(answers).forEach((key) => delete answers[key]);
  activeIndex.value = 0;
  recommendation.value = null;
};

const goQuote = () => {
  const saved = saveIntakeForQuote(recommendation.value);
  router.push({
    path: '/quote',
    query: {
      theme: saved.theme,
      package: saved.tier,
      source: 'ai_voice_intake'
    }
  });
};

const goThemes = () => {
  router.push({
    path: '/themes',
    query: { theme: recommendation.value?.theme || 'space' }
  });
};
</script>

<style scoped>
.ai-intake-page {
  min-height: 100vh;
  padding: 96px 24px 64px;
  background:
    radial-gradient(circle at 12% 12%, rgba(255, 198, 220, 0.32), transparent 32%),
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
  background: rgba(255, 255, 255, 0.78);
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
  max-width: 760px;
  font-size: clamp(34px, 5vw, 62px);
}

.hero-copy p,
.recommendation-copy p,
dd {
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
  font-size: 46px;
}

.question-panel {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 18px;
}

.progress-rail {
  display: grid;
  gap: 10px;
  align-content: start;
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

.option-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.option-card {
  min-height: 96px;
  padding: 18px;
  border-radius: 16px;
  font-size: 16px;
}

.recommendation-panel {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 420px;
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

  .option-grid {
    grid-template-columns: 1fr;
  }
}
</style>
