<template>
  <main class="package-guide-page">
    <section class="package-hero">
      <div>
        <p class="eyebrow">{{ t('packageGuide.kicker') }}</p>
        <h1>{{ t('packageGuide.title') }}</h1>
        <p>{{ t('packageGuide.subtitle') }}</p>
        <div class="hero-actions">
          <button class="primary" type="button" @click="router.push('/venue-finder')">
            {{ t('packageGuide.findVenue') }}
          </button>
          <button type="button" @click="router.push('/quote')">
            {{ t('packageGuide.startQuote') }}
          </button>
        </div>
      </div>
      <aside>
        <strong>{{ t('packageGuide.safeFlowTitle') }}</strong>
        <ol>
          <li v-for="step in safeFlowSteps" :key="step">{{ step }}</li>
        </ol>
      </aside>
    </section>

    <section class="tier-section">
      <div class="section-heading">
        <p class="eyebrow">{{ t('packageGuide.compareKicker') }}</p>
        <h2>{{ t('packageGuide.compareTitle') }}</h2>
        <p>{{ t('packageGuide.compareCopy') }}</p>
      </div>

      <div class="tier-grid">
        <article v-for="tier in tiers" :key="tier.id" class="tier-card" :class="`tier-${tier.id}`">
          <span class="tier-label">{{ tier.label }}</span>
          <h3>{{ tier.localizedName }}</h3>
          <strong>{{ tier.priceHint }}</strong>
          <p>{{ tier.summary }}</p>
          <ul>
            <li v-for="item in tier.includes" :key="item">{{ item }}</li>
          </ul>
          <button type="button" @click="router.push(`/quote?package=${tier.id}`)">
            {{ t('packageGuide.chooseTier') }}
          </button>
        </article>
      </div>
    </section>

    <section class="comparison-panel">
      <div class="section-heading">
        <p class="eyebrow">{{ t('packageGuide.tableKicker') }}</p>
        <h2>{{ t('quotePage.packageComparison.title') }}</h2>
        <p>{{ t('quotePage.packageComparison.copy') }}</p>
      </div>
      <div class="comparison-table" role="table" :aria-label="t('quotePage.packageComparison.title')">
        <div class="comparison-row comparison-head" role="row">
          <span role="columnheader">{{ t('quotePage.packageComparison.dimension') }}</span>
          <strong role="columnheader">{{ t('quotePage.packageComparison.basic') }}</strong>
          <strong role="columnheader">{{ t('quotePage.packageComparison.standard') }}</strong>
          <strong role="columnheader">{{ t('quotePage.packageComparison.premium') }}</strong>
        </div>
        <div v-for="row in comparisonRows" :key="row.label" class="comparison-row" role="row">
          <span role="cell">{{ row.label }}</span>
          <p role="cell">{{ row.basic }}</p>
          <p role="cell">{{ row.standard }}</p>
          <p role="cell">{{ row.premium }}</p>
        </div>
      </div>
    </section>

    <section class="addons-panel">
      <div class="section-heading">
        <p class="eyebrow">{{ t('packageGuide.addonsKicker') }}</p>
        <h2>{{ t('packageGuide.addonsTitle') }}</h2>
        <p>{{ t('packageGuide.addonsCopy') }}</p>
      </div>
      <div class="addon-group-grid">
        <article v-for="group in addonGroups" :key="group.id">
          <div class="addon-group-title">
            <span>{{ group.icon }}</span>
            <div>
              <h3>{{ group.text.title }}</h3>
              <p>{{ group.text.subtitle }}</p>
            </div>
          </div>
          <ul>
            <li v-for="addon in group.items.slice(0, 3)" :key="addon.id">
              <strong>{{ addon.text.name }}</strong>
              <span>+{{ formatMoney(addon.price) }} · {{ addon.text.customerValue }}</span>
            </li>
          </ul>
        </article>
      </div>
    </section>

    <section class="family-choice-panel">
      <div class="section-heading">
        <p class="eyebrow">Staging sample patterns</p>
        <h2>How similar families usually narrow the choice</h2>
        <p>
          These are not real testimonials. They are preview patterns for checking whether parents can understand
          the package ladder and high-value add-ons before a human quote review.
        </p>
      </div>
      <div class="family-choice-grid">
        <article v-for="choice in familyChoices" :key="choice.id">
          <span>{{ choice.title }}</span>
          <h3>{{ choice.recommendedPackage }}</h3>
          <p>{{ choice.familyProfile }}</p>
          <strong>Good add-ons to consider</strong>
          <ul>
            <li v-for="addon in choice.addOns" :key="addon">{{ addon }}</li>
          </ul>
          <small>{{ choice.whyItWorks }}</small>
        </article>
      </div>
    </section>

    <section class="trust-panel">
      <div>
        <p class="eyebrow">{{ t('packageGuide.trustKicker') }}</p>
        <h2>{{ t('packageGuide.trustTitle') }}</h2>
        <p>{{ t('packageGuide.trustCopy') }}</p>
      </div>
      <ul>
        <li v-for="item in trustChecklist" :key="item">{{ item }}</li>
      </ul>
    </section>
  </main>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { getAddOnServiceGroups, getAddOnServices } from '@/data/addOnServices'
