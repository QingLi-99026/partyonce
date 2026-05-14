<template>
  <main class="venue-detail-page">
    <button class="back-button" @click="router.push('/venues')">Back to Venues</button>

    <section v-if="venue" class="hero-grid">
      <div class="hero-media">
        <img :src="selectedImage" :alt="venue.name" />
      </div>
      <article class="hero-copy">
        <p class="eyebrow">Local/staging venue asset</p>
        <h1>{{ venue.name }}</h1>
        <p class="lead">{{ venue.notes || venue.note }}</p>
        <div class="fact-grid">
          <div><span>Type</span><strong>{{ venue.type }}</strong></div>
          <div><span>Capacity</span><strong>{{ venue.capacity }}</strong></div>
          <div><span>Tables</span><strong>{{ venue.tables }}</strong></div>
          <div><span>Chairs</span><strong>{{ venue.chairs }}</strong></div>
          <div><span>Location</span><strong>{{ venue.location }}</strong></div>
          <div><span>Price range</span><strong>{{ venue.priceRange }}</strong></div>
        </div>
        <div class="cta-row">
          <button class="primary" @click="router.push('/quote')">Use in Quote Request</button>
          <button @click="router.push('/suppliers')">View Supplier Match</button>
        </div>
      </article>
    </section>

    <section v-if="venue" class="panel">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">Theme compatibility</p>
          <h2>Restaurant A rendering system</h2>
        </div>
        <span class="stage-badge">No real booking · staging only</span>
      </div>
      <div class="rendering-grid">
        <button
          v-for="visual in venueRenderings"
          :key="visual.id"
          class="render-card"
          type="button"
          @click="selectedImage = visual.image_path"
        >
          <img :src="visual.image_path" :alt="visual.title" />
          <strong>{{ visual.title }}</strong>
          <span>{{ visual.decorationLayer }}</span>
        </button>
      </div>
    </section>

    <section v-if="venue" class="content-grid">
      <article class="panel">
        <p class="eyebrow">Supported packages</p>
        <h2>What this venue can support</h2>
        <div class="tag-row">
          <span v-for="tier in venue.supported_packages" :key="tier">{{ tier }}</span>
        </div>
        <dl class="detail-list">
          <div>
            <dt>Theme fit</dt>
            <dd>{{ venue.themeFit.join(' / ') }}</dd>
          </div>
          <div>
            <dt>Layout image</dt>
            <dd>{{ venue.layoutImage }}</dd>
          </div>
          <div>
            <dt>Operations note</dt>
            <dd>{{ venue.operationsNotes?.join(' · ') || venue.note }}</dd>
          </div>
        </dl>
      </article>

      <article class="panel">
        <p class="eyebrow">Supplier match</p>
        <h2>Recommended supplier roles</h2>
        <ul class="supplier-list">
          <li v-for="supplier in recommendedSuppliers" :key="supplier.id">
            <img :src="supplier.image_path" :alt="supplier.name" />
            <div>
              <strong>{{ supplier.name }}</strong>
              <span>{{ supplier.categoryLabel || supplier.category }} · {{ supplier.priceRange }}</span>
              <small>{{ supplier.responsibility || supplier.operationsRole }}</small>
            </div>
          </li>
        </ul>
      </article>
    </section>

    <section v-else class="panel">
      <h1>Venue not found</h1>
      <p>This local/staging venue asset is not available.</p>
    </section>
  </main>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getRecommendedSuppliers, restaurantAVisuals, venueDisplaySeeds } from '@/data/visualAssets'

const route = useRoute()
const router = useRouter()

const venue = computed(() => venueDisplaySeeds.find((item) => String(item.id) === String(route.params.id)) || null)
const selectedImage = ref(venue.value?.image_path || '')

const venueRenderings = computed(() => {
  if (!venue.value) return []
  if (venue.value.id === 'restaurant-a') return restaurantAVisuals
  return [
    {
      id: `${venue.value.id}-original`,
      title: `${venue.value.name} reference`,
      image_path: venue.value.image_path,
      decorationLayer: venue.value.note
    }
  ]
})

const recommendedSuppliers = computed(() => {
  const theme = venue.value?.themeFit?.[0] || 'castle'
  const tier = venue.value?.bestPackageTiers?.includes('standard') ? 'standard' : venue.value?.bestPackageTiers?.[0] || 'basic'
  return getRecommendedSuppliers(theme, tier)
})
</script>

<style scoped>
.venue-detail-page {
  max-width: 1220px;
  margin: 0 auto;
  padding: 96px 24px 56px;
  color: #172033;
}

.back-button,
button {
  border: 1px solid #d8deea;
  border-radius: 8px;
  background: #fff;
  color: #172033;
  font-weight: 700;
  padding: 10px 14px;
  cursor: pointer;
}

.back-button {
  margin-bottom: 18px;
}

.hero-grid,
.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.8fr);
  gap: 22px;
  margin-bottom: 22px;
}

.hero-media,
.panel,
.hero-copy {
  background: #fff;
  border: 1px solid #e4e9f2;
  border-radius: 8px;
  box-shadow: 0 14px 34px rgba(31, 42, 68, 0.08);
}

.hero-media {
  overflow: hidden;
  min-height: 420px;
}

.hero-media img,
.render-card img,
.supplier-list img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.hero-copy,
.panel {
  padding: 24px;
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
  margin: 0 0 12px;
}

.lead {
  color: #5c667a;
  line-height: 1.7;
}

.fact-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin: 18px 0;
}

.fact-grid div,
.detail-list div {
  background: #f7f9fc;
  border-radius: 8px;
  padding: 12px;
}

.fact-grid span,
dt {
  display: block;
  color: #667085;
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 4px;
}

.fact-grid strong,
dd {
  margin: 0;
  color: #172033;
  font-weight: 800;
}

.cta-row,
.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.primary {
  background: #7c3aed;
  border-color: #7c3aed;
  color: #fff;
}

.panel-heading {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}

.stage-badge,
.tag-row span {
  border-radius: 999px;
  background: #eef2ff;
  color: #4338ca;
  font-size: 12px;
  font-weight: 800;
  padding: 8px 10px;
}

.rendering-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
}

.render-card {
  padding: 0;
  overflow: hidden;
  text-align: left;
}

.render-card img {
  height: 130px;
}

.render-card strong,
.render-card span {
  display: block;
  padding: 8px 10px 0;
}

.render-card span {
  padding-bottom: 10px;
  color: #667085;
  font-size: 12px;
  line-height: 1.4;
}

.detail-list,
.supplier-list {
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.supplier-list li {
  display: grid;
  grid-template-columns: 82px minmax(0, 1fr);
  gap: 12px;
  align-items: center;
  border: 1px solid #e4e9f2;
  border-radius: 8px;
  padding: 10px;
}

.supplier-list img {
  height: 64px;
  border-radius: 6px;
}

.supplier-list span,
.supplier-list small {
  display: block;
  color: #667085;
  margin-top: 4px;
}

@media (max-width: 900px) {
  .hero-grid,
  .content-grid {
    grid-template-columns: 1fr;
  }

  .rendering-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
