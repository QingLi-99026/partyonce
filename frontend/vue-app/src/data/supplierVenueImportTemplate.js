export const venueImportFields = [
  { key: 'venue_name', label: 'Venue name', required: true, note: 'Customer-facing name after owner approval.' },
  { key: 'suburb', label: 'Suburb / area', required: true, note: 'Use suburb plus broader service area.' },
  { key: 'venue_type', label: 'Venue type', required: true, note: 'Restaurant, private dining room, function room, cafe, hall.' },
  { key: 'capacity_min', label: 'Minimum capacity', required: true, note: 'Smallest practical party size.' },
  { key: 'capacity_max', label: 'Maximum capacity', required: true, note: 'Comfortable maximum, not fire-limit maximum.' },
  { key: 'price_per_person_min', label: 'Price per person min', required: true, note: 'Staging estimate until venue confirms.' },
  { key: 'price_per_person_max', label: 'Price per person max', required: true, note: 'Include typical food package range.' },
  { key: 'room_hire_or_min_spend', label: 'Room hire / minimum spend', required: false, note: 'Critical for formal quote review.' },
  { key: 'food_options', label: 'Food options', required: false, note: 'Kids menu, banquet, platters, halal/vegetarian availability.' },
  { key: 'allergy_notes', label: 'Allergy notes', required: false, note: 'Nut, dairy, gluten, egg, and cross-contamination handling.' },
  { key: 'allows_decorations', label: 'Allows decorations', required: true, note: 'Confirm balloons, backdrops, and table styling.' },
  { key: 'allows_cake', label: 'Allows outside cake', required: true, note: 'Check cakeage and refrigeration.' },
  { key: 'theme_fit', label: 'Theme fit', required: false, note: 'Castle, Space, Forest, neutral/flexible.' },
  { key: 'package_fit', label: 'Package fit', required: false, note: 'Basic, Standard, Premium.' },
  { key: 'restrictions', label: 'Restrictions', required: false, note: 'Noise, candles, confetti, setup time, pack-down time.' },
  { key: 'verification_status', label: 'Verification status', required: true, note: 'fixture_only, called, quoted, approved.' }
];

export const supplierImportFields = [
  { key: 'supplier_name', label: 'Supplier name', required: true, note: 'Public name after approval.' },
  { key: 'category', label: 'Category', required: true, note: 'Balloon, cake, photography, entertainment, setup, host.' },
  { key: 'service_area', label: 'Service area', required: true, note: 'Suburbs or radius served.' },
  { key: 'price_range', label: 'Price range', required: true, note: 'Staging estimate until supplier quote confirms.' },
  { key: 'lead_time', label: 'Lead time', required: false, note: 'How many days/weeks needed.' },
  { key: 'supported_themes', label: 'Supported themes', required: false, note: 'Castle, Space, Forest, neutral.' },
  { key: 'supported_package_tiers', label: 'Supported package tiers', required: false, note: 'Basic, Standard, Premium.' },
  { key: 'service_items', label: 'Service items', required: false, note: 'What is included and excluded.' },
  { key: 'allergy_or_food_notes', label: 'Allergy / food notes', required: false, note: 'Required for cake, dessert, food-related suppliers.' },
  { key: 'insurance_required', label: 'Insurance required', required: false, note: 'Useful for performers, setup teams, photography.' },
  { key: 'contact_placeholder', label: 'Contact placeholder', required: false, note: 'Do not expose real private contact in Preview.' },
  { key: 'verification_status', label: 'Verification status', required: true, note: 'fixture_only, contacted, quote_received, approved.' }
];

export const realDataReadinessChecklist = [
  'Confirm capacity, room hire, minimum spend, and setup windows directly with venue.',
  'Confirm food options, cakeage, allergy handling, and children menu before formal quote.',
  'Confirm supplier availability, insurance, lead time, and service inclusions.',
  'Keep Preview labels clear: local/staging fixture until manually verified.',
  'Do not trigger supplier contact, webhook, payment, or outbound messaging from the Preview app.'
];

export function getVenueOperationalReadiness(venue = {}) {
  return {
    foodOptions: venue.foodOptions || ['Kids menu and shared platter options must be confirmed manually.'],
    allergyNotes: venue.allergyNotes || ['Allergy handling is not verified in this fixture; human review required.'],
    roomHireHint: venue.roomHireHint || 'Room hire / minimum spend pending venue confirmation.',
    minimumSpendHint: venue.minimumSpendHint || 'Minimum spend pending venue confirmation.',
    verificationStatus: venue.verificationStatus || 'local_staging_fixture_only',
    manualReviewRequired: venue.manualReviewRequired !== false
  };
}
