<template>
  <main class="venue-finder-page">
    <section class="finder-hero">
      <div>
        <p class="eyebrow">{{ vfCopy.heroEyebrow }}</p>
        <h1>{{ vfCopy.heroTitle }}</h1>
        <p>{{ vfCopy.heroCopy }}</p>
        <div class="hero-actions">
          <button class="primary" type="button" @click="applyFamilySample">{{ vfCopy.familySample }}</button>
          <button type="button" @click="resetFilters">{{ vfCopy.resetFilters }}</button>
        </div>
      </div>
      <div class="hero-card">
        <strong>{{ filteredVenues.length }}</strong>
        <span>{{ vfCopy.matchingVenues }}</span>
        <small>{{ vfCopy.guestSummary(filters.adults, filters.kids, totalGuests) }}</small>
      </div>
    </section>

    <section class="showcase-strip">
      <div class="showcase-copy">
        <p class="eyebrow">{{ vfCopy.showcaseEyebrow }}</p>
        <h2>{{ vfCopy.showcaseTitle }}</h2>
        <p>{{ vfCopy.showcaseCopy }}</p>
      </div>
      <img src="/party-assets/venues/restaurant-a/restaurant-a-showcase.png" :alt="vfCopy.showcaseAlt" />
    </section>

    <section class="trust-strip">
      <div>
        <p class="eyebrow">{{ vfCopy.parentEyebrow }}</p>
        <h2>{{ vfCopy.parentTitle }}</h2>
        <p>{{ vfCopy.parentCopy }}</p>
      </div>
      <ul>
        <li v-for="item in trustChecklist" :key="item">{{ item }}</li>
      </ul>
    </section>

    <section class="choice-proof-strip">
      <div class="choice-proof-heading">
        <p class="eyebrow">{{ vfCopy.choiceEyebrow }}</p>
        <h2>{{ vfCopy.choiceTitle }}</h2>
        <p>{{ vfCopy.choiceCopy }}</p>
      </div>
      <div class="choice-proof-grid">
        <article v-for="choice in popularFamilyChoices" :key="choice.id">
          <span>{{ choice.title }}</span>
          <h3>{{ choice.recommendedPackage }}</h3>
          <p>{{ choice.familyProfile }}</p>
          <ul>
            <li v-for="addon in choice.addOns" :key="addon">{{ addon }}</li>
          </ul>
          <small>{{ choice.whyItWorks }}</small>
        </article>
      </div>
    </section>

    <section class="finder-layout">
      <aside class="filter-panel">
        <div class="panel-heading">
          <p class="eyebrow">{{ vfCopy.quickFilters }}</p>
          <h2>{{ vfCopy.constraintsTitle }}</h2>
        </div>

        <label>
          {{ vfCopy.area }}
          <select v-model="filters.area">
            <option v-for="area in areaOptions" :key="area" :value="area">{{ area }}</option>
          </select>
        </label>

        <label>
          {{ vfCopy.distanceRadius }}
          <select v-model.number="filters.radiusKm">
            <option :value="1">1km</option>
            <option :value="3">3km</option>
            <option :value="5">5km</option>
            <option :value="10">10km</option>
          </select>
        </label>

        <div class="inline-fields">
          <label>
            {{ vfCopy.adults }}
            <input v-model.number="filters.adults" min="0" type="number" />
          </label>
          <label>
            {{ vfCopy.kids }}
            <input v-model.number="filters.kids" min="0" type="number" />
          </label>
        </div>
        <p class="total-guests">{{ vfCopy.totalGuests }}: <strong>{{ totalGuests }}</strong></p>

        <label>
          {{ vfCopy.childAgeRange }}
          <select v-model="filters.childAgeRange">
            <option value="3_5">3-5</option>
            <option value="6_8">6-8</option>
            <option value="9_12">9-12</option>
            <option value="13_plus">13+</option>
          </select>
        </label>

        <label>
          {{ vfCopy.budgetPerPerson }}
          <select v-model="filters.budgetPerPerson">
            <option value="under_25">Under $25</option>
            <option value="25_45">$25-$45</option>
            <option value="45_70">$45-$70</option>
            <option value="70_plus">$70+</option>
          </select>
        </label>

        <div class="inline-fields">
          <label>
            {{ vfCopy.date }}
            <input v-model="filters.eventDate" type="date" />
          </label>
          <label>
            {{ vfCopy.time }}
            <input v-model="filters.eventTime" type="time" />
          </label>
        </div>

        <div class="panel-divider"></div>
        <p class="eyebrow">{{ vfCopy.advancedFilters }}</p>

        <label>
          {{ vfCopy.venueType }}
          <select v-model="filters.venueType">
            <option value="">{{ vfCopy.anyVenueType }}</option>
            <option v-for="item in localizedVenueTypeOptions" :key="item.value" :value="item.value">{{ item.label }}</option>
          </select>
        </label>

        <label>
          {{ vfCopy.spaceType }}
          <select v-model="filters.spaceType">
            <option value="">{{ vfCopy.anySpaceType }}</option>
            <option v-for="item in localizedSpaceTypeOptions" :key="item.value" :value="item.value">{{ item.label }}</option>
          </select>
        </label>

        <div class="check-grid">
          <label v-for="check in checkFilters" :key="check.key" class="check-row">
            <input v-model="filters[check.key]" type="checkbox" />
            <span>{{ check.label }}</span>
          </label>
        </div>

        <div class="panel-divider"></div>
        <p class="eyebrow">{{ vfCopy.culturalFit }}</p>
        <p class="filter-helper">{{ vfCopy.filterHelper }}</p>
        <div class="check-grid">
          <label v-for="check in culturalFilters" :key="check.key" class="check-row">
            <input v-model="filters[check.key]" type="checkbox" />
            <span>{{ check.label }}</span>
          </label>
        </div>

        <div class="panel-divider"></div>
        <p class="eyebrow">{{ vfCopy.themeFit }}</p>
        <div class="check-grid">
          <label v-for="theme in themeFilters" :key="theme.value" class="check-row">
            <input v-model="filters.themes" type="checkbox" :value="theme.value" />
            <span>{{ theme.label }}</span>
          </label>
        </div>
      </aside>

      <section class="results-panel">
        <div class="results-toolbar">
          <div>
            <p class="eyebrow">{{ vfCopy.results }}</p>
            <h2>{{ vfCopy.resultsTitle(filteredVenues.length, totalGuests, filters.area) }}</h2>
          </div>
          <select v-model="sortBy" :aria-label="vfCopy.sortVenues">
            <option value="match">{{ vfCopy.bestMatch }}</option>
            <option value="distance">{{ vfCopy.distance }}</option>
            <option value="price">{{ vfCopy.price }}</option>
            <option value="capacity">{{ vfCopy.capacity }}</option>
          </select>
        </div>

        <div v-if="filteredVenues.length === 0" class="empty-state">
          <h3>{{ vfCopy.noMatchTitle }}</h3>
          <p>{{ vfCopy.noMatchCopy }}</p>
          <button class="primary" type="button" @click="resetFilters">{{ vfCopy.resetFilters }}</button>
        </div>

        <div v-else class="venue-card-grid">
          <article
            v-for="venue in sortedVenues"
            :key="venue.id"
            class="venue-card"
            :class="{ 'is-selected': selectedVenue?.id === venue.id }"
          >
            <div class="venue-card-media">
              <img :src="venue.image" :alt="localizedVenueName(venue)" />
              <span class="demo-badge" :class="{ 'is-research': venue.researchSeed }">
                {{ venue.researchSeed ? vfCopy.publicInfoSeed : vfCopy.planningVenue }}
              </span>
              <div class="media-thumbs" aria-label="Theme preview images">
                <img
                  v-for="preview in themePreviewImages(venue)"
                  :key="preview"
                  :src="preview"
                  alt=""
                />
              </div>
            </div>
            <div class="venue-card-body">
              <div class="venue-card-title">
                <div>
                  <span class="match-score">{{ vfCopy.matchScore(venue.match.score) }}</span>
                  <h3>{{ localizedVenueName(venue) }}</h3>
                </div>
                <strong>{{ venue.distance }}km</strong>
              </div>
              <div class="match-bar" aria-hidden="true">
                <span :style="{ width: `${venue.match.score}%` }"></span>
              </div>
              <p>{{ localizedVenueDescription(venue) }}</p>
              <div class="tag-row">
                <span>{{ venue.suburb }}</span>
                <span>{{ venueTypeLabel(venue.venueType) }}</span>
                <span>{{ vfCopy.capacityRange(venue.capacityMin, venue.capacityMax) }}</span>
                <span>{{ vfCopy.priceRange(venue.pricePerPersonMin, venue.pricePerPersonMax) }}</span>
              </div>
              <div class="tag-row is-muted">
                <span v-for="theme in venue.suitableThemes" :key="theme">{{ themeLabel(theme) }}</span>
              </div>
              <div v-if="culturalFitLabels(venue).length" class="tag-row cultural-fit-row">
                <span v-for="label in culturalFitLabels(venue).slice(0, 4)" :key="label">{{ label }}</span>
              </div>
              <p v-if="venue.researchSeed" class="research-note">
                {{ vfCopy.publicSourceNote }}
              </p>
              <div class="fit-grid">
                <div>
                  <small>{{ vfCopy.bestFor }}</small>
                  <strong>{{ localizedPackageFit(venue).join(' / ') }}</strong>
                </div>
                <div>
                  <small>{{ vfCopy.visualFit }}</small>
                  <strong>{{ visualFitLabel(venue) }}</strong>
                </div>
              </div>
              <div class="parent-checks">
                <small>{{ vfCopy.parentChecks }}</small>
                <span>{{ localizedOps(venue).foodOptions[0] }}</span>
                <span>{{ localizedOps(venue).allergyNotes[0] }}</span>
                <span>{{ localizedOps(venue).minimumSpendHint }}</span>
              </div>
              <div class="recommended-addons">
                <small>{{ vfCopy.usefulAddons }}</small>
                <div>
                  <span v-for="addon in recommendedAddOns(venue).slice(0, 3)" :key="addon.id">
                    {{ addon.icon }} {{ addon.name }}
                  </span>
                </div>
              </div>
              <p class="why-match">{{ venue.match.reasons.join(' · ') || venue.whyMatch }}</p>
              <div class="card-actions">
                <button type="button" @click="openVenue(venue)">{{ vfCopy.viewVenue }}</button>
                <button type="button" :class="{ selected: isCompared(venue) }" @click="compareVenue(venue)">
                  {{ isCompared(venue) ? vfCopy.compared : vfCopy.compare }}
                </button>
                <button class="primary" type="button" @click="useVenueForQuote(venue)">{{ vfCopy.useForQuote }}</button>
              </div>
            </div>
          </article>
        </div>
      </section>
    </section>

    <section v-if="compareVenues.length" class="compare-panel">
      <div class="compare-heading">
        <div>
          <p class="eyebrow">{{ vfCopy.comparison }}</p>
          <h2>{{ vfCopy.compareTitle }}</h2>
        </div>
        <button type="button" @click="clearCompare">{{ vfCopy.clearCompare }}</button>
      </div>
      <div class="compare-grid">
        <article v-for="venue in compareVenues" :key="venue.id" class="compare-card">
          <img :src="venue.image" :alt="localizedVenueName(venue)" />
          <h3>{{ localizedVenueName(venue) }}</h3>
          <dl>
            <div><dt>{{ vfCopy.distance }}</dt><dd>{{ vfCopy.distanceFrom(venue.distance, filters.area) }}</dd></div>
            <div><dt>{{ vfCopy.capacity }}</dt><dd>{{ vfCopy.capacityRange(venue.capacityMin, venue.capacityMax) }}</dd></div>
            <div><dt>{{ vfCopy.budget }}</dt><dd>{{ vfCopy.priceRange(venue.pricePerPersonMin, venue.pricePerPersonMax) }}</dd></div>
            <div><dt>{{ vfCopy.packageFit }}</dt><dd>{{ localizedPackageFit(venue).join(' / ') }}</dd></div>
            <div><dt>{{ vfCopy.themeFit }}</dt><dd>{{ venue.suitableThemes.map(themeLabel).join(' / ') }}</dd></div>
            <div><dt>{{ vfCopy.addonUpside }}</dt><dd>{{ recommendedAddOns(venue).slice(0, 3).map((item) => localizedAddonName(item)).join(' / ') }}</dd></div>
            <div><dt>{{ vfCopy.foodCheck }}</dt><dd>{{ localizedOps(venue).foodOptions[0] }}</dd></div>
            <div><dt>{{ vfCopy.allergyCheck }}</dt><dd>{{ localizedOps(venue).allergyNotes[0] }}</dd></div>
            <div><dt>{{ vfCopy.culturalFit }}</dt><dd>{{ culturalFitLabels(venue).join(' / ') || vfCopy.manualFamilyReview }}</dd></div>
            <div><dt>{{ vfCopy.minSpend }}</dt><dd>{{ localizedOps(venue).minimumSpendHint }}</dd></div>
            <div><dt>{{ vfCopy.watchOuts }}</dt><dd>{{ localizedRestrictions(venue).join(' · ') }}</dd></div>
          </dl>
          <button class="primary" type="button" @click="useVenueForQuote(venue)">{{ vfCopy.useForQuoteShort }}</button>
          <button type="button" @click="compareVenue(venue)">{{ vfCopy.remove }}</button>
        </article>
      </div>
    </section>

    <section v-if="selectedVenue" class="detail-panel" :id="selectedVenue.id">
      <div class="detail-media">
        <img :src="selectedVenue.image" :alt="localizedVenueName(selectedVenue)" />
        <div v-if="selectedVenue.beforeImage && selectedVenue.afterImage" class="before-after-strip">
          <figure>
            <img :src="selectedVenue.beforeImage" :alt="`${localizedVenueName(selectedVenue)} before styling`" />
            <figcaption>{{ vfCopy.beforeReference }}</figcaption>
          </figure>
          <figure>
            <img :src="selectedVenue.afterImage" :alt="`${localizedVenueName(selectedVenue)} after styling concept`" />
            <figcaption>{{ vfCopy.afterConcept }}</figcaption>
          </figure>
        </div>
      </div>
      <article>
        <p class="eyebrow">{{ selectedVenue.researchSeed ? vfCopy.detailPublicSeed : vfCopy.detailPlanningVenue }}</p>
        <h2>{{ localizedVenueName(selectedVenue) }}</h2>
        <p>{{ localizedVenueDescription(selectedVenue) }}</p>
        <dl class="detail-list">
          <div><dt>{{ vfCopy.suburb }}</dt><dd>{{ selectedVenue.suburb }}</dd></div>
          <div><dt>{{ vfCopy.capacity }}</dt><dd>{{ vfCopy.capacityRange(selectedVenue.capacityMin, selectedVenue.capacityMax) }}</dd></div>
          <div><dt>{{ vfCopy.budget }}</dt><dd>{{ vfCopy.priceRangeFull(selectedVenue.pricePerPersonMin, selectedVenue.pricePerPersonMax) }}</dd></div>
          <div><dt>{{ vfCopy.space }}</dt><dd>{{ spaceTypeLabel(selectedVenue.spaceType) }}</dd></div>
          <div><dt>{{ vfCopy.packageFit }}</dt><dd>{{ localizedPackageFit(selectedVenue).join(' / ') }}</dd></div>
          <div><dt>{{ vfCopy.themeFit }}</dt><dd>{{ selectedVenue.suitableThemes.map(themeLabel).join(' / ') }}</dd></div>
        </dl>
        <div class="capability-list">
          <span v-if="selectedVenue.kidFriendly">{{ vfCopy.kidFriendly }}</span>
          <span v-if="selectedVenue.allowsDecorations">{{ vfCopy.allowsDecorations }}</span>
          <span v-if="selectedVenue.allowsCake">{{ vfCopy.allowsCake }}</span>
          <span v-if="selectedVenue.allowsPhotographer">{{ vfCopy.allowsPhotographer }}</span>
          <span v-if="selectedVenue.allowsEntertainment">{{ vfCopy.allowsEntertainment }}</span>
          <span v-if="selectedVenue.hasDessertTableSpace">{{ vfCopy.hasDessertTableSpace }}</span>
          <span v-if="selectedVenue.hasPhotoZoneSpace">{{ vfCopy.hasPhotoZoneSpace }}</span>
          <span v-if="selectedVenue.balloonSetupPossible">{{ vfCopy.balloonSetupPossible }}</span>
          <span v-for="label in culturalFitLabels(selectedVenue)" :key="label">{{ label }}</span>
        </div>
        <div class="detail-render-strip">
          <img
            v-for="preview in themePreviewImages(selectedVenue)"
            :key="preview"
            :src="preview"
            :alt="vfCopy.themePreviewAlt"
          />
        </div>
        <div class="recommended-addons is-detail">
          <small>{{ vfCopy.recommendedHighValueAddons }}</small>
          <div>
            <span v-for="addon in recommendedAddOns(selectedVenue)" :key="addon.id">
              {{ addon.icon }} {{ localizedAddonName(addon) }} · +${{ addon.price }}
            </span>
          </div>
          <p>{{ vfCopy.addonReviewNote }}</p>
        </div>
        <div class="restriction-box">
          <strong>{{ vfCopy.manualConfirmation }}</strong>
          <ul>
            <li v-for="item in localizedRestrictions(selectedVenue)" :key="item">{{ item }}</li>
          </ul>
        </div>
        <div class="restriction-box ops-readiness-box">
          <strong>{{ vfCopy.opsChecks }}</strong>
          <dl>
            <div><dt>{{ vfCopy.foodOptions }}</dt><dd>{{ localizedOps(selectedVenue).foodOptions.join(' · ') }}</dd></div>
            <div><dt>{{ vfCopy.allergyNotes }}</dt><dd>{{ localizedOps(selectedVenue).allergyNotes.join(' · ') }}</dd></div>
            <div><dt>{{ vfCopy.dietaryCulturalFit }}</dt><dd>{{ culturalFitLabels(selectedVenue).join(' · ') || vfCopy.manualReviewRequired }}</dd></div>
            <div v-if="selectedVenue.culturalFitNotes?.length"><dt>{{ vfCopy.culturalPlanningNotes }}</dt><dd>{{ localizedCulturalNotes(selectedVenue).join(' · ') }}</dd></div>
            <div><dt>{{ vfCopy.roomHire }}</dt><dd>{{ localizedOps(selectedVenue).roomHireHint }}</dd></div>
            <div><dt>{{ vfCopy.minimumSpend }}</dt><dd>{{ localizedOps(selectedVenue).minimumSpendHint }}</dd></div>
            <div><dt>{{ vfCopy.verification }}</dt><dd>{{ localizedOps(selectedVenue).verificationStatus }}</dd></div>
            <div v-if="selectedVenue.publicSourceLabel"><dt>{{ vfCopy.publicSource }}</dt><dd>{{ selectedVenue.publicSourceLabel }}</dd></div>
          </dl>
          <p>{{ vfCopy.formalQuoteNote }}</p>
          <p v-if="selectedVenue.publicSourceUrl" class="source-link">
            {{ vfCopy.sourceUrlLabel }}:
            <a :href="selectedVenue.publicSourceUrl" target="_blank" rel="noopener noreferrer">{{ selectedVenue.publicSourceUrl }}</a>
          </p>
        </div>
        <div class="hero-actions">
          <button class="primary" type="button" @click="useVenueForQuote(selectedVenue)">{{ vfCopy.useForQuote }}</button>
          <button type="button" @click="selectedVenue = null">{{ vfCopy.closeDetail }}</button>
        </div>
      </article>
    </section>
  </main>
