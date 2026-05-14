<template>
  <main class="supplier-detail-page">
    <button class="back-button" @click="router.push('/suppliers')">Back to Suppliers</button>

    <section v-if="supplier" class="hero-grid">
      <div class="hero-media">
        <img :src="supplier.cover_image_url || '/party-assets/packages/package-tier-matrix.png'" :alt="supplier.name" />
      </div>
      <article class="hero-copy">
        <p class="eyebrow">Local/staging supplier asset</p>
        <h1>{{ supplier.name }}</h1>
        <p class="lead">
          {{ supplier.materials_or_services || supplier.visual_context?.serviceContent || 'Supplier service details are held as local/staging operating data.' }}
        </p>
        <div class="fact-grid">
          <div><span>Category</span><strong>{{ supplier.category_label || supplier.category_level_1 }}</strong></div>
          <div><span>Service area</span><strong>{{ supplier.service_area || supplier.suburb }}</strong></div>
          <div><span>Price range</span><strong>{{ supplier.price_range || supplier.price_level }}</strong></div>
          <div><span>Lead time</span><strong>{{ supplier.lead_time || 'Confirm before quote send' }}</strong></div>
          <div><span>Status</span><strong>{{ supplier.status || 'demo_active' }}</strong></div>
          <div><span>Contact</span><strong>{{ supplier.contact_placeholder || 'Local/staging placeholder only' }}</strong></div>
        </div>
        <div class="cta-row">
          <button class="primary" @click="router.push('/quote')">Use in Quote Context</button>
          <button @click="router.push('/admin/suppliers')">Admin Supplier View</button>
        </div>
      </article>
    </section>

    <section v-if="supplier" class="content-grid">
      <article class="panel">
        <p class="eyebrow">Theme / package fit</p>
        <h2>Where this supplier fits</h2>
        <dl class="detail-list">
          <div>
            <dt>Supported themes</dt>
            <dd>{{ supplier.supported_themes?.join(' / ') || '-' }}</dd>
          </div>
          <div>
            <dt>Supported package tiers</dt>
            <dd>{{ supplier.supported_package_tiers?.join(' / ') || '-' }}</dd>
          </div>
          <div>
            <dt>Quote role</dt>
            <dd>{{ supplier.visual_context?.quoteRole || supplier.service_tags?.[0] || '-' }}</dd>
          </div>
          <div>
            <dt>Operational responsibility</dt>
            <dd>{{ responsibilityText }}</dd>
          </div>
        </dl>
      </article>

      <article class="panel">
        <p class="eyebrow">Quote line item relationship</p>
        <h2>How operations should use this</h2>
        <ul class="ops-list">
          <li v-for="item in quoteLineItemLinks" :key="item">{{ item }}</li>
        </ul>
        <p class="boundary">
          This supplier record is a local/staging operating asset. It does not contact the supplier, reserve inventory, trigger webhook/n8n, or send outbound messages.
        </p>
      </article>
    </section>

    <section v-if="supplier" class="panel">
      <p class="eyebrow">Compatible Restaurant A scenes</p>
      <h2>Visual contexts this supplier can support</h2>
      <div class="scene-grid">
        <article v-for="scene in compatibleScenes" :key="scene.id">
          <img :src="scene.image_path" :alt="scene.title" />
          <strong>{{ scene.title }}</strong>
          <span>{{ scene.decorationLayer }}</span>
        </article>
      </div>
    </section>

    <section v-else class="panel">
      <h1>Supplier not found</h1>
      <p>This local/staging supplier asset is not available.</p>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getSupplierDisplayItem } from '@/services/supplierLightService'
import { restaurantAVisuals } from '@/data/visualAssets'

const route = useRoute()
const router = useRouter()
const supplier = ref(null)

const responsibilityText = computed(() => {
  const roles = supplier.value?.responsibilities || [supplier.value?.visual_context?.responsibility, supplier.value?.visual_context?.operationsRole].filter(Boolean)
  return roles?.join(' / ') || '-'
})

const quoteLineItemLinks = computed(() => {
  const category = supplier.value?.category
  const map = {
    venue: ['Maps to venue_fee for room hire or private dining room hold.', 'Admin should confirm capacity, access window, and setup restrictions.'],
    florist: ['Maps to decor_fee or optional_upgrade depending on package tier.', 'Useful for Castle and Forest table styling.'],
    balloon_decorator: ['Maps to decor_fee for arch, clusters, and entrance visual layer.', 'Standard/Premium packages should itemize this separately when needed.'],
    cake_dessert: ['Maps to supplier_fee or optional_upgrade for cake and dessert table.', 'Customer-facing quote should describe it as supplier service, not payment-ready checkout.'],
    kids_entertainment: ['Maps to supplier_fee for host or activity vendor.', 'Admin should confirm theme script and child age fit.'],
    photography: ['Maps to optional_upgrade unless included in Premium package.', 'Do not imply automatic booking in staging.'],
    setup_service: ['Maps to labor_fee, transport_fee, or service_fee.', 'Important for final delivery planning and venue handover.']
  }
  return map[category] || ['Use this supplier as a local/staging quote context item.']
})

const compatibleScenes = computed(() => {
  const themes = supplier.value?.supported_themes || []
  const tiers = supplier.value?.supported_package_tiers || []
  return restaurantAVisuals.filter((scene) => (
    scene.theme === 'all'
    || (themes.includes(scene.theme) && (!tiers.length || tiers.includes(scene.tier)))
  )).slice(0, 6)
})

onMounted(async () => {
  const result = await getSupplierDisplayItem(route.params.id)
  supplier.value = result.item
})
</script>

<style scoped>
.supplier-detail-page {
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
  grid-template-columns: minmax(0, 1fr) minmax(340px, 0.9fr);
  gap: 22px;
  margin-bottom: 22px;
}

.hero-media,
.hero-copy,
.panel {
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
.scene-grid img {
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

.lead,
.boundary {
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

.cta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.primary {
  background: #7c3aed;
  border-color: #7c3aed;
  color: #fff;
}

.detail-list,
.ops-list {
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.ops-list li {
  background: #f7f9fc;
  border-radius: 8px;
  padding: 12px;
  color: #344054;
}

.scene-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.scene-grid article {
  border: 1px solid #e4e9f2;
  border-radius: 8px;
  overflow: hidden;
}

.scene-grid img {
  height: 150px;
}

.scene-grid strong,
.scene-grid span {
  display: block;
  padding: 8px 10px 0;
}

.scene-grid span {
  padding-bottom: 10px;
  color: #667085;
  font-size: 12px;
  line-height: 1.4;
}

@media (max-width: 900px) {
  .hero-grid,
  .content-grid,
  .scene-grid {
    grid-template-columns: 1fr;
  }
}
</style>
