import { getVenueFinderById } from '@/data/venueFinderFixtures';
import { recommendAddOnServicesForVenue } from '@/data/addOnServices';

export const VENUE_FINDER_QUOTE_PREFILL_KEY = 'partyonce_venue_finder_quote_prefill_v1';

export function budgetToPackageTier(budgetPerPerson) {
  if (budgetPerPerson === '70_plus') return 'premium';
  if (budgetPerPerson === '45_70') return 'premium';
  if (budgetPerPerson === '25_45') return 'standard';
  return 'basic';
}

export function budgetToLabel(budgetPerPerson) {
  const labels = {
    under_25: 'Under $25 per person',
    '25_45': '$25-$45 per person',
    '45_70': '$45-$70 per person',
    '70_plus': '$70+ per person'
  };
  return labels[budgetPerPerson] || '$25-$45 per person';
}

export function chooseThemeForVenue(venue, childAgeRange = '9_12') {
  if (!venue?.suitableThemes?.length) return 'space';
  if (childAgeRange === '9_12' && venue.suitableThemes.includes('space')) return 'space';
  if (childAgeRange === '13_plus' && venue.suitableThemes.includes('space')) return 'space';
  return venue.suitableThemes.find((theme) => theme !== 'neutral') || 'space';
}

export function normalizeVenueFinderFilters(filters = {}) {
  const adults = Number(filters.adults || 10);
  const kids = Number(filters.kids || 20);
  return {
    area: filters.area || 'Marrickville',
    radiusKm: Number(filters.radiusKm || 5),
    adults,
    kids,
    totalGuests: adults + kids,
    childAgeRange: filters.childAgeRange || '9_12',
    budgetPerPerson: filters.budgetPerPerson || '25_45',
    eventDate: filters.eventDate || '',
    eventTime: filters.eventTime || '',
    venueType: filters.venueType || '',
    spaceType: filters.spaceType || '',
    kidFriendly: Boolean(filters.kidFriendly),
    allowsDecorations: Boolean(filters.allowsDecorations),
    allowsCake: Boolean(filters.allowsCake),
    allowsPhotographer: Boolean(filters.allowsPhotographer),
    allowsEntertainment: Boolean(filters.allowsEntertainment),
    parkingNearby: Boolean(filters.parkingNearby),
    publicTransportNearby: Boolean(filters.publicTransportNearby),
    themes: Array.isArray(filters.themes) ? filters.themes : [],
    hasDessertTableSpace: Boolean(filters.hasDessertTableSpace),
    hasPhotoZoneSpace: Boolean(filters.hasPhotoZoneSpace),
    balloonSetupPossible: Boolean(filters.balloonSetupPossible)
  };
}

export function scoreVenueMatch(venue, filters = {}) {
  const normalized = normalizeVenueFinderFilters(filters);
  let score = 0;
  const reasons = [];
  const distance = venue.distanceKm?.[normalized.area] ?? 99;
  const totalGuests = normalized.totalGuests;

  if (totalGuests >= venue.capacityMin && totalGuests <= venue.capacityMax) {
    score += 25;
    reasons.push(`Fits ${totalGuests} guests`);
  } else if (totalGuests <= venue.capacityMax + 10) {
    score += 10;
    reasons.push(`Close capacity fit for ${totalGuests} guests`);
  }

  if (distance <= normalized.radiusKm) {
    score += 20;
    reasons.push(`${distance}km from ${normalized.area}`);
  } else if (distance <= normalized.radiusKm + 3) {
    score += 8;
    reasons.push(`${distance}km away if radius can stretch`);
  }

  const budget = normalized.budgetPerPerson;
  const budgetFit =
    (budget === 'under_25' && venue.pricePerPersonMin <= 25) ||
    (budget === '25_45' && venue.pricePerPersonMin <= 45 && venue.pricePerPersonMax >= 25) ||
    (budget === '45_70' && venue.pricePerPersonMin <= 70 && venue.pricePerPersonMax >= 45) ||
    (budget === '70_plus' && venue.pricePerPersonMax >= 70);
  if (budgetFit) {
    score += 15;
    reasons.push(`Matches ${budgetToLabel(budget)}`);
  }

  if (!normalized.venueType || normalized.venueType === venue.venueType) score += 8;
  if (!normalized.spaceType || normalized.spaceType === venue.spaceType) score += 7;

  const boolChecks = [
    ['kidFriendly', 'kid friendly'],
    ['allowsDecorations', 'allows decorations'],
    ['allowsCake', 'allows cake'],
    ['allowsPhotographer', 'allows photographer'],
    ['allowsEntertainment', 'allows entertainment'],
    ['parkingNearby', 'parking nearby'],
    ['publicTransportNearby', 'public transport nearby'],
    ['hasDessertTableSpace', 'dessert table space'],
    ['hasPhotoZoneSpace', 'photo zone space'],
    ['balloonSetupPossible', 'balloon setup possible']
  ];

  boolChecks.forEach(([key, label]) => {
    if (normalized[key] && venue[key]) {
      score += 3;
      reasons.push(label);
    }
  });

  if (normalized.themes.length) {
    const matchedThemes = normalized.themes.filter((theme) => venue.suitableThemes.includes(theme));
    if (matchedThemes.length) {
      score += 10;
      reasons.push(`Theme fit: ${matchedThemes.join(', ')}`);
    }
  } else {
    score += 5;
  }

  return {
    score: Math.min(score, 100),
    distance,
    reasons: reasons.slice(0, 5)
  };
}