import { getTrustChecklist } from '@/data/parentTrustContent'
import { getPopularFamilyChoices } from '@/data/parentSocialProof'
import { packageTierExplanations, tierOrder } from '@/data/packageExplanation'

const { t, locale } = useI18n()
const router = useRouter()
const trustChecklist = getTrustChecklist()
const familyChoices = getPopularFamilyChoices()

const safeFlowSteps = computed(() => [1, 2, 3, 4].map((step) => t(`quotePage.reviewTimeline.step${step}.title`)))

const tierNames = computed(() => ({
  basic: t('quotePage.packageComparison.basic'),
  standard: t('quotePage.packageComparison.standard'),
  premium: t('quotePage.packageComparison.premium')
}))

const tierSummaries = computed(() => ({
  basic: t('quotePage.packageComparison.rows.bestFor.basic'),
  standard: t('quotePage.packageComparison.rows.bestFor.standard'),
  premium: t('quotePage.packageComparison.rows.bestFor.premium')
}))

const tiers = computed(() => tierOrder.map((id) => ({
  id,
  label: id.toUpperCase(),
  localizedName: tierNames.value[id],
  priceHint: packageTierExplanations[id].priceHint,
  summary: tierSummaries.value[id],
  includes: [
    t(`quotePage.packageComparison.rows.visual.${id}`),
    t(`quotePage.packageComparison.rows.included.${id}`),
    t(`quotePage.packageComparison.rows.upgrade.${id}`)
  ]
})))

const comparisonRows = computed(() => ['visual', 'included', 'bestFor', 'ageGuests', 'priceRange', 'upgrade'].map((key) => ({
  label: t(`quotePage.packageComparison.rows.${key}.label`),
  basic: t(`quotePage.packageComparison.rows.${key}.basic`),
  standard: t(`quotePage.packageComparison.rows.${key}.standard`),
  premium: t(`quotePage.packageComparison.rows.${key}.premium`)
})))

const addonGroups = computed(() => {
  const services = getAddOnServices(locale.value)
  return getAddOnServiceGroups(locale.value).map((group) => ({
    ...group,
    items: services.filter((addon) => addon.group === group.id)
  })).filter((group) => group.items.length > 0)
})

const formatMoney = (amount) => new Intl.NumberFormat('en-AU', {
  style: 'currency',
  currency: 'AUD',
  maximumFractionDigits: 0
}).format(Number(amount || 0))
</script>

<style scoped>
.package-guide-page {
  min-height: 100vh;
  padding: 96px 24px 56px;
  background: #fff8f3;
  color: #172033;
}

.package-hero,
.tier-section,
.comparison-panel,
.addons-panel,
.family-choice-panel,
.trust-panel {
  max-width: 1180px;
  margin: 0 auto 24px;
}

.package-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 22px;
  align-items: stretch;
  border: 1px solid #fed7aa;
  border-radius: 8px;
  background:
    linear-gradient(110deg, rgba(255, 255, 255, 0.94), rgba(255, 247, 237, 0.9)),
    url('/party-assets/packages/package-tier-matrix.png') center/cover;
  padding: 34px;
  box-shadow: 0 18px 45px rgba(124, 45, 18, 0.08);
}

.package-hero h1 {
  max-width: 780px;
  margin: 0 0 12px;
  font-size: clamp(34px, 5vw, 58px);
  line-height: 1.02;
}

.package-hero p,
.section-heading p {
  color: #5a6578;
  line-height: 1.7;
}

.package-hero aside {
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.88);
  padding: 20px;
}

.package-hero aside strong {
  color: #9a3412;
}

