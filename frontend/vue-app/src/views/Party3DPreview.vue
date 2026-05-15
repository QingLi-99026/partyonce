<template>
  <main class="party-3d-page">
    <section class="hero-band">
      <div>
        <p class="eyebrow">{{ t('party3d.eyebrow') }}</p>
        <h1>{{ t('party3d.title') }}</h1>
        <p>
          {{ t('party3d.disclaimerBefore') }} <code>party_scene_config</code>.
          {{ t('party3d.disclaimerAfter') }}
        </p>
      </div>
      <div class="hero-actions">
        <router-link class="button primary" to="/quote">{{ t('party3d.backQuote') }}</router-link>
        <router-link v-if="featureFlags.aiExperienceEnabled" class="button secondary" to="/ai-voice-intake">{{ t('party3d.aiConcierge') }}</router-link>
      </div>
    </section>

    <section class="controls-band">
      <div>
        <label for="theme-select">Theme</label>
        <select id="theme-select" v-model="selectedTheme" @change="rebuildScene">
          <option value="castle">Castle Princess</option>
          <option value="space">Space Explorer</option>
          <option value="forest">Forest Adventure</option>
        </select>
      </div>
      <div>
        <label for="tier-select">Package tier</label>
        <select id="tier-select" v-model="selectedTier" @change="rebuildScene">
          <option value="basic">Basic</option>
          <option value="standard">Standard</option>
          <option value="premium">Premium</option>
        </select>
      </div>
      <button type="button" @click="resetToDefault">{{ t('party3d.reset') }}</button>
    </section>

    <PartyScenePreview3D :scene-config="sceneConfig" />

    <section class="details-grid">
      <article>
        <p class="eyebrow">{{ t('party3d.sceneSummary') }}</p>
        <h2>{{ summary?.label }}</h2>
        <dl>
          <div>
            <dt>Venue</dt>
            <dd>{{ summary?.venue }}</dd>
          </div>
          <div>
            <dt>Layout</dt>
            <dd>{{ summary?.layout }}</dd>
          </div>
          <div>
            <dt>Decor</dt>
            <dd>{{ summary?.decor }}</dd>
          </div>
          <div>
            <dt>Suppliers</dt>
            <dd>{{ summary?.supplierCount }} {{ t('party3d.suggestedSuppliers') }}</dd>
          </div>
        </dl>
      </article>

      <article>
        <p class="eyebrow">{{ t('party3d.boundary') }}</p>
        <h2>{{ t('party3d.sandboxOnly') }}</h2>
        <ul>
          <li>{{ t('party3d.boundaryItems.storage') }}</li>
          <li>{{ t('party3d.boundaryItems.visualOnly') }}</li>
          <li>{{ t('party3d.boundaryItems.no3dService') }}</li>
          <li>{{ t('party3d.boundaryItems.noExternal') }}</li>
        </ul>
      </article>
    </section>

    <section class="json-panel">
      <div>
        <p class="eyebrow">party_scene_config JSON</p>
        <h2>{{ t('party3d.futureInput') }}</h2>
      </div>
      <pre>{{ formattedConfig }}</pre>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import PartyScenePreview3D from '@/components/PartyScenePreview3D.vue';
import { featureFlags } from '@/config/featureFlags';
import {
  buildDefaultPartySceneConfig,
  readPartySceneConfig,
  writePartySceneConfig
} from '@/services/partyScenePreviewService';
import { summarizePartySceneConfig } from '@/data/partySceneConfig';

const { t } = useI18n();
const sceneConfig = ref(buildDefaultPartySceneConfig());
const selectedTheme = ref('castle');
const selectedTier = ref('standard');

const summary = computed(() => summarizePartySceneConfig(sceneConfig.value));
const formattedConfig = computed(() => JSON.stringify(sceneConfig.value, null, 2));

const applySceneConfig = (config) => {
  const saved = writePartySceneConfig(config);
  sceneConfig.value = saved;
  selectedTheme.value = saved.themeId || 'castle';
  selectedTier.value = saved.packageTier || 'standard';
};

const rebuildScene = () => {
  applySceneConfig(buildDefaultPartySceneConfig(selectedTheme.value, selectedTier.value));
};

const resetToDefault = () => {
  selectedTheme.value = 'castle';
  selectedTier.value = 'standard';
  rebuildScene();
};

onMounted(() => {
  applySceneConfig(readPartySceneConfig());
});
</script>

<style scoped>
.party-3d-page {
  min-height: 100vh;
  padding: 96px clamp(18px, 4vw, 56px) 48px;
  background:
    linear-gradient(135deg, rgba(255,255,255,0.96), rgba(244, 248, 255, 0.92)),
    #f7f9fc;
  color: #1f2937;
}

.hero-band {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 28px;
  align-items: end;
  margin-bottom: 24px;
}

.eyebrow {
  margin: 0 0 8px;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #64748b;
  font-weight: 800;
}

h1,
h2,
p {
  margin-top: 0;
}

h1 {
  margin-bottom: 12px;
  font-size: clamp(2rem, 5vw, 4.3rem);
}

.hero-band p {
  max-width: 860px;
  color: #475569;
  font-size: 1.05rem;
  line-height: 1.7;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.button,
.controls-band button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  padding: 0 16px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 800;
  border: 1px solid #cbd5e1;
  cursor: pointer;
}

.button.primary {
  color: #fff;
  background: #2563eb;
  border-color: #2563eb;
}

.button.secondary,
.controls-band button {
  color: #1f2937;
  background: #fff;
}

.controls-band {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 220px));
  gap: 14px;
  align-items: end;
  margin: 0 0 24px;
  padding: 16px;
  border: 1px solid rgba(31, 41, 55, 0.1);
  background: rgba(255,255,255,0.78);
}

.controls-band label {
  display: block;
  margin-bottom: 6px;
  color: #475569;
  font-weight: 800;
}

.controls-band select {
  width: 100%;
  min-height: 42px;
  padding: 0 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #fff;
  color: #1f2937;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-top: 24px;
}

.details-grid article,
.json-panel {
  border: 1px solid rgba(31, 41, 55, 0.1);
  background: #fff;
  padding: 20px;
}

dl {
  display: grid;
  gap: 10px;
  margin: 0;
}

dt {
  font-weight: 900;
  color: #1f2937;
}

dd {
  margin: 2px 0 0;
  color: #64748b;
}

li {
  margin-bottom: 8px;
  color: #64748b;
  line-height: 1.5;
}

.json-panel {
  margin-top: 16px;
}

pre {
  max-height: 420px;
  overflow: auto;
  margin: 14px 0 0;
  padding: 16px;
  background: #0f172a;
  color: #dbeafe;
  font-size: 0.82rem;
  line-height: 1.55;
}

@media (max-width: 760px) {
  .hero-band,
  .details-grid,
  .controls-band {
    grid-template-columns: 1fr;
  }
}
</style>
