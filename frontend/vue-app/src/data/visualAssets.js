export const visualAssets = [
  {
    id: 'castle-princess-full-world',
    theme: 'castle',
    tier: 'premium',
    asset_type: 'theme_world',
    image_path: '/party-assets/themes/castle-princess-full.png',
    preview_url: '/preview-castle-full.html',
    title: 'Castle Princess full world',
    description: 'Dream Castle investor preview with royal banquet, princess world styling, gold accents, and immersive castle silhouette.'
  },
  {
    id: 'castle-princess-theme',
    theme: 'castle',
    tier: 'standard',
    asset_type: 'theme_effect',
    image_path: '/party-assets/themes/castle-princess-full.png',
    preview_url: '/theme-castle-world.html',
    title: 'Castle Princess theme effect',
    description: 'Standalone castle theme effect page for fairy-tale presentation and theme switching QA.'
  },
  {
    id: 'space-explorer-world',
    theme: 'space',
    tier: 'premium',
    asset_type: 'theme_world',
    image_path: '/party-assets/themes/space-explorer.png',
    preview_url: '/theme-star-world.html',
    title: 'Space Explorer world',
    description: 'Standalone star world with deep-space background, orbit elements, launch CTA, and sci-fi visual language.'
  },
  {
    id: 'forest-adventure-full-world',
    theme: 'forest',
    tier: 'standard',
    asset_type: 'theme_world',
    image_path: '/party-assets/themes/forest-adventure-full.png',
    preview_url: '/preview-forest-full.html',
    title: 'Forest Adventure full world',
    description: 'Forest Adventure investor preview with tree silhouettes, warm light rays, nature mood, and rustic card styling.'
  },
  {
    id: 'forest-private-dining-layout',
    theme: 'forest',
    tier: 'standard',
    asset_type: 'dining_layout',
    image_path: '/party-assets/dining-layouts/private-dining-room-layout.png',
    preview_url: '/preview-forest-layout-v2.html',
    title: 'Private dining room layout',
    description: 'Dining-room layout reference for restaurant/private dining staging, seating, and theme package discussion.'
  },
  {
    id: 'worlds-switcher',
    theme: 'all',
    tier: 'overview',
    asset_type: 'theme_switcher',
    image_path: '/party-assets/investor-hero/immersive-homepage-hero.png',
    preview_url: '/preview-worlds-v3.html',
    title: 'Theme worlds switcher',
    description: 'Investor-facing visual switcher for Castle Princess, Space Explorer, and Forest Adventure worlds.'
  },
  {
    id: 'package-matrix',
    theme: 'all',
    tier: 'overview',
    asset_type: 'package_matrix',
    image_path: '/party-assets/packages/package-tier-matrix.png',
    preview_url: '/preview-home-v8.html',
    title: 'Package matrix',
    description: 'Package and quote presentation reference for basic, standard, and premium party planning tiers.'
  },
  {
    id: 'materials-and-mockup',
    theme: 'all',
    tier: 'overview',
    asset_type: 'app_display_mockup',
    image_path: '/party-assets/app-mockups/app-display-mockup.png',
    preview_url: '/preview-home-v2.html',
    title: 'Materials and app display mockup',
    description: 'Homepage presentation reference for app display, theme materials, and investor visual storytelling.'
  },
  {
    id: 'quote-entry-preview',
    theme: 'all',
    tier: 'overview',
    asset_type: 'quote_entry',
    image_path: '/party-assets/quotes/quote-entry-preview.png',
    preview_url: '/quote',
    title: 'Quote entry preview',
    description: 'Quote summary visual entry for investor preview and package-to-price flow.'
  }
];

export function getVisualAssetsByTheme(themeId) {
  return visualAssets.filter((asset) => asset.theme === themeId || asset.theme === 'all');
}