.package-hero ol {
  display: grid;
  gap: 9px;
  margin: 12px 0 0;
  padding-left: 20px;
  color: #475569;
  font-weight: 700;
}

.eyebrow {
  margin: 0 0 8px;
  color: #db2777;
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 18px;
}

button {
  border: 1px solid #f9a8d4;
  border-radius: 8px;
  background: #fff;
  color: #831843;
  font: inherit;
  font-weight: 900;
  padding: 10px 14px;
  cursor: pointer;
}

button.primary {
  border-color: #db2777;
  background: #db2777;
  color: #fff;
}

.tier-section,
.comparison-panel,
.addons-panel,
.family-choice-panel,
.trust-panel {
  border: 1px solid #f5d0fe;
  border-radius: 8px;
  background: #fff;
  padding: 24px;
  box-shadow: 0 14px 36px rgba(31, 42, 68, 0.06);
}

.section-heading {
  max-width: 760px;
  margin-bottom: 18px;
}

.section-heading h2 {
  margin: 0 0 8px;
}

.tier-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.tier-card {
  display: grid;
  gap: 10px;
  border: 1px solid #fde68a;
  border-radius: 8px;
  background: linear-gradient(135deg, #fffbeb, #fff7ed);
  padding: 18px;
}

.tier-card.tier-standard {
  border-color: #f9a8d4;
  background: linear-gradient(135deg, #fdf2f8, #fff7ed);
}

.tier-card.tier-premium {
  border-color: #c4b5fd;
  background: linear-gradient(135deg, #f5f3ff, #fdf2f8);
}

.tier-label {
  color: #9a3412;
  font-size: 12px;
  font-weight: 900;
}

.tier-card h3 {
  margin: 0;
  font-size: 24px;
}

.tier-card strong {
  color: #db2777;
  font-size: 22px;
}

.tier-card p,
.tier-card li,
.addon-group-grid p,
.addon-group-grid span,
.trust-panel p,
.trust-panel li {
  color: #5a6578;
  line-height: 1.6;
}

.tier-card ul {
  display: grid;
  gap: 8px;
  margin: 0;
  padding-left: 18px;
}

.comparison-table {
  overflow: hidden;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.comparison-row {
  display: grid;
  grid-template-columns: 0.72fr repeat(3, 1fr);
  gap: 1px;
  background: #e5e7eb;
}

.comparison-row > * {
  margin: 0;
  background: #fff;
  padding: 12px;
}

.comparison-head > * {
  background: #831843;
  color: #fff;
}

.addon-group-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.family-choice-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.family-choice-grid article {
  border: 1px solid #fed7aa;
  border-radius: 8px;
  background: linear-gradient(135deg, #fff7ed, #fff);
  padding: 16px;
}

.family-choice-grid article > span {
  display: inline-flex;
  border-radius: 999px;
  background: #ffedd5;
  color: #9a3412;
  font-size: 12px;
  font-weight: 900;
  padding: 6px 9px;
}

.family-choice-grid h3 {
  margin: 12px 0 8px;
  color: #831843;
}

.family-choice-grid p,
.family-choice-grid li,
.family-choice-grid small {
  color: #5a6578;
  line-height: 1.6;
}

.family-choice-grid strong {
  display: block;
  margin-top: 12px;
  color: #172033;
}

.family-choice-grid ul {
  display: grid;
  gap: 6px;
  margin: 8px 0 12px;
  padding-left: 18px;
}

.addon-group-grid article {
  border-radius: 8px;
  background: #f8fafc;
  padding: 16px;
}

.addon-group-title {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.addon-group-title > span {
  font-size: 28px;
}

.addon-group-title h3 {
  margin: 0;
}

.addon-group-grid ul,
.trust-panel ul {
  display: grid;
  gap: 10px;
  margin: 14px 0 0;
  padding: 0;
  list-style: none;
}

.addon-group-grid li,
.trust-panel li {
  border-radius: 8px;
  background: #fff;
  padding: 10px;
}

.addon-group-grid li strong,
.addon-group-grid li span {
  display: block;
}

.trust-panel {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 0.8fr);
  gap: 18px;
  background: linear-gradient(135deg, #eff6ff, #fff7ed);
}

@media (max-width: 900px) {
  .package-hero,
  .tier-grid,
  .comparison-row,
  .addon-group-grid,
  .family-choice-grid,
  .trust-panel {
    grid-template-columns: 1fr;
  }
}
</style>
