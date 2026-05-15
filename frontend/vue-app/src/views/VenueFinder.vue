<template>
  <main class="venue-finder-page">
    <section class="finder-hero">
      <div>
        <p class="eyebrow">Venue / Restaurant Finder · local staging prototype</p>
        <h1>Find a venue by guests, suburb, budget, and party fit</h1>
        <p>
          Start with the practical constraints first: 10 adults, 20 kids, medium budget,
          Marrickville or Mascot nearby, and decoration-friendly venues. No Google Maps,
          no real restaurant database, and no booking is triggered.
        </p>
        <div class="hero-actions">
          <button class="primary" type="button" @click="applyFamilySample">Use 30 guest family sample</button>
          <button type="button" @click="resetFilters">Reset filters</button>
        </div>
      </div>
      <div class="hero-card">
        <strong>{{ filteredVenues.length }}</strong>
        <span>matching local/staging venues</span>
        <small>{{ filters.adults }} adults + {{ filters.kids }} kids · {{ totalGuests }} guests</small>
      </div>
    </section>

    <section class="showcase-strip">
      <div class="showcase-copy">
        <p class="eyebrow">Restaurant A visual planning pack</p>
        <h2>Compare the same room before and after theme styling</h2>
        <p>
          This local/staging asset keeps the room structure stable while showing how
          Castle, Space, and Forest decor layers change the customer-facing quote story.
        </p>
      </div>
      <img src="/party-assets/venues/restaurant-a/restaurant-a-showcase.png" alt="Restaurant A visual planning set" />
    </section>

    <section class="finder-layout">
      <aside class="filter-panel">
        <div class="panel-heading">
          <p class="eyebrow">Quick filters</p>
          <h2>Start with real party constraints</h2>
        </div>

        <label>
          Area / Suburb
          <select v-model="filters.area">
            <option v-for="area in areaOptions" :key="area" :value="area">{{ area }}</option>
          </select>
        </label>

        <label>
          Distance radius
          <select v-model.number="filters.radiusKm">
            <option :value="1">1km</option>
            <option :value="3">3km</option>
            <option :value="5">5km</option>
            <option :value="10">10km</option>
          </select>
        </label>

        <div class="inline-fields">
          <label>
            Adults
            <input v-model.number="filters.adults" min="0" type="number" />
          </label>
          <label>
            Kids
            <input v-model.number="filters.kids" min="0" type="number" />
          </label>
        </div>
        <p class="total-guests">Total guests: <strong>{{ totalGuests }}</strong></p>

        <label>
          Child age range
          <select v-model="filters.childAgeRange">
            <option value="3_5">3-5</option>
            <option value="6_8">6-8</option>
            <option value="9_12">9-12</option>
            <option value="13_plus">13+</option>
          </select>
        </label>

        <label>
          Budget per person
          <select v-model="filters.budgetPerPerson">
            <option value="under_25">Under $25</option>
            <option value="25_45">$25-$45</option>
            <option value="45_70">$45-$70</option>
            <option value="70_plus">$70+</option>
          </select>
        </label>

        <div class="inline-fields">
          <label>
            Date
            <input v-model="filters.eventDate" type="date" />
          </label>
          <label>
            Time
            <input v-model="filters.eventTime" type="time" />
          </label>
        </div>

        <div class="panel-divider"></div>
        <p class="eyebrow">Advanced filters</p>

        <label>
          Venue type
          <select v-model="filters.venueType">
            <option value="">Any venue type</option>
            <option value="restaurant">Restaurant</option>
            <option value="private_dining_room">Private dining room</option>
            <option value="function_room">Function room</option>
            <option value="cafe">Cafe</option>
            <option value="indoor_play_venue">Indoor play venue</option>
            <option value="community_hall">Community hall</option>
          </select>
        </label>

        <label>
          Space type
          <select v-model="filters.spaceType">
            <option value="">Any space type</option>
            <option value="private_room">Private room</option>
            <option value="semi_private_area">Semi-private area</option>
            <option value="open_dining_area">Open dining area</option>
            <option value="outdoor_area">Outdoor area</option>
          </select>
        </label>

        <div class="check-grid">
          <label v-for="check in checkFilters" :key="check.key" class="check-row">
            <input v-model="filters[check.key]" type="checkbox" />
            <span>{{ check.label }}</span>
          </label>
        </div>

        <div class="panel-divider"></div>
        <p class="eyebrow">Theme fit</p>
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
            <p class="eyebrow">Results</p>
            <h2>{{ filteredVenues.length }} venues for {{ totalGuests }} guests near {{ filters.area }}</h2>
          </div>
          <select v-model="sortBy" aria-label="Sort venues">
            <option value="match">Best match</option>
            <option value="distance">Distance</option>
            <option value="price">Price</option>
            <option value="capacity">Capacity</option>
          </select>
        </div>

        <div v-if="filteredVenues.length === 0" class="empty-state">
          <h3>No exact venue match yet</h3>
          <p>Try expanding distance, relaxing budget, or removing one theme/space restriction.</p>
          <button class="primary" type="button" @click="resetFilters">Reset filters</button>
        </div>

        <div v-else class="venue-card-grid">
          <article
            v-for="venue in sortedVenues"
            :key="venue.id"
            class="venue-card"
            :class="{ 'is-selected': selectedVenue?.id === venue.id }"
          >
            <div class="venue-card-media">
              <img :src="venue.image" :alt="venue.name" />
              <span class="demo-badge">Demo venue</span>
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
                  <span class="match-score">{{ venue.match.score }}/100 match</span>
                  <h3>{{ venue.name }}</h3>
                </div>
                <strong>{{ venue.distance }}km</strong>
              </div>
              <div class="match-bar" aria-hidden="true">
                <span :style="{ width: `${venue.match.score}%` }"></span>
              </div>
              <p>{{ venue.shortDescription }}</p>
              <div class="tag-row">
                <span>{{ venue.suburb }}</span>
                <span>{{ venueTypeLabel(venue.venueType) }}</span>
                <span>{{ venue.capacityMin }}-{{ venue.capacityMax }} guests</span>
                <span>${{ venue.pricePerPersonMin }}-${{ venue.pricePerPersonMax }} pp</span>
              </div>
              <div class="tag-row is-muted">
                <span v-for="theme in venue.suitableThemes" :key="theme">{{ themeLabel(theme) }}</span>
              </div>
              <div class="fit-grid">
                <div>
                  <small>Best for</small>
                  <strong>{{ venue.packageFit.join(' / ') }}</strong>
                </div>
                <div>
                  <small>Visual fit</small>
                  <strong>{{ visualFitLabel(venue) }}</strong>
                </div>
              </div>
              <p class="why-match">{{ venue.match.reasons.join(' · ') || venue.whyMatch }}</p>
              <div class="card-actions">
                <button type="button" @click="openVenue(venue)">View venue</button>
                <button type="button" :class="{ selected: isCompared(venue) }" @click="compareVenue(venue)">
                  {{ isCompared(venue) ? 'Compared' : 'Compare' }}
                </button>
                <button class="primary" type="button" @click="useVenueForQuote(venue)">Use this venue for quote</button>
              </div>
            </div>
          </article>
        </div>
      </section>
    </section>

    <section v-if="compareVenues.length" class="compare-panel">
      <div class="compare-heading">
        <div>
          <p class="eyebrow">Venue comparison</p>
          <h2>Compare up to 3 shortlisted venues</h2>
        </div>
        <button type="button" @click="clearCompare">Clear compare</button>
      </div>
      <div class="compare-grid">
        <article v-for="venue in compareVenues" :key="venue.id" class="compare-card">
          <img :src="venue.image" :alt="venue.name" />
          <h3>{{ venue.name }}</h3>
          <dl>
            <div><dt>Distance</dt><dd>{{ venue.distance }}km from {{ filters.area }}</dd></div>
            <div><dt>Capacity</dt><dd>{{ venue.capacityMin }}-{{ venue.capacityMax }} guests</dd></div>
            <div><dt>Budget</dt><dd>${{ venue.pricePerPersonMin }}-${{ venue.pricePerPersonMax }} pp</dd></div>
            <div><dt>Package fit</dt><dd>{{ venue.packageFit.join(' / ') }}</dd></div>
            <div><dt>Theme fit</dt><dd>{{ venue.suitableThemes.map(themeLabel).join(' / ') }}</dd></div>
            <div><dt>Watch-outs</dt><dd>{{ venue.restrictions.join(' · ') }}</dd></div>
          </dl>
          <button class="primary" type="button" @click="useVenueForQuote(venue)">Use for quote</button>
          <button type="button" @click="compareVenue(venue)">Remove</button>
        </article>
      </div>
    </section>

    <section v-if="selectedVenue" class="detail-panel" :id="selectedVenue.id">
      <div class="detail-media">
        <img :src="selectedVenue.image" :alt="selectedVenue.name" />
      </div>
      <article>
        <p class="eyebrow">Venue detail · staging fixture</p>
        <h2>{{ selectedVenue.name }}</h2>
        <p>{{ selectedVenue.shortDescription }}</p>
        <dl class="detail-list">
          <div><dt>Suburb</dt><dd>{{ selectedVenue.suburb }}</dd></div>
          <div><dt>Capacity</dt><dd>{{ selectedVenue.capacityMin }}-{{ selectedVenue.capacityMax }} guests</dd></div>
          <div><dt>Budget</dt><dd>${{ selectedVenue.pricePerPersonMin }}-${{ selectedVenue.pricePerPersonMax }} per person</dd></div>
          <div><dt>Space</dt><dd>{{ spaceTypeLabel(selectedVenue.spaceType) }}</dd></div>
          <div><dt>Package fit</dt><dd>{{ selectedVenue.packageFit.join(' / ') }}</dd></div>
          <div><dt>Theme fit</dt><dd>{{ selectedVenue.suitableThemes.map(themeLabel).join(' / ') }}</dd></div>
        </dl>
        <div class="capability-list">
          <span v-if="selectedVenue.kidFriendly">Kid friendly</span>
          <span v-if="selectedVenue.allowsDecorations">Decorations allowed</span>
          <span v-if="selectedVenue.allowsCake">Cake allowed</span>
          <span v-if="selectedVenue.allowsPhotographer">Photographer allowed</span>
          <span v-if="selectedVenue.allowsEntertainment">Entertainment allowed</span>
          <span v-if="selectedVenue.hasDessertTableSpace">Dessert table space</span>
          <span v-if="selectedVenue.hasPhotoZoneSpace">Photo zone space</span>
          <span v-if="selectedVenue.balloonSetupPossible">Balloon setup possible</span>
        </div>
        <div class="detail-render-strip">
          <img
            v-for="preview in themePreviewImages(selectedVenue)"
            :key="preview"
            :src="preview"
            alt="Restaurant A theme preview"
          />
        </div>
        <div class="restriction-box">
          <strong>Still needs manual confirmation</strong>
          <ul>
            <li v-for="item in selectedVenue.restrictions" :key="item">{{ item }}</li>
          </ul>
        </div>
        <div class="hero-actions">
          <button class="primary" type="button" @click="useVenueForQuote(selectedVenue)">Use this venue for quote</button>
          <button type="button" @click="selectedVenue = null">Close detail</button>
        </div>
      </article>
    </section>
  </main>
