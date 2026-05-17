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

    <section class="trust-strip">
      <div>
        <p class="eyebrow">For parents comparing venues</p>
        <h2>Use this as a shortlist, then we confirm the real details</h2>
        <p>
          Venue Finder helps you narrow options by guests, budget, suburb, food needs,
          room rules and party styling fit. It does not make a live booking or charge a deposit.
        </p>
      </div>
      <ul>
        <li v-for="item in trustChecklist" :key="item">{{ item }}</li>
      </ul>
    </section>

    <section class="choice-proof-strip">
      <div class="choice-proof-heading">
        <p class="eyebrow">Common family choices · staging samples</p>
        <h2>How most parents can start without overthinking</h2>
        <p>
          These are not real customer reviews. They are sample planning patterns for testing
          whether Australian families can understand package and add-on choices quickly.
        </p>
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
        <p class="eyebrow">Dietary & cultural fit</p>
        <p class="filter-helper">Use these as planning filters only. The team still confirms details with the venue or caterer.</p>
        <div class="check-grid">
          <label v-for="check in culturalFilters" :key="check.key" class="check-row">
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
              <span class="demo-badge" :class="{ 'is-research': venue.researchSeed }">
                {{ venue.researchSeed ? 'Public research seed' : 'Demo venue' }}
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
              <div v-if="culturalFitLabels(venue).length" class="tag-row cultural-fit-row">
                <span v-for="label in culturalFitLabels(venue).slice(0, 4)" :key="label">{{ label }}</span>
              </div>
              <p v-if="venue.researchSeed" class="research-note">
                Public source found · owner call required before customer quote.
              </p>
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
              <div class="parent-checks">
                <small>Parent checks before quote</small>
                <span>{{ venueOps(venue).foodOptions[0] }}</span>
                <span>{{ venueOps(venue).allergyNotes[0] }}</span>
                <span>{{ venueOps(venue).minimumSpendHint }}</span>
              </div>
              <div class="recommended-addons">
                <small>Useful add-ons for this venue</small>
                <div>
                  <span v-for="addon in recommendedAddOns(venue).slice(0, 3)" :key="addon.id">
                    {{ addon.icon }} {{ addon.name }}
                  </span>
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
            <div><dt>Add-on upside</dt><dd>{{ recommendedAddOns(venue).slice(0, 3).map((item) => item.name).join(' / ') }}</dd></div>
            <div><dt>Food check</dt><dd>{{ venueOps(venue).foodOptions[0] }}</dd></div>
            <div><dt>Allergy check</dt><dd>{{ venueOps(venue).allergyNotes[0] }}</dd></div>
            <div><dt>Cultural fit</dt><dd>{{ culturalFitLabels(venue).join(' / ') || 'Manual family requirements review' }}</dd></div>
            <div><dt>Min spend</dt><dd>{{ venueOps(venue).minimumSpendHint }}</dd></div>
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
        <div v-if="selectedVenue.beforeImage && selectedVenue.afterImage" class="before-after-strip">
          <figure>
            <img :src="selectedVenue.beforeImage" :alt="`${selectedVenue.name} before styling`" />
            <figcaption>Before venue reference</figcaption>
          </figure>
          <figure>
            <img :src="selectedVenue.afterImage" :alt="`${selectedVenue.name} after styling concept`" />
            <figcaption>After styling concept</figcaption>
          </figure>
        </div>
      </div>
      <article>
        <p class="eyebrow">{{ selectedVenue.researchSeed ? 'Venue detail · public research seed' : 'Venue detail · staging fixture' }}</p>
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
          <span v-for="label in culturalFitLabels(selectedVenue)" :key="label">{{ label }}</span>
        </div>
        <div class="detail-render-strip">
          <img
            v-for="preview in themePreviewImages(selectedVenue)"
            :key="preview"
            :src="preview"
            alt="Restaurant A theme preview"
          />
        </div>
        <div class="recommended-addons is-detail">
          <small>Recommended high-value add-ons</small>
          <div>
            <span v-for="addon in recommendedAddOns(selectedVenue)" :key="addon.id">
              {{ addon.icon }} {{ addon.name }} · +${{ addon.price }}
            </span>
          </div>
          <p>
            These are staging suggestions only. A human planner still confirms availability,
            supplier fit, and final quote details before any deposit readiness step.
          </p>
        </div>
        <div class="restriction-box">
          <strong>Still needs manual confirmation</strong>
          <ul>
            <li v-for="item in selectedVenue.restrictions" :key="item">{{ item }}</li>
          </ul>
        </div>
        <div class="restriction-box ops-readiness-box">
          <strong>Food, allergy and venue commercial checks</strong>
          <dl>
            <div><dt>Food options</dt><dd>{{ venueOps(selectedVenue).foodOptions.join(' · ') }}</dd></div>
            <div><dt>Allergy notes</dt><dd>{{ venueOps(selectedVenue).allergyNotes.join(' · ') }}</dd></div>
            <div><dt>Dietary / cultural fit</dt><dd>{{ culturalFitLabels(selectedVenue).join(' · ') || 'Manual review required' }}</dd></div>
            <div v-if="selectedVenue.culturalFitNotes?.length"><dt>Cultural planning notes</dt><dd>{{ selectedVenue.culturalFitNotes.join(' · ') }}</dd></div>
            <div><dt>Room hire</dt><dd>{{ venueOps(selectedVenue).roomHireHint }}</dd></div>
            <div><dt>Minimum spend</dt><dd>{{ venueOps(selectedVenue).minimumSpendHint }}</dd></div>
            <div><dt>Verification</dt><dd>{{ venueOps(selectedVenue).verificationStatus }}</dd></div>
            <div v-if="selectedVenue.publicSourceLabel"><dt>Public source</dt><dd>{{ selectedVenue.publicSourceLabel }}</dd></div>
          </dl>
          <p>These values are local/staging planning fields. Formal quotes require direct venue confirmation.</p>
          <p v-if="selectedVenue.publicSourceUrl" class="source-link">
            Source URL for owner verification:
            <a :href="selectedVenue.publicSourceUrl" target="_blank" rel="noopener noreferrer">{{ selectedVenue.publicSourceUrl }}</a>
          </p>
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
import { recommendAddOnServicesForVenue } from '@/data/addOnServices';
import { getTrustChecklist } from '@/data/parentTrustContent';
import { getPopularFamilyChoices } from '@/data/parentSocialProof';
import { getVenueOperationalReadiness } from '@/data/supplierVenueImportTemplate';
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