</template>

<script setup>
import { computed, nextTick, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import {
  getVenueFinderById,
  spaceTypeLabels,
  themeLabels,
  venueFinderAreaOptions,
  venueFinderFixtures,
  venueTypeLabels
} from '@/data/venueFinderFixtures';
import { recommendAddOnServicesForVenue } from '@/data/addOnServices';
import { getTrustChecklist } from '@/data/parentTrustContent';
import { getPopularFamilyChoices } from '@/data/parentSocialProof';
import { getVenueOperationalReadiness } from '@/data/supplierVenueImportTemplate';
import { normalizeVenueFinderFilters, saveVenueFinderQuotePrefill, scoreVenueMatch } from '@/services/venueFinderService';

const route = useRoute();
const router = useRouter();
const { locale } = useI18n();

const filters = reactive({
  area: 'Marrickville',
  radiusKm: 5,
  adults: 10,
  kids: 20,
  childAgeRange: '9_12',
  budgetPerPerson: '25_45',
  eventDate: '',
  eventTime: '',
  venueType: '',
  spaceType: '',
  kidFriendly: true,
  allowsDecorations: true,
  allowsCake: true,
  allowsPhotographer: false,
  allowsEntertainment: false,
  parkingNearby: false,
  publicTransportNearby: true,
  themes: [],
  hasDessertTableSpace: true,
  hasPhotoZoneSpace: true,
  balloonSetupPossible: true,
  halalFriendly: false,
  noPorkFriendly: false,
  noAlcoholFriendly: false,
  vegetarianFriendly: false,
  egglessCakeFriendly: false,
  allergyAware: false,
  privateFamilyArea: false
});

const sortBy = ref('match');
const selectedVenue = ref(null);
const compareSelectedIds = ref([]);
const trustChecklist = getTrustChecklist();
const popularFamilyChoices = getPopularFamilyChoices();

const areaOptions = venueFinderAreaOptions;
const isZh = computed(() => locale.value === 'zh');

const venueFinderCopy = {
  zh: {
    heroEyebrow: '派对场地筛选',
    heroTitle: '查找适合的派对场地',
    heroCopy: '先根据人数、预算、区域、餐饮和家庭需求筛选候选场地。当前场地信息用于报价前规划，不代表即时预订成功，正式可用性仍需人工复核。',
    familySample: '使用 30 人家庭样例',
    resetFilters: '重置筛选',
    matchingVenues: '个候选场地',
    guestSummary: (adults, kids, total) => `${adults} 位成人 + ${kids} 位孩子 · 共 ${total} 人`,
    showcaseEyebrow: '餐厅 A 视觉规划资料',
    showcaseTitle: '对比同一空间在主题布置前后的效果',
    showcaseCopy: '这组资料帮助家长理解房间结构、城堡、太空和森林主题布置如何影响报价前的方案沟通。',
    showcaseAlt: '餐厅 A 场地规划展示',
    parentEyebrow: '给正在比较场地的家长',
    parentTitle: '先做候选清单，再由团队确认真实细节',
    parentCopy: '你可以按人数、预算、区域、饮食需求、房间规则和主题适配度缩小范围。本页不会即时预订场地，也不会收取订金。',
    choiceEyebrow: '常见家庭选择参考',
    choiceTitle: '不确定从哪里开始时，可以先这样筛选',
    choiceCopy: '这些是派对规划参考，不是真实客户评价。它们帮助家长快速理解套餐和附加服务的取舍。',
    quickFilters: '快速筛选',
    constraintsTitle: '从真实派对条件开始',
    area: '区域 / 近郊',
    distanceRadius: '距离范围',
    adults: '成人',
    kids: '孩子',
    totalGuests: '总人数',
    childAgeRange: '孩子年龄段',
    budgetPerPerson: '人均预算',
    date: '日期',
    time: '时间',
    advancedFilters: '更多筛选',
    venueType: '场地类型',
    anyVenueType: '不限场地类型',
    spaceType: '空间类型',
    anySpaceType: '不限空间类型',
    culturalFit: '饮食与文化需求',
    filterHelper: '这些只作为前期规划筛选，团队仍会与场地或餐饮方人工确认。',
    themeFit: '主题适配',
    results: '筛选结果',
    resultsTitle: (count, guests, area) => `${count} 个适合 ${guests} 人、靠近 ${area} 的候选场地`,
    sortVenues: '排序场地',
    bestMatch: '最佳匹配',
    distance: '距离',
    price: '价格',
    capacity: '容量',
    noMatchTitle: '暂时没有完全匹配的场地',
    noMatchCopy: '可以扩大距离、放宽预算，或减少一个主题/空间限制。',
    publicInfoSeed: '公开资料待确认',
    planningVenue: '候选场地',
    matchScore: (score) => `${score}/100 匹配`,
    capacityRange: (min, max) => `${min}-${max} 人`,
    priceRange: (min, max) => `$${min}-$${max} / 人`,
    priceRangeFull: (min, max) => `$${min}-$${max} / 每人`,
    publicSourceNote: '已找到公开资料 · 报价前需要人工电话确认',
    bestFor: '适合',
    visualFit: '视觉适配',
    parentChecks: '报价前家长需关注',
    usefulAddons: '适合这个场地的附加服务',
    viewVenue: '查看场地',
    compared: '已加入对比',
    compare: '加入对比',
    useForQuote: '用这个场地获取报价',
    comparison: '场地对比',
    compareTitle: '最多对比 3 个候选场地',
    clearCompare: '清空对比',
    distanceFrom: (distance, area) => `距离 ${area} ${distance}km`,
    budget: '预算',
    packageFit: '套餐适配',
    addonUpside: '附加服务机会',
    foodCheck: '餐饮确认',
    allergyCheck: '过敏确认',
    manualFamilyReview: '需要人工复核家庭需求',
    minSpend: '最低消费',
    watchOuts: '注意事项',
    useForQuoteShort: '用于报价',
    remove: '移除',
    beforeReference: '原始场地参考',
    afterConcept: '主题布置概念',
    detailPublicSeed: '场地详情 · 公开资料待确认',
    detailPlanningVenue: '场地详情 · 报价前规划',
    suburb: '区域',
    space: '空间',
    kidFriendly: '适合儿童',
    allowsDecorations: '可布置装饰',
    allowsCake: '可带蛋糕',
    allowsPhotographer: '可安排摄影',
    allowsEntertainment: '可安排儿童娱乐',
    hasDessertTableSpace: '有甜品桌空间',
    hasPhotoZoneSpace: '有拍照区空间',
    balloonSetupPossible: '可做气球布置',
    themePreviewAlt: '主题效果预览',
    recommendedHighValueAddons: '推荐高价值附加服务',
    addonReviewNote: '这些是规划建议。正式报价前，策划师仍会确认场地档期、供应商适配和最终细节。',
    manualConfirmation: '仍需人工确认',
    opsChecks: '餐饮、过敏与场地商业条件确认',
    foodOptions: '餐饮选项',
    allergyNotes: '过敏说明',
    dietaryCulturalFit: '饮食 / 文化适配',
    culturalPlanningNotes: '文化需求规划说明',
    roomHire: '包间费',
    minimumSpend: '最低消费',
    verification: '确认状态',
    publicSource: '公开来源',
    formalQuoteNote: '以上信息只用于报价前规划。正式报价需要团队直接向场地方确认。',
    sourceUrlLabel: '供团队核验的来源链接',
    closeDetail: '关闭详情',
    manualReviewRequired: '需要人工复核'
  },
  en: {
    heroEyebrow: 'Venue finder',
    heroTitle: 'Find a party-ready venue',
    heroCopy: 'Filter candidate venues by guest count, budget, suburb, food needs and family requirements. Venue details are for pre-quote planning and do not mean instant booking success.',
    familySample: 'Use 30 guest family sample',
    resetFilters: 'Reset filters',
    matchingVenues: 'candidate venues',
    guestSummary: (adults, kids, total) => `${adults} adults + ${kids} kids · ${total} guests`,
    showcaseEyebrow: 'Restaurant A visual planning pack',
    showcaseTitle: 'Compare the same room before and after theme styling',
    showcaseCopy: 'This planning pack helps families understand the room structure and how Castle, Space, and Forest styling affect the pre-quote story.',
    showcaseAlt: 'Restaurant A visual planning set',
    parentEyebrow: 'For parents comparing venues',
    parentTitle: 'Use this as a shortlist, then we confirm the real details',
    parentCopy: 'Narrow options by guests, budget, suburb, food needs, room rules and theme fit. This page does not make a live booking or charge a deposit.',
    choiceEyebrow: 'Common family choices',
    choiceTitle: 'How most parents can start without overthinking',
    choiceCopy: 'These are planning examples, not real customer reviews. They help families understand package and add-on choices quickly.',
    quickFilters: 'Quick filters',
    constraintsTitle: 'Start with real party constraints',
    area: 'Area / Suburb',
    distanceRadius: 'Distance radius',
    adults: 'Adults',
    kids: 'Kids',
    totalGuests: 'Total guests',
    childAgeRange: 'Child age range',
    budgetPerPerson: 'Budget per person',
    date: 'Date',
    time: 'Time',
    advancedFilters: 'Advanced filters',
    venueType: 'Venue type',
    anyVenueType: 'Any venue type',
    spaceType: 'Space type',
    anySpaceType: 'Any space type',
    culturalFit: 'Dietary and cultural fit',
    filterHelper: 'Use these as planning filters only. The team still confirms details with the venue or caterer.',
    themeFit: 'Theme fit',
    results: 'Results',
    resultsTitle: (count, guests, area) => `${count} venues for ${guests} guests near ${area}`,
    sortVenues: 'Sort venues',
    bestMatch: 'Best match',
    distance: 'Distance',
    price: 'Price',
    capacity: 'Capacity',
    noMatchTitle: 'No exact venue match yet',
    noMatchCopy: 'Try expanding distance, relaxing budget, or removing one theme/space restriction.',
    publicInfoSeed: 'Public info to confirm',
    planningVenue: 'Planning venue',
    matchScore: (score) => `${score}/100 match`,
    capacityRange: (min, max) => `${min}-${max} guests`,
    priceRange: (min, max) => `$${min}-$${max} pp`,
    priceRangeFull: (min, max) => `$${min}-$${max} per person`,
    publicSourceNote: 'Public source found · human confirmation required before customer quote',
    bestFor: 'Best for',
    visualFit: 'Visual fit',
    parentChecks: 'Parent checks before quote',
    usefulAddons: 'Useful add-ons for this venue',
    viewVenue: 'View venue',
    compared: 'Compared',
    compare: 'Compare',
    useForQuote: 'Use this venue for quote',
    comparison: 'Venue comparison',
    compareTitle: 'Compare up to 3 shortlisted venues',
    clearCompare: 'Clear compare',
    distanceFrom: (distance, area) => `${distance}km from ${area}`,
    budget: 'Budget',
    packageFit: 'Package fit',
    addonUpside: 'Add-on upside',
    foodCheck: 'Food check',
    allergyCheck: 'Allergy check',
    manualFamilyReview: 'Manual family requirements review',
    minSpend: 'Minimum spend',
    watchOuts: 'Watch-outs',
    useForQuoteShort: 'Use for quote',
    remove: 'Remove',
    beforeReference: 'Before venue reference',
    afterConcept: 'After styling concept',
    detailPublicSeed: 'Venue detail · public info to confirm',
    detailPlanningVenue: 'Venue detail · planning venue',
    suburb: 'Suburb',
    space: 'Space',
    kidFriendly: 'Kid friendly',
    allowsDecorations: 'Decorations allowed',
    allowsCake: 'Cake allowed',
    allowsPhotographer: 'Photographer allowed',
    allowsEntertainment: 'Entertainment allowed',
    hasDessertTableSpace: 'Dessert table space',
    hasPhotoZoneSpace: 'Photo zone space',
    balloonSetupPossible: 'Balloon setup possible',
    themePreviewAlt: 'Theme preview',
    recommendedHighValueAddons: 'Recommended high-value add-ons',
    addonReviewNote: 'These are planning suggestions. A human planner still confirms availability, supplier fit, and final quote details.',
    manualConfirmation: 'Still needs manual confirmation',
    opsChecks: 'Food, allergy and venue commercial checks',
    foodOptions: 'Food options',
    allergyNotes: 'Allergy notes',
    dietaryCulturalFit: 'Dietary / cultural fit',
    culturalPlanningNotes: 'Cultural planning notes',
    roomHire: 'Room hire',
    minimumSpend: 'Minimum spend',
    verification: 'Verification',
    publicSource: 'Public source',
    formalQuoteNote: 'These values are planning fields. Formal quotes require direct venue confirmation.',
    sourceUrlLabel: 'Source URL for team verification',
    closeDetail: 'Close detail',
    manualReviewRequired: 'Manual review required'
  }
};

const vfCopy = computed(() => venueFinderCopy[isZh.value ? 'zh' : 'en']);

const checkFilters = computed(() => [
  { key: 'kidFriendly', label: isZh.value ? '适合儿童' : 'Kid friendly' },
  { key: 'allowsDecorations', label: isZh.value ? '可布置装饰' : 'Allows decorations' },
  { key: 'allowsCake', label: isZh.value ? '可带蛋糕' : 'Allows cake' },
  { key: 'allowsPhotographer', label: isZh.value ? '可安排摄影' : 'Allows photographer' },
  { key: 'allowsEntertainment', label: isZh.value ? '可安排儿童娱乐' : 'Allows entertainment' },
  { key: 'parkingNearby', label: isZh.value ? '附近有停车' : 'Parking nearby' },
  { key: 'publicTransportNearby', label: isZh.value ? '公共交通方便' : 'Public transport nearby' },
  { key: 'hasDessertTableSpace', label: isZh.value ? '有甜品桌空间' : 'Dessert table space' },
  { key: 'hasPhotoZoneSpace', label: isZh.value ? '有拍照区空间' : 'Photo zone space' },
  { key: 'balloonSetupPossible', label: isZh.value ? '可做气球布置' : 'Balloon setup possible' }
]);

const culturalFilters = computed(() => [
  { key: 'halalFriendly', label: isZh.value ? '清真友好规划' : 'Halal-friendly planning' },
  { key: 'noPorkFriendly', label: isZh.value ? '无猪肉菜单规划' : 'No pork menu planning' },
  { key: 'noAlcoholFriendly', label: isZh.value ? '无酒精家庭环境' : 'No alcohol family setting' },
  { key: 'vegetarianFriendly', label: isZh.value ? '素食友好选项' : 'Vegetarian-friendly options' },
  { key: 'egglessCakeFriendly', label: isZh.value ? '可安排无蛋蛋糕' : 'Eggless cake possible' },
  { key: 'allergyAware', label: isZh.value ? '过敏需求复核' : 'Allergy-aware review' },
  { key: 'privateFamilyArea', label: isZh.value ? '独立 / 家庭空间' : 'Private / family area' }
]);

const themeFilters = computed(() => [
  { value: 'castle', label: isZh.value ? '适合城堡主题' : 'Castle suitable' },
  { value: 'space', label: isZh.value ? '适合太空主题' : 'Space suitable' },
  { value: 'forest', label: isZh.value ? '适合森林主题' : 'Forest suitable' },
  { value: 'neutral', label: isZh.value ? '中性 / 灵活场景' : 'Neutral / flexible' }
]);

const localizedVenueTypeOptions = computed(() => [
  { value: 'restaurant', label: isZh.value ? '餐厅' : 'Restaurant' },
  { value: 'private_dining_room', label: isZh.value ? '私人包间' : 'Private dining room' },
  { value: 'function_room', label: isZh.value ? '活动包房' : 'Function room' },
  { value: 'cafe', label: isZh.value ? '咖啡馆' : 'Cafe' },
  { value: 'indoor_play_venue', label: isZh.value ? '室内儿童活动场地' : 'Indoor play venue' },
  { value: 'community_hall', label: isZh.value ? '社区活动厅' : 'Community hall' }
]);

const localizedSpaceTypeOptions = computed(() => [
  { value: 'private_room', label: isZh.value ? '独立房间' : 'Private room' },
  { value: 'semi_private_area', label: isZh.value ? '半独立区域' : 'Semi-private area' },
  { value: 'open_dining_area', label: isZh.value ? '开放用餐区' : 'Open dining area' },
  { value: 'outdoor_area', label: isZh.value ? '户外区域' : 'Outdoor area' }
]);

const totalGuests = computed(() => Number(filters.adults || 0) + Number(filters.kids || 0));

const scoredVenues = computed(() => {
  const normalized = normalizeVenueFinderFilters(filters);
  return venueFinderFixtures.map((venue) => {
    const match = scoreVenueMatch(venue, normalized);
    return {
      ...venue,
      match,
      distance: match.distance
    };
  });
});

const filteredVenues = computed(() => scoredVenues.value.filter((venue) => {
  if (totalGuests.value < venue.capacityMin || totalGuests.value > venue.capacityMax) return false;
  if (venue.distance > Number(filters.radiusKm)) return false;
  if (filters.venueType && venue.venueType !== filters.venueType) return false;
  if (filters.spaceType && venue.spaceType !== filters.spaceType) return false;

  const boolKeys = [...checkFilters.value, ...culturalFilters.value].map((item) => item.key);
  if (boolKeys.some((key) => filters[key] && !venue[key])) return false;

  if (filters.themes.length && !filters.themes.some((theme) => venue.suitableThemes.includes(theme))) return false;

  return true;
}));

const sortedVenues = computed(() => {
  const result = [...filteredVenues.value];
  if (sortBy.value === 'distance') return result.sort((a, b) => a.distance - b.distance);
  if (sortBy.value === 'price') return result.sort((a, b) => a.pricePerPersonMin - b.pricePerPersonMin);
  if (sortBy.value === 'capacity') return result.sort((a, b) => b.capacityMax - a.capacityMax);
  return result.sort((a, b) => b.match.score - a.match.score);
});

const compareVenues = computed(() => compareSelectedIds.value
  .map((id) => sortedVenues.value.find((venue) => venue.id === id) || venueFinderFixtures.find((venue) => venue.id === id))
  .filter(Boolean)
  .map((venue) => {
    if (venue.match) return venue;
    const match = scoreVenueMatch(venue, normalizeVenueFinderFilters(filters));
    return { ...venue, match, distance: match.distance };
  }));

function venueTypeLabel(type) {
  if (isZh.value) return localizedVenueTypeOptions.value.find((item) => item.value === type)?.label || venueTypeLabels[type] || type;
  return venueTypeLabels[type] || type;
}

function spaceTypeLabel(type) {
  if (isZh.value) return localizedSpaceTypeOptions.value.find((item) => item.value === type)?.label || spaceTypeLabels[type] || type;
  return spaceTypeLabels[type] || type;
}

function themeLabel(theme) {
  if (isZh.value) {
    const zh = {
      castle: '城堡主题',
      space: '太空主题',
      forest: '森林主题',
      neutral: '灵活主题'
    };
    return zh[theme] || themeLabels[theme] || theme;
  }
  return themeLabels[theme] || theme;
}

function themePreviewImages(venue) {
  if (venue.beforeImage && venue.afterImage) return [venue.beforeImage, venue.afterImage, venue.image].filter(Boolean);
  const themeToImage = {
    castle: '/party-assets/venues/restaurant-a/restaurant-a-castle-standard.png',
    space: '/party-assets/venues/restaurant-a/restaurant-a-space-standard.png',
    forest: '/party-assets/venues/restaurant-a/restaurant-a-forest-standard.png',
    neutral: '/party-assets/venues/restaurant-a/restaurant-a-original.png'
  };
  return (venue.suitableThemes || []).slice(0, 3).map((theme) => themeToImage[theme]).filter(Boolean);
}

function visualFitLabel(venue) {
  const strengths = [];
  if (venue.hasDessertTableSpace) strengths.push(isZh.value ? '甜品桌' : 'dessert table');
  if (venue.hasPhotoZoneSpace) strengths.push(isZh.value ? '拍照区' : 'photo zone');
  if (venue.balloonSetupPossible) strengths.push(isZh.value ? '气球布置' : 'balloon setup');
  return strengths.slice(0, 2).join(' + ') || (isZh.value ? '轻量布置' : 'light styling');
}

function culturalFitLabels(venue) {
  const checks = [
    ['halalFriendly', isZh.value ? '清真友好' : 'Halal-friendly'],
    ['noPorkFriendly', isZh.value ? '无猪肉' : 'No pork'],
    ['noAlcoholFriendly', isZh.value ? '无酒精' : 'No alcohol'],
    ['vegetarianFriendly', isZh.value ? '素食选项' : 'Vegetarian'],
    ['egglessCakeFriendly', isZh.value ? '无蛋蛋糕' : 'Eggless cake'],
    ['allergyAware', isZh.value ? '过敏友好' : 'Allergy-aware'],
    ['privateFamilyArea', isZh.value ? '家庭独立区' : 'Private family area']
  ];
  return checks.filter(([key]) => venue?.[key]).map(([, label]) => label);
}

function recommendedAddOns(venue) {
  return recommendAddOnServicesForVenue(venue, normalizeVenueFinderFilters(filters), isZh.value ? 'zh' : 'en');
}

function venueOps(venue) {
  return getVenueOperationalReadiness(venue);
}

function localizedAddonName(addon) {
  return isZh.value ? (addon.zhName || addon.name_zh || addon.name) : addon.name;
}

function localizedPackageFit(venue) {
  if (!isZh.value) return venue.packageFit || [];
  const map = { Basic: '基础套餐', Standard: '标准套餐', Premium: '尊享套餐', basic: '基础套餐', standard: '标准套餐', premium: '尊享套餐' };
  return (venue.packageFit || []).map((item) => map[item] || item);
}

function localizedVenueName(venue) {
  const name = String(venue?.name || '');
  if (!isZh.value) return name;
  return name
    .replace(' · public research seed', '')
    .replace(' · local planning candidate', '')
    .replace('Restaurant A Private Dining', '餐厅 A 私人包间');
}

function localizedVenueDescription(venue) {
  const text = String(venue?.shortDescription || '');
  if (!isZh.value) return text;
  if (text.includes('blank-canvas community/function')) return '适合灵活布置的 Marrickville 社区活动空间，正式可用性需人工确认。';
  if (text.includes('private dining room')) return 'Marrickville 私人包间场地，适合家庭生日派对，正式容量和最低消费需人工确认。';
  if (text.includes('space-themed kids cafe')) return 'Marrickville 太空主题儿童咖啡和活动空间，适合亲子生日派对，细节需人工确认。';
  if (text.includes('active Mascot birthday-party')) return 'Mascot 动感生日派对场地，适合希望孩子有活动体验的家庭，细节需人工确认。';
  return localizeOperationalText(text);
}

function localizeOperationalText(text) {
  if (!isZh.value) return text;
  return String(text || '')
    .replaceAll('Room hire', '包间费')
    .replaceAll('Minimum spend', '最低消费')
    .replaceAll('Manual confirmation required', '需要人工确认')
    .replaceAll('Venue confirmation required', '需要向场地方确认')
    .replaceAll('owner call required', '需要团队电话确认')
    .replaceAll('Public source', '公开资料')
    .replaceAll('Local/staging', '预览')
    .replaceAll('local/staging', '预览')
    .replaceAll('staging', '预览')
    .replaceAll('fixture', '样例')
    .replaceAll('demo', '演示')
    .replaceAll('Food provider must be confirmed', '需确认餐饮供应安排')
    .replaceAll('Allergy handling is not verified in this sample; human review required.', '过敏处理需团队人工复核。')
    .replaceAll('Allergy handling is not verified in this fixture; human review required.', '过敏处理需团队人工复核。')
    .replaceAll('Allergy handling', '过敏处理')
    .replaceAll('not verified', '尚未确认')
    .replaceAll('human review required', '需要人工复核')
    .replaceAll('venue confirmation', '场地确认')
    .replaceAll('venue', '场地')
    .replaceAll('Venue', '场地')
    .replaceAll('basic / standard / premium', '基础套餐 / 标准套餐 / 尊享套餐')
    .replaceAll('standard / premium', '标准套餐 / 尊享套餐')
    .replaceAll('basic / standard', '基础套餐 / 标准套餐')
    .replaceAll('Parking limited', '停车位有限')
    .replaceAll('Bring-own cake rules must be confirmed', '需确认自带蛋糕规则')
    .replaceAll('Decoration setup time must be confirmed', '需确认布置进场时间')
    .replaceAll('External entertainment requires approval', '外部儿童娱乐需场地方同意')
    .replaceAll('Confirm', '确认')
    .replaceAll('confirmed', '已确认');
}

function localizedOps(venue) {
  const ops = venueOps(venue);
  return {
    ...ops,
    foodOptions: (ops.foodOptions || []).map(localizeOperationalText),
    allergyNotes: (ops.allergyNotes || []).map(localizeOperationalText),
    minimumSpendHint: localizeOperationalText(ops.minimumSpendHint),
    roomHireHint: localizeOperationalText(ops.roomHireHint),
    verificationStatus: isZh.value ? '报价前需人工复核' : localizeOperationalText(ops.verificationStatus)
  };
}

function localizedRestrictions(venue) {
  return (venue.restrictions || []).map(localizeOperationalText);
}

function localizedCulturalNotes(venue) {
  return (venue.culturalFitNotes || []).map(localizeOperationalText);
}

function isCompared(venue) {
  return compareSelectedIds.value.includes(venue.id);
}

function applyFamilySample() {
  filters.area = 'Marrickville';
  filters.radiusKm = 10;
  filters.adults = 10;
  filters.kids = 20;
  filters.childAgeRange = '9_12';
  filters.budgetPerPerson = '25_45';
  filters.venueType = '';
  filters.spaceType = '';
  filters.kidFriendly = true;
  filters.allowsDecorations = true;
  filters.allowsCake = true;
  filters.allowsPhotographer = true;
  filters.allowsEntertainment = false;
  filters.parkingNearby = false;
  filters.publicTransportNearby = true;
  filters.themes = [];
  filters.hasDessertTableSpace = true;
  filters.hasPhotoZoneSpace = true;
  filters.balloonSetupPossible = true;
  filters.halalFriendly = false;
  filters.noPorkFriendly = false;
  filters.noAlcoholFriendly = false;
  filters.vegetarianFriendly = true;
  filters.egglessCakeFriendly = true;
  filters.allergyAware = true;
  filters.privateFamilyArea = false;
}

function resetFilters() {
  filters.area = 'Marrickville';
  filters.radiusKm = 10;
  filters.adults = 10;
  filters.kids = 20;
  filters.childAgeRange = '9_12';
  filters.budgetPerPerson = '25_45';
  filters.eventDate = '';
  filters.eventTime = '';
  filters.venueType = '';
  filters.spaceType = '';
  filters.kidFriendly = false;
  filters.allowsDecorations = false;
  filters.allowsCake = false;
  filters.allowsPhotographer = false;
  filters.allowsEntertainment = false;
  filters.parkingNearby = false;
  filters.publicTransportNearby = false;
  filters.themes = [];
  filters.hasDessertTableSpace = false;
  filters.hasPhotoZoneSpace = false;
  filters.balloonSetupPossible = false;
  filters.halalFriendly = false;
  filters.noPorkFriendly = false;
  filters.noAlcoholFriendly = false;
  filters.vegetarianFriendly = false;
  filters.egglessCakeFriendly = false;
  filters.allergyAware = false;
  filters.privateFamilyArea = false;
  compareSelectedIds.value = [];
}

function openVenue(venue) {
  selectedVenue.value = venue;
  router.replace({ path: `/venue-finder/${venue.id}` });
  nextTick(() => {
    document.getElementById(venue.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

function compareVenue(venue) {
  const index = compareSelectedIds.value.indexOf(venue.id);
  if (index >= 0) {
    compareSelectedIds.value.splice(index, 1);
    return;
  }
  if (compareSelectedIds.value.length >= 3) {
    compareSelectedIds.value.shift();
  }
  compareSelectedIds.value.push(venue.id);
  selectedVenue.value = venue;
}

function clearCompare() {
  compareSelectedIds.value = [];
}

function useVenueForQuote(venue) {
  const payload = saveVenueFinderQuotePrefill(venue, filters);
  const theme = payload?.selection?.themeId || 'space';
  const pkg = payload?.selection?.packageId || 'standard';
  router.push({
    path: '/quote',
    query: {
      source: 'venue_finder',
      venue: venue.id,
      theme,
      scene: 'restaurant-a',
      package: pkg,
      halal: filters.halalFriendly ? '1' : undefined,
      noPork: filters.noPorkFriendly ? '1' : undefined,
      noAlcohol: filters.noAlcoholFriendly ? '1' : undefined,
      vegetarian: filters.vegetarianFriendly ? '1' : undefined,
      egglessCake: filters.egglessCakeFriendly ? '1' : undefined,
      allergyAware: filters.allergyAware ? '1' : undefined,
      privateFamilyArea: filters.privateFamilyArea ? '1' : undefined
    }
  });
}

watch(
  () => route.params.id,
  (id) => {
    selectedVenue.value = id ? getVenueFinderById(id) : null;
  },
  { immediate: true }
);
</script>

<style scoped>
.venue-finder-page {
  min-height: 100vh;
  padding: 96px 24px 56px;
  background: #f6f8fb;
  color: #172033;
}

.finder-hero,
.showcase-strip,
.trust-strip,
.finder-layout,
.compare-panel,
.detail-panel {
  max-width: 1240px;
  margin: 0 auto 24px;
}

.finder-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  gap: 22px;
  align-items: stretch;
  border: 1px solid #e5eaf3;
  border-radius: 8px;
  background:
    linear-gradient(110deg, rgba(255, 255, 255, 0.96), rgba(255, 248, 244, 0.92)),
    url('/party-assets/venues/restaurant-a/restaurant-a-castle-standard.png') center/cover;
  padding: 32px;
  box-shadow: 0 18px 45px rgba(31, 42, 68, 0.08);
}

.finder-hero h1 {
  max-width: 760px;
  margin: 0 0 12px;
  font-size: clamp(34px, 5vw, 58px);
  line-height: 1.02;
}

.finder-hero p {
  max-width: 740px;
  color: #5a6578;
  line-height: 1.7;
}

.eyebrow {
  margin: 0 0 8px;
  color: #7c3aed;
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.hero-actions,
.card-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 18px;
}

button,
select,
input {
  font: inherit;
}

button {
  border: 1px solid #cfd7e6;
  border-radius: 8px;
  background: #fff;
  color: #172033;
  font-weight: 800;
  padding: 10px 14px;
  cursor: pointer;
}

button.primary {
  border-color: #2563eb;
  background: #2563eb;
  color: #fff;
}

button.selected {
  border-color: #7c3aed;
  background: #f3e8ff;
  color: #5b21b6;
}

.showcase-strip {
  display: grid;
  grid-template-columns: minmax(0, 0.72fr) minmax(360px, 1.28fr);
  gap: 20px;
  align-items: center;
  border: 1px solid #e1e8f4;
  border-radius: 8px;
  background: #fff;
  padding: 18px;
  box-shadow: 0 14px 35px rgba(31, 42, 68, 0.06);
}

.trust-strip {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(300px, 0.9fr);
  gap: 18px;
  border: 1px solid #dbeafe;
  border-radius: 8px;
  background: linear-gradient(135deg, #eff6ff, #fff7ed);
  padding: 22px;
  box-shadow: 0 14px 36px rgba(31, 42, 68, 0.07);
}

.choice-proof-strip {
  max-width: 1240px;
  margin: 0 auto 24px;
  border: 1px solid #f5d0fe;
  border-radius: 8px;
  background: #fff;
  padding: 22px;
  box-shadow: 0 14px 36px rgba(31, 42, 68, 0.06);
}

.choice-proof-heading {
  max-width: 760px;
  margin-bottom: 16px;
}

.choice-proof-heading h2 {
  margin: 0 0 8px;
}

.choice-proof-heading p {
  margin: 0;
  color: #5a6578;
  line-height: 1.65;
}

.choice-proof-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.choice-proof-grid article {
  border-radius: 8px;
  background: linear-gradient(135deg, #faf5ff, #fff7ed);
  padding: 16px;
}

.choice-proof-grid span {
  color: #7c3aed;
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
}

.choice-proof-grid h3 {
  margin: 6px 0;
}

.choice-proof-grid p,
.choice-proof-grid small {
  color: #5a6578;
  line-height: 1.55;
}

.choice-proof-grid ul {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 12px 0;
  padding: 0;
  list-style: none;
}

.choice-proof-grid li {
  border-radius: 999px;
  background: #fff;
  color: #6d28d9;
  padding: 6px 9px;
  font-size: 12px;
  font-weight: 800;
}

.trust-strip h2 {
  margin: 0 0 8px;
}

.trust-strip p {
  margin: 0;
  color: #475569;
}

.trust-strip ul {
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.trust-strip li {
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.78);
  color: #1e3a8a;
  padding: 10px 12px;
  font-weight: 650;
}

.showcase-copy h2 {
  margin: 0 0 10px;
  font-size: clamp(24px, 3vw, 36px);
  line-height: 1.08;
}

.showcase-copy p:last-child {
  color: #5a6578;
  line-height: 1.65;
}

.showcase-strip > img {
  width: 100%;
  min-height: 250px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #e5eaf3;
  display: block;
}

.hero-card {
  display: grid;
  place-items: center;
  text-align: center;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #e1e8f4;
  padding: 22px;
}

.hero-card strong {
  color: #2563eb;
  font-size: 60px;
  line-height: 1;
}

.hero-card span {
  font-weight: 900;
}

.hero-card small {
  color: #667085;
}

.finder-layout {
  display: grid;
  grid-template-columns: 330px minmax(0, 1fr);
  gap: 22px;
  align-items: start;
}

.filter-panel,
.results-panel,
.detail-panel {
  border: 1px solid #e1e8f4;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 14px 35px rgba(31, 42, 68, 0.06);
}

.filter-panel {
  position: sticky;
  top: 84px;
  padding: 20px;
}

.filter-panel label {
  display: grid;
  gap: 7px;
  margin-bottom: 14px;
  color: #344054;
  font-size: 13px;
  font-weight: 800;
}

.filter-panel select,
.filter-panel input {
  width: 100%;
  border: 1px solid #d8deea;
  border-radius: 8px;
  background: #fff;
  color: #172033;
  min-height: 40px;
  padding: 8px 10px;
}

.inline-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.total-guests {
  margin: -4px 0 14px;
  color: #5b667a;
}

.panel-divider {
  height: 1px;
  margin: 16px 0;
  background: #edf1f7;
}

.check-grid {
  display: grid;
  gap: 8px;
}

.check-row {
  display: flex !important;
  grid-template-columns: none !important;
  align-items: center;
  gap: 8px !important;
  margin: 0 !important;
  font-weight: 700 !important;
}

.check-row input {
  width: 16px;
  min-height: 16px;
}

.filter-helper {
  margin: -6px 0 10px;
  color: #667085;
  font-size: 12px;
  line-height: 1.45;
}

.results-panel {
  padding: 22px;
}

.results-toolbar {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  margin-bottom: 18px;
}

.results-toolbar h2 {
  margin: 0;
}

.results-toolbar select {
  border: 1px solid #d8deea;
  border-radius: 8px;
  min-height: 40px;
  padding: 8px 10px;
}

.empty-state {
  border: 1px dashed #cfd7e6;
  border-radius: 8px;
  background: #f8fafc;
  padding: 30px;
  text-align: center;
}

.venue-card-grid {
  display: grid;
  gap: 16px;
}

.venue-card {
  display: grid;
  grid-template-columns: 250px minmax(0, 1fr);
  gap: 16px;
  border: 1px solid #e3e9f3;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
}

.venue-card.is-selected {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.venue-card-media {
  position: relative;
  min-height: 240px;
  overflow: hidden;
  background: #eef2f7;
}

.venue-card-media > img,
.detail-media img {
  width: 100%;
  height: 100%;
  min-height: 220px;
  object-fit: cover;
  display: block;
}

.demo-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.78);
  color: #fff;
  font-size: 11px;
  font-weight: 900;
  padding: 6px 9px;
}

.demo-badge.is-research {
  background: rgba(14, 116, 144, 0.86);
}

.research-note {
  margin: 8px 0 0;
  border-left: 3px solid #0891b2;
  background: #ecfeff;
  color: #155e75;
  padding: 8px 10px;
  border-radius: 8px;
  font-size: 0.84rem;
  font-weight: 800;
}

.media-thumbs {
  position: absolute;
  right: 12px;
  bottom: 12px;
  display: grid;
  grid-template-columns: repeat(3, 48px);
  gap: 6px;
}

.media-thumbs img {
  width: 48px;
  height: 42px;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.9);
  border-radius: 6px;
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.18);
}

.venue-card-body {
  padding: 18px 18px 18px 0;
}

.venue-card-title {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.venue-card-title h3 {
  margin: 4px 0 8px;
}

.match-score {
  display: inline-flex;
  border-radius: 999px;
  background: #ecfdf3;
  color: #047857;
  font-size: 12px;
  font-weight: 900;
  padding: 4px 8px;
}

.match-bar {
  height: 7px;
  overflow: hidden;
  border-radius: 999px;
  background: #e5eaf3;
  margin: 8px 0 12px;
}

.match-bar span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #38bdf8, #2563eb, #7c3aed);
}

.tag-row,
.capability-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 10px 0;
}

.tag-row span,
.capability-list span {
  border-radius: 999px;
  background: #eef2ff;
  color: #4338ca;
  font-size: 12px;
  font-weight: 800;
  padding: 5px 9px;
}

.tag-row.is-muted span {
  background: #f1f5f9;
  color: #475569;
}

.tag-row.cultural-fit-row span {
  background: #ecfdf3;
  color: #047857;
}

.fit-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin: 12px 0;
}

.fit-grid div {
  border-radius: 8px;
  background: #f8fafc;
  border: 1px solid #edf1f7;
  padding: 10px;
}

.fit-grid small {
  display: block;
  color: #667085;
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
}

.fit-grid strong {
  display: block;
  margin-top: 4px;
  color: #172033;
}

.parent-checks {
  display: grid;
  gap: 6px;
  margin-top: 12px;
  border: 1px solid #fde68a;
  border-radius: 8px;
  background: #fffbeb;
  padding: 10px;
}

.parent-checks small {
  color: #92400e;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.parent-checks span {
  color: #78350f;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.35;
}

.recommended-addons {
  display: grid;
  gap: 8px;
  margin-top: 12px;
  border: 1px solid #e3ecfb;
  border-radius: 8px;
  background: #f8fbff;
  padding: 10px;
}

.recommended-addons small {
  color: #31537d;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.recommended-addons div {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.recommended-addons span {
  border: 1px solid #d8e4f5;
  border-radius: 999px;
  background: #fff;
  color: #243b5a;
  font-size: 12px;
  font-weight: 800;
  padding: 6px 8px;
}

.recommended-addons.is-detail {
  margin: 16px 0;
  background: #fff8ed;
  border-color: #fed7aa;
}

.recommended-addons.is-detail p {
  margin: 0;
  color: #7c4a03;
  line-height: 1.55;
}

.why-match {
  color: #475467;
  font-weight: 700;
}

.compare-panel {
  border: 1px solid #dbe4f2;
  border-radius: 8px;
  background: linear-gradient(135deg, #ffffff, #f8fafc);
  padding: 22px;
  box-shadow: 0 14px 35px rgba(31, 42, 68, 0.06);
}

.compare-heading {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  margin-bottom: 16px;
}

.compare-heading h2 {
  margin: 0;
}

.compare-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 14px;
}

.compare-card {
  display: grid;
  gap: 10px;
  border: 1px solid #e1e8f4;
  border-radius: 8px;
  background: #fff;
  padding: 12px;
}

.compare-card img {
  width: 100%;
  height: 140px;
  object-fit: cover;
  border-radius: 6px;
}

.compare-card h3 {
  margin: 0;
}

.compare-card dl {
  display: grid;
  gap: 8px;
  margin: 0;
}

.compare-card dl div {
  border-radius: 6px;
  background: #f8fafc;
  padding: 8px;
}

.detail-panel {
  display: grid;
  grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr);
  gap: 22px;
  padding: 22px;
}

