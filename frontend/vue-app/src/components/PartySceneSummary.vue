<template>
  <section class="party-scene-summary">
    <div class="summary-media">
      <img :src="renderingImage" :alt="renderingTitle">
    </div>
    <div class="summary-copy">
      <p class="eyebrow">{{ audienceLabel }} · unified planning context</p>
      <h2>{{ title }}</h2>
      <p class="intro">
        {{ recommendationText }}
      </p>
      <dl>
        <div>
          <dt>Theme / package</dt>
          <dd>{{ config.themeLabel }} · {{ config.packageTierLabel }}</dd>
        </div>
        <div>
          <dt>Venue</dt>
          <dd>{{ config.venue?.name || visualContext.primaryVenue.name }} · {{ config.venue?.capacity || visualContext.primaryVenue.capacity }}</dd>
        </div>
        <div>
          <dt>Layout</dt>
          <dd>{{ summary.layout }}</dd>
        </div>
        <div>
          <dt>Decor</dt>
          <dd>{{ summary.decor }}</dd>
        </div>
        <div>
          <dt>Suppliers</dt>
          <dd>{{ supplierLine }}</dd>
        </div>
      </dl>
      <div class="actions">
        <button type="button" @click="openPreview">查看 3D Preview</button>
        <span>Experimental only · not a construction drawing</span>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { buildDefaultPartySceneConfig, writePartySceneConfig } from '@/services/partyScenePreviewService';
import { summarizePartySceneConfig } from '@/data/partySceneConfig';
import { getVisualContext, normalizeThemeId, normalizeTierId } from '@/data/visualAssets';

const props = defineProps({
  title: {
    type: String,
    default: 'AI / Visual Planning Context'
  },
  audience: {
    type: String,
    default: 'customer'
  },
  sceneConfig: {
    type: Object,
    default: null
  },
  visualContext: {
    type: Object,
    default: null
  },
  recommendationText: {
    type: String,
    default: 'This planning context connects AI recommendation, Restaurant A rendering, supplier suggestions, quote line items, and future 3D preview.'
  }
});

const router = useRouter();

const config = computed(() => props.sceneConfig || buildDefaultPartySceneConfig());
const visualContext = computed(() => props.visualContext || getVisualContext(
  normalizeThemeId(config.value.themeId || config.value.theme || config.value.themeLabel),
  normalizeTierId(config.value.packageTier || config.value.packageTierLabel)
));
const summary = computed(() => summarizePartySceneConfig(config.value) || {});
const renderingImage = computed(() => config.value.visuals?.renderedSceneImage || visualContext.value.restaurant.image_path);
const renderingTitle = computed(() => config.value.visuals?.restaurantTitle || visualContext.value.restaurant.title);
const audienceLabel = computed(() => props.audience === 'admin' ? 'Admin view' : 'Customer view');
const supplierLine = computed(() => {
  const suppliers = Array.isArray(config.value.suppliers) && config.value.suppliers.length
    ? config.value.suppliers
    : visualContext.value.suppliers;
  return suppliers.map((item) => `${item.categoryLabel || item.category}: ${item.name}`).join(' / ');
});

const openPreview = () => {
  writePartySceneConfig(config.value);
  router.push('/experimental/party-3d');
};
</script>

<style scoped>
.party-scene-summary {
  display: grid;
  grid-template-columns: minmax(260px, 0.8fr) minmax(0, 1.2fr);
  gap: 18px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  padding: 18px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
}

.summary-media img {
  width: 100%;
  min-height: 260px;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.eyebrow {
  margin: 0 0 8px;
  color: #64748b;
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
}

h2 {
  margin: 0 0 10px;
  color: #0f172a;
}

.intro {
  margin: 0 0 14px;
  color: #475569;
  line-height: 1.6;
}

dl {
  display: grid;
  gap: 10px;
  margin: 0;
}

dt {
  color: #64748b;
  font-size: 12px;
  font-weight: 800;
}

dd {
  margin: 3px 0 0;
  color: #0f172a;
  font-weight: 650;
}

.actions {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  margin-top: 16px;
}

.actions button {
  min-height: 40px;
  padding: 0 16px;
  border: 1px solid #2563eb;
  border-radius: 8px;
  background: #2563eb;
  color: #fff;
  font-weight: 800;
  cursor: pointer;
}

.actions span {
  color: #64748b;
  font-size: 12px;
}

@media (max-width: 820px) {
  .party-scene-summary {
    grid-template-columns: 1fr;
  }
}
</style>