export function buildVenueFinderQuotePrefill(venueOrId, filters = {}) {
  const venue = typeof venueOrId === 'string' ? getVenueFinderById(venueOrId) : venueOrId;
  if (!venue) return null;
  const normalized = normalizeVenueFinderFilters(filters);
  const match = scoreVenueMatch(venue, normalized);
  const themeId = chooseThemeForVenue(venue, normalized.childAgeRange);
  const packageId = budgetToPackageTier(normalized.budgetPerPerson);
  const recommendedAddons = recommendAddOnServicesForVenue(venue, normalized, 'en');
  const notes = [
    `Venue Finder selected ${venue.name} in ${venue.suburb}.`,
    `${normalized.adults} adults + ${normalized.kids} kids = ${normalized.totalGuests} guests.`,
    `Budget: ${budgetToLabel(normalized.budgetPerPerson)}.`,
    `Search area: ${normalized.area}, radius ${normalized.radiusKm}km.`,
    `Match score: ${match.score}/100. ${match.reasons.join('; ')}.`,
    `Restrictions to confirm: ${venue.restrictions.join('; ')}.`
  ].join('\n');

  return {
    source: 'venue_finder',
    customerInfo: {
      name: '',
      contact: '',
      preferredDate: normalized.eventDate,
      notes,
      guestCount: normalized.totalGuests,
      budgetRange: budgetToLabel(normalized.budgetPerPerson),
      area: normalized.area,
      venuePreference: venue.name
    },
    selection: {
      themeId,
      theme: themeId,
      themeName: themeId,
      sceneId: 'restaurant-a',
      packageId,
      packageTier: packageId,
      venueType: venue.venueType,
      venueId: venue.id,
      venueName: venue.name,
      venueCapacity: `${venue.capacityMin}-${venue.capacityMax} guests`,
      venueLayoutImage: venue.image,
      venueSuburb: venue.suburb,
      guestCount: normalized.totalGuests,
      budgetRange: budgetToLabel(normalized.budgetPerPerson),
      addonSuggestions: recommendedAddons,
      supplierSuggestions: []
    },
    pricing: {
      snapshot_note: 'Venue Finder staging estimate; venue availability and final package pricing require human review.',
      venueFinderEstimate: {
        pricePerPersonMin: venue.pricePerPersonMin,
        pricePerPersonMax: venue.pricePerPersonMax,
        estimatedRange: `$${venue.pricePerPersonMin * normalized.totalGuests}-$${venue.pricePerPersonMax * normalized.totalGuests}`
      }
    },
    venueFinder: {
      selectedVenue: venue,
      filters: normalized,
      match,
      recommendedAddons
    },
    saved_at: new Date().toISOString()
  };
}

export function saveVenueFinderQuotePrefill(venueOrId, filters = {}) {
  const payload = buildVenueFinderQuotePrefill(venueOrId, filters);
  if (!payload || typeof window === 'undefined') return payload;
  window.localStorage.setItem(VENUE_FINDER_QUOTE_PREFILL_KEY, JSON.stringify(payload));
  window.sessionStorage.setItem(VENUE_FINDER_QUOTE_PREFILL_KEY, JSON.stringify(payload));
  return payload;
}

export function readVenueFinderQuotePrefill() {
  if (typeof window === 'undefined') return null;
  const raw = window.sessionStorage.getItem(VENUE_FINDER_QUOTE_PREFILL_KEY)
    || window.localStorage.getItem(VENUE_FINDER_QUOTE_PREFILL_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed?.source === 'venue_finder' ? parsed : null;
  } catch (error) {
    return null;
  }
}
