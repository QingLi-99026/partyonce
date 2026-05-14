import { AI_CONCIERGE_QUOTE_PREFILL_KEY, AI_CONCIERGE_STORAGE_KEY } from '@/data/aiConciergeQuestions';
import { buildPartySceneConfig, summarizePartySceneConfig } from '@/data/partySceneConfig';
import { getVisualContext, normalizeThemeId, normalizeTierId } from '@/data/visualAssets';

export const PARTY_SCENE_CONFIG_STORAGE_KEY = 'party_scene_config';

const themePalettes = {
  castle: {
    name: 'Castle Princess',
    floor: '#fff4f8',
    wall: '#f8d7ea',
    primary: '#e98fbd',
    secondary: '#8e66d8',
    accent: '#d9a441',
    light: '#fff6c7',
    prop: 'crowns / castle towers / fairy lights'
  },
  space: {
    name: 'Space Explorer',
    floor: '#111b3d',
    wall: '#1e2a5f',
    primary: '#2d7ff9',
    secondary: '#b7c8ff',
    accent: '#28e0ff',
    light: '#bde9ff',
    prop: 'rockets / planets / star lights'
  },
  forest: {
    name: 'Forest Adventure',
    floor: '#e8f2df',
    wall: '#cadbb9',
    primary: '#5f9f68',
    secondary: '#8b6a3d',
    accent: '#f0b35a',
    light: '#ffe2a8',
    prop: 'vines / animals / wooden signs'
  }
};

const tierDensity = {
  basic: {
    name: 'Basic',
    density: 'Light',
    balloonCount: 5,
    propCount: 3,
    hasPhotoLighting: false,
    description: 'Small balloon cluster, simple table detail, and a light welcome moment.'
  },
  standard: {
    name: 'Standard',
    density: 'Balanced',
    balloonCount: 9,
    propCount: 6,
    hasPhotoLighting: true,
    description: 'Medium balloon arch, styled dessert table, backdrop, and photo corner.'
  },
  premium: {
    name: 'Premium',
    density: 'Immersive',
    balloonCount: 14,
    propCount: 10,
    hasPhotoLighting: true,
    description: 'Large arch, fuller lighting, expanded props, and a stronger photo zone.'
  }
};

const safeParseJson = (raw) => {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
};

const getBrowserStorageJson = (storage, key) => {
  if (typeof window === 'undefined' || !storage) return null;
  return safeParseJson(storage.getItem(key));
};

const normalizeSceneConfig = (config) => {
  if (!config) return null;
  const theme = normalizeThemeId(config.themeId || config.theme || config.themeLabel);
  const tier = normalizeTierId(config.packageTier || config.packageTierLabel);
  const visualContext = getVisualContext(theme, tier);
  return {
    ...config,
    themeId: theme,
    themeLabel: config.themeLabel || visualContext.packageVisual.themeName,
    packageTier: tier,
    packageTierLabel: config.packageTierLabel || visualContext.packageVisual.tierLabel,
    venue: {
      ...visualContext.primaryVenue,
      ...(config.venue || {})
    },
    visuals: {
      originalVenueImage: visualContext.primaryVenue.image_path,
      renderedSceneImage: visualContext.restaurant.image_path,
      packageMatrixImage: '/party-assets/packages/package-tier-matrix.png',
      themePreviewImage: visualContext.packageVisual.image_path,
      restaurantTitle: visualContext.restaurant.title,
      ...(config.visuals || {})
    },
    suppliers: Array.isArray(config.suppliers) && config.suppliers.length ? config.suppliers : visualContext.suppliers,
    future3d: {
      engineReady: true,
      layoutCoordinateSystem: 'room_relative_v1',
      editableLayers: ['layout', 'decor', 'visuals', 'suppliers'],
      suggestedRoute: '/experimental/party-3d',
      ...(config.future3d || {})
    }
  };
};

export function buildDefaultPartySceneConfig(theme = 'castle', tier = 'standard') {
  const themeId = normalizeThemeId(theme);
  const tierId = normalizeTierId(tier);
  const visualContext = getVisualContext(themeId, tierId);
  return buildPartySceneConfig({
    childAge: '6',
    guestCount: '20',
    area: 'Sydney',
    indoorOutdoor: 'indoor',
    themePreference: themeId,
    budgetRange: tierId,
    venuePreference: 'restaurant'
  }, {
    theme: themeId,
    tier: tierId,
    visualContext,
    reasonHeadline: 'Default Restaurant A preview for local/staging 3D sandbox review.'
  });
}

export function readPartySceneConfig() {
  if (typeof window === 'undefined') {
    return buildDefaultPartySceneConfig();
  }

  const directConfig = getBrowserStorageJson(window.sessionStorage, PARTY_SCENE_CONFIG_STORAGE_KEY)
    || getBrowserStorageJson(window.localStorage, PARTY_SCENE_CONFIG_STORAGE_KEY);
  if (directConfig) return normalizeSceneConfig(directConfig);

  const quotePrefill = getBrowserStorageJson(window.sessionStorage, AI_CONCIERGE_QUOTE_PREFILL_KEY)
    || getBrowserStorageJson(window.localStorage, AI_CONCIERGE_QUOTE_PREFILL_KEY);
  const prefillConfig = quotePrefill?.party_scene_config
    || quotePrefill?.selection?.party_scene_config
    || quotePrefill?.aiRecommendation?.party_scene_config;
  if (prefillConfig) return normalizeSceneConfig(prefillConfig);

  const intake = getBrowserStorageJson(window.localStorage, AI_CONCIERGE_STORAGE_KEY);
  const intakeConfig = intake?.recommendation?.party_scene_config
    || intake?.quotePrefill?.party_scene_config
    || intake?.quotePrefill?.aiRecommendation?.party_scene_config;
  if (intakeConfig) return normalizeSceneConfig(intakeConfig);

  return buildDefaultPartySceneConfig();
}

export function writePartySceneConfig(config) {
  if (typeof window === 'undefined' || !config) return config;
  const normalized = normalizeSceneConfig(config);
  window.sessionStorage.setItem(PARTY_SCENE_CONFIG_STORAGE_KEY, JSON.stringify(normalized));
  window.localStorage.setItem(PARTY_SCENE_CONFIG_STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
}

export function getScenePreviewTheme(config) {
  const theme = normalizeThemeId(config?.themeId || config?.theme || config?.themeLabel);
  return {
    id: theme,
    ...themePalettes[theme]
  };
}

export function getScenePreviewDensity(config) {
  const tier = normalizeTierId(config?.packageTier || config?.packageTierLabel);
  return {
    id: tier,
    ...tierDensity[tier]
  };
}

export function buildPartyScenePreviewModel(config) {
  const normalized = normalizeSceneConfig(config) || buildDefaultPartySceneConfig();
  const theme = getScenePreviewTheme(normalized);
  const density = getScenePreviewDensity(normalized);
  const summary = summarizePartySceneConfig(normalized);

  return {
    config: normalized,
    theme,
    density,
    summary,
    tables: Array.from({ length: 10 }, (_, index) => ({
      id: `table-${index + 1}`,
      label: index === 4 ? 'Main table' : `Table ${index + 1}`
    })),
    chairs: Array.from({ length: 18 }, (_, index) => ({
      id: `chair-${index + 1}`,
      label: `Chair ${index + 1}`
    })),
    balloons: Array.from({ length: density.balloonCount }, (_, index) => ({
      id: `balloon-${index + 1}`
    })),
    props: Array.from({ length: density.propCount }, (_, index) => ({
      id: `prop-${index + 1}`
    }))
  };
}
