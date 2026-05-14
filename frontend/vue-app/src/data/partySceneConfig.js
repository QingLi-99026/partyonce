import { getVisualContext, normalizeThemeId, normalizeTierId } from '@/data/visualAssets';
import { getPackageExplanation, getUpgradeExplanation } from '@/data/packageExplanation';
import { QUOTE_LINE_ITEM_SCHEMA_VERSION, quoteLineItemOrder, quoteLineItemTypes } from '@/data/quoteLineItems';

export const PARTY_SCENE_CONFIG_VERSION = 'v1';

const themeScenePresets = {
  castle: {
    theme: 'castle_princess',
    layout: {
      tables: 3,
      chairs: 24,
      mainTable: 'center',
      dessertTable: 'right_side',
      photoZone: 'left_corner',
      backdrop: 'back_wall',
      entranceArch: 'front_entry',
      kidsActivityZone: 'front_left'
    },
    decor: {
      tablecloth: 'blush_pink',
      flowers: 'pastel_pink_gold',
      balloons: 'pink_purple_medium_arch',
      backdropStyle: 'castle_wall',
      ktBoard: 'princess_name_board',
      lighting: 'warm_soft',
      props: ['crowns', 'castle_towers', 'fairy_lights']
    }
  },
  space: {
    theme: 'space_explorer',
    layout: {
      tables: 3,
      chairs: 24,
      mainTable: 'center',
      dessertTable: 'right_side',
      photoZone: 'back_left_corner',
      backdrop: 'back_wall',
      entranceArch: 'front_entry',
      kidsActivityZone: 'center_floor'
    },
    decor: {
      tablecloth: 'midnight_blue',
      flowers: 'silver_blue_starbursts',
      balloons: 'silver_blue_large_arch',
      backdropStyle: 'galaxy_wall',
      ktBoard: 'rocket_mission_board',
      lighting: 'cool_led',
      props: ['rockets', 'planets', 'stars']
    }
  },
  forest: {
    theme: 'forest_adventure',
    layout: {
      tables: 3,
      chairs: 24,
      mainTable: 'center',
      dessertTable: 'right_side',
      photoZone: 'left_corner',
      backdrop: 'back_wall',
      entranceArch: 'front_entry',
      kidsActivityZone: 'front_left'
    },
    decor: {
      tablecloth: 'sage_green',
      flowers: 'natural_green_white',
      balloons: 'green_brown_small_cluster',
      backdropStyle: 'forest_leaves',
      ktBoard: 'adventure_name_board',
      lighting: 'warm_fairy_lights',
      props: ['small_animals', 'vines', 'wooden_signs']
    }
  }
};

const tierDecorIntensity = {
  basic: {
    dessertTable: 'simple_tabletop_display',
    photoZone: 'small_corner',
    entranceArch: 'small_balloon_cluster',
    stylingIntensity: 'light',
    note: 'Basic keeps the structure light: tabletop styling, a small photo moment, and limited balloons.'
  },
  standard: {
    dessertTable: 'styled_dessert_table',
    photoZone: 'medium_photo_corner',
    entranceArch: 'medium_balloon_arch',
    stylingIntensity: 'balanced',
    note: 'Standard adds the full birthday feel: arch, backdrop, dessert table, supplier coordination, and stronger visual anchors.'
  },
  premium: {
    dessertTable: 'full_theme_dessert_station',
    photoZone: 'immersive_photo_zone',
    entranceArch: 'large_balloon_arch',
    stylingIntensity: 'immersive',
    note: 'Premium turns the room into a staged experience with larger structures, lighting, photo zone, and custom boards.'
  }
};

const parseGuestCount = (value) => {
  if (typeof value === 'number') return value;
  const match = String(value || '').match(/\d+/g);
  if (!match) return 20;
  const numbers = match.map(Number);
  if (numbers.length === 1) return numbers[0];
  return Math.round((numbers[0] + numbers[numbers.length - 1]) / 2);
};

const parseChildAge = (value) => {
  const match = String(value || '').match(/\d+/);
  return match ? Number(match[0]) : null;
};

export function summarizePartySceneConfig(config) {
  if (!config) return null;
  return {
    label: `${config.themeLabel} · ${config.packageTierLabel}`,
    venue: config.venue?.name || '-',
    layout: [
      `${config.layout?.tables || '-'} tables`,
      `${config.layout?.chairs || '-'} chairs`,
      `dessert: ${config.layout?.dessertTable || '-'}`,
      `photo: ${config.layout?.photoZone || '-'}`
    ].join(' · '),
    decor: [
      config.decor?.tablecloth,
      config.decor?.balloons,
      config.decor?.backdropStyle,
      config.decor?.lighting
    ].filter(Boolean).join(' / '),
    supplierCount: Array.isArray(config.suppliers) ? config.suppliers.length : 0
  };
}