.detail-media {
  overflow: hidden;
  border-radius: 8px;
  background: #eef2f7;
}

.before-after-strip {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  padding: 10px;
  background: #f8fafc;
}

.before-after-strip figure {
  margin: 0;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #fff;
}

.before-after-strip img {
  width: 100%;
  height: 150px;
  min-height: 150px;
  object-fit: cover;
}

.before-after-strip figcaption {
  padding: 8px 10px;
  color: #475569;
  font-size: 0.78rem;
  font-weight: 900;
}

.source-link {
  overflow-wrap: anywhere;
  color: #475569;
  line-height: 1.5;
}

.source-link a {
  color: #0f766e;
  font-weight: 800;
}

.detail-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.detail-list div {
  border-radius: 8px;
  background: #f8fafc;
  padding: 12px;
}

dt {
  color: #667085;
  font-size: 12px;
  font-weight: 800;
}

dd {
  margin: 4px 0 0;
  color: #172033;
  font-weight: 900;
}

.restriction-box {
  margin-top: 14px;
  border-radius: 8px;
  background: #fff7ed;
  color: #9a3412;
  padding: 14px;
}

.restriction-box dl {
  display: grid;
  gap: 8px;
  margin: 10px 0 0;
}

.restriction-box dl div {
  display: grid;
  grid-template-columns: 130px minmax(0, 1fr);
  gap: 10px;
}

.restriction-box dt {
  font-weight: 900;
}

.restriction-box dd {
  margin: 0;
  color: #7c2d12;
}

.ops-readiness-box {
  background: #eef2ff;
  color: #3730a3;
}

.ops-readiness-box dd {
  color: #312e81;
}

.ops-readiness-box p {
  margin: 10px 0 0;
  color: #4338ca;
  line-height: 1.55;
}

.detail-render-strip {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin: 14px 0;
}

.detail-render-strip img {
  width: 100%;
  height: 92px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #e5eaf3;
}

@media (max-width: 960px) {
  .finder-hero,
  .showcase-strip,
  .trust-strip,
  .choice-proof-grid,
  .finder-layout,
  .detail-panel,
  .venue-card {
    grid-template-columns: 1fr;
  }

  .filter-panel {
    position: static;
  }

  .venue-card-body {
    padding: 0 18px 18px;
  }
}
</style>