</template>

<script setup>
import { computed, nextTick, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  getVenueFinderById,
  spaceTypeLabels,
  themeLabels,
  venueFinderAreaOptions,
  venueFinderFixtures,
  venueTypeLabels
} from '@/data/venueFinderFixtures';
import { normalizeVenueFinderFilters, saveVenueFinderQuotePrefill, scoreVenueMatch } from '@/services/venueFinderService';

const route = useRoute();
const router = useRouter();

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
  balloonSetupPossible: true
});

const sortBy = ref('match');
const selectedVenue = ref(null);
const compareSelectedIds = ref([]);

const areaOptions = venueFinderAreaOptions;

const checkFilters = [
  { key: 'kidFriendly', label: 'Kid friendly' },
  { key: 'allowsDecorations', label: 'Allows decorations' },
  { key: 'allowsCake', label: 'Allows cake' },
  { key: 'allowsPhotographer', label: 'Allows photographer' },
  { key: 'allowsEntertainment', label: 'Allows entertainment' },
  { key: 'parkingNearby', label: 'Parking nearby' },
  { key: 'publicTransportNearby', label: 'Public transport nearby' },
  { key: 'hasDessertTableSpace', label: 'Dessert table space' },
  { key: 'hasPhotoZoneSpace', label: 'Photo zone space' },
  { key: 'balloonSetupPossible', label: 'Balloon setup possible' }
];

const themeFilters = [
  { value: 'castle', label: 'Castle suitable' },
  { value: 'space', label: 'Space suitable' },
  { value: 'forest', label: 'Forest suitable' },
  { value: 'neutral', label: 'Neutral / flexible' }
];

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

  const boolKeys = checkFilters.map((item) => item.key);
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
  return venueTypeLabels[type] || type;
}

function spaceTypeLabel(type) {
  return spaceTypeLabels[type] || type;
}

function themeLabel(theme) {
  return themeLabels[theme] || theme;
}

function themePreviewImages(venue) {
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
  if (venue.hasDessertTableSpace) strengths.push('dessert table');
  if (venue.hasPhotoZoneSpace) strengths.push('photo zone');
  if (venue.balloonSetupPossible) strengths.push('balloon setup');
  return strengths.slice(0, 2).join(' + ') || 'light styling';
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
      package: pkg
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