export function buildPartySceneConfig(answers = {}, recommendation = {}) {
  const theme = normalizeThemeId(recommendation.theme || answers.themePreference);
  const tier = normalizeTierId(recommendation.tier || answers.budgetRange);
  const context = recommendation.visualContext || getVisualContext(theme, tier);
  const packageExplanation = getPackageExplanation(tier);
  const upgradeExplanation = getUpgradeExplanation(tier);
  const themePreset = themeScenePresets[theme] || themeScenePresets.space;
  const tierPreset = tierDecorIntensity[tier] || tierDecorIntensity.standard;
  const guestCount = parseGuestCount(answers.guestCount || recommendation.summary?.guestCount);
  const tables = guestCount <= 15 ? 2 : guestCount <= 28 ? 3 : 4;
  const chairs = Math.max(guestCount, 12);

  const config = {
    version: PARTY_SCENE_CONFIG_VERSION,
    source: 'ai_concierge',
    generatedAt: new Date().toISOString(),
    theme: themePreset.theme,
    themeId: theme,
    themeLabel: context.packageVisual.themeName,
    packageTier: tier,
    packageTierLabel: context.packageVisual.tierLabel,
    venue: {
      id: context.primaryVenue.id,
      name: context.primaryVenue.name,
      type: context.primaryVenue.type || 'private_dining_room',
      capacity: context.primaryVenue.capacity,
      tables: context.primaryVenue.tables,
      chairs: context.primaryVenue.chairs,
      layoutImage: context.primaryVenue.layoutImage || context.primaryVenue.image_path,
      originalVenueImage: context.primaryVenue.image_path,
      priceRange: context.primaryVenue.priceRange
    },
    guest: {
      childAge: parseChildAge(answers.childAge || recommendation.summary?.childAge),
      childAgeLabel: recommendation.summary?.childAge || answers.childAge || '-',
      guestCount,
      guestCountLabel: recommendation.summary?.guestCount || answers.guestCount || '-',
      eventDate: answers.eventDate || recommendation.summary?.eventDate || '',
      area: recommendation.summary?.area || answers.area || '',
      indoorOutdoor: recommendation.summary?.indoorOutdoor || answers.indoorOutdoor || 'indoor'
    },
    layout: {
      ...themePreset.layout,
      tables,
      chairs,
      dessertTable: tierPreset.dessertTable,
      photoZone: tierPreset.photoZone,
      entranceArch: tierPreset.entranceArch
    },
    decor: {
      ...themePreset.decor,
      stylingIntensity: tierPreset.stylingIntensity,
      tierNote: tierPreset.note
    },
    visuals: {
      originalVenueImage: context.primaryVenue.image_path,
      renderedSceneImage: context.restaurant.image_path,
      packageMatrixImage: '/party-assets/packages/package-tier-matrix.png',
      themePreviewImage: context.packageVisual.image_path,
      restaurantTitle: context.restaurant.title
    },
    suppliers: (context.suppliers || []).map((supplier) => ({
      id: supplier.id,
      name: supplier.name,
      category: supplier.category,
      categoryLabel: supplier.categoryLabel || supplier.category,
      serviceArea: supplier.serviceArea,
      priceRange: supplier.priceRange,
      role: supplier.quoteRole,
      operationsRole: supplier.operationsRole,
      responsibility: supplier.responsibility || supplier.operationsRole,
      leadTime: supplier.lead_time,
      materialsOrServices: supplier.materials_or_services || supplier.serviceContent,
      serviceContent: supplier.serviceContent,
      status: supplier.status
    })),
    pricingExplanation: {
      lineItemSchemaVersion: QUOTE_LINE_ITEM_SCHEMA_VERSION,
      recommendedBecause: recommendation.reasonHeadline || packageExplanation.whyRecommend,
      includedItems: packageExplanation.includes,
      upgradeNotes: upgradeExplanation.items,
      lineItemHints: packageExplanation.priceDrivers,
      lineItemTypeHints: quoteLineItemOrder.map((type) => ({
        type,
        labelZh: quoteLineItemTypes[type].labelZh,
        scenePath: type === 'venue_fee' ? 'venue'
          : type === 'decor_fee' ? 'decor'
            : type === 'supplier_fee' ? 'suppliers'
              : type === 'labor_fee' ? 'layout'
                : type === 'transport_fee' ? 'venue'
                  : type === 'service_fee' ? 'pricingExplanation'
                    : 'optionalUpgrades'
      })),
      packageFit: packageExplanation.customerFit,
      quoteExplanation: packageExplanation.quoteExplanation
    },
    future3d: {
      engineReady: true,
      layoutCoordinateSystem: 'room_relative_v1',
      editableLayers: ['layout', 'decor', 'visuals', 'suppliers'],
      suggestedRoute: '/experimental/party-3d'
    }
  };
  applyScenePriority(config, answers.scenePriorities);
  applyStylingPreference(config, answers.stylingPreference);
  return config;
}

function applyScenePriority(config, priority) {
  if (priority === 'dessert_backdrop') {
    config.layout.dessertTable = 'right_side_feature_station';
    config.layout.backdrop = 'back_wall_feature';
    config.decor.backdropStyle = `${config.decor.backdropStyle}_feature`;
  }
  if (priority === 'photo_arch') {
    config.layout.photoZone = 'front_left_feature_corner';
    config.layout.entranceArch = 'front_entry_feature_arch';
  }
  if (priority === 'activity_tables') {
    config.layout.kidsActivityZone = 'center_floor_feature_zone';
    config.layout.mainTable = 'activity_facing_center';
  }
  return config;
}

function applyStylingPreference(config, preference) {
  if (preference === 'simple') {
    config.decor.stylingIntensity = 'light';
    config.decor.lighting = 'warm_soft';
    config.decor.props = config.decor.props.slice(0, 2);
  }
  if (preference === 'immersive') {
    config.decor.stylingIntensity = 'immersive';
    config.layout.photoZone = 'immersive_photo_zone';
    config.layout.entranceArch = 'large_front_entry_arch';
    config.decor.props = Array.from(new Set([...config.decor.props, 'custom_name_board', 'layered_backdrop']));
  }
  return config;
}