const culturalFilters = [
  { key: 'halalFriendly', label: 'Halal-friendly planning' },
  { key: 'noPorkFriendly', label: 'No pork menu planning' },
  { key: 'noAlcoholFriendly', label: 'No alcohol family setting' },
  { key: 'vegetarianFriendly', label: 'Vegetarian-friendly options' },
  { key: 'egglessCakeFriendly', label: 'Eggless cake possible' },
  { key: 'allergyAware', label: 'Allergy-aware review' },
  { key: 'privateFamilyArea', label: 'Private / family area' }
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

  const boolKeys = [...checkFilters, ...culturalFilters].map((item) => item.key);
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
  if (venue.hasDessertTableSpace) strengths.push('dessert table');
  if (venue.hasPhotoZoneSpace) strengths.push('photo zone');
  if (venue.balloonSetupPossible) strengths.push('balloon setup');
  return strengths.slice(0, 2).join(' + ') || 'light styling';
}

function culturalFitLabels(venue) {
  const checks = [
    ['halalFriendly', 'Halal-friendly'],
    ['noPorkFriendly', 'No pork'],
    ['noAlcoholFriendly', 'No alcohol'],
    ['vegetarianFriendly', 'Vegetarian'],
    ['egglessCakeFriendly', 'Eggless cake'],
    ['allergyAware', 'Allergy-aware'],
    ['privateFamilyArea', 'Private family area']
  ];
  return checks.filter(([key]) => venue?.[key]).map(([, label]) => label);
}

function recommendedAddOns(venue) {
  return recommendAddOnServicesForVenue(venue, normalizeVenueFinderFilters(filters), 'en');
}

function venueOps(venue) {
  return getVenueOperationalReadiness(venue);
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
