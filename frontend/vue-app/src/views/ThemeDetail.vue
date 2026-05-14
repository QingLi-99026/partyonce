<template>
  <main class="theme-detail-page">
    <section class="detail-hero">
      <div class="hero-copy">
        <router-link class="back-link" to="/themes">← {{ $t('home.navThemes') }}</router-link>
        <p class="eyebrow">{{ theme.englishName }}</p>
        <h1>{{ theme.name }}</h1>
        <p>{{ theme.description }}</p>
        <div class="hero-actions">
          <LanguageSwitcher />
          <router-link class="primary-link" :to="`/quote?theme=${theme.id}&package=standard`">
            {{ $t('quote.entry') }}
          </router-link>
        </div>
      </div>
      <img :src="theme.image" :alt="theme.name" class="hero-image">
    </section>

    <section class="package-section">
      <h2>Basic / Standard / Premium</h2>
      <div class="package-grid">
        <article v-for="tier in tiers" :key="tier.id" class="package-card">
          <span>{{ tier.icon }}</span>
          <h3>{{ tier.label }}</h3>
          <p>{{ tier.description }}</p>
        </article>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'

const route = useRoute()
const { t } = useI18n()

const themeMap = computed(() => ({
  'castle-princess': {
    id: 'castle',
    slug: 'castle-princess',
    englishName: 'Castle Princess',
    name: t('themes.castle.name'),
    description: t('themes.castle.description'),
    image: '/party-assets/themes/castle-princess-full.png'
  },
  'space-explorer': {
    id: 'space',
    slug: 'space-explorer',
    englishName: 'Space Explorer',
    name: t('themes.space.name'),
    description: t('themes.space.description'),
    image: '/party-assets/themes/space-explorer.png'
  },
  'forest-adventure': {
    id: 'forest',
    slug: 'forest-adventure',
    englishName: 'Forest Adventure',
    name: t('themes.forest.name'),
    description: t('themes.forest.description'),
    image: '/party-assets/themes/forest-adventure-full.png'
  }
}))

const theme = computed(() => themeMap.value[route.params.slug] || themeMap.value['castle-princess'])

const tiers = computed(() => [
  {
    id: 'basic',
    icon: '🎈',
    label: t('tiers.basic'),
    description: 'Essential table styling, theme balloons, welcome sign, and a light photo corner.'
  },
  {
    id: 'standard',
    icon: '🎂',
    label: t('tiers.standard'),
    description: 'Full theme table styling, balloon arch, dessert table, backdrop, and supplier guidance.'
  },
  {
    id: 'premium',
    icon: '✨',
    label: t('tiers.premium'),
    description: 'Immersive backdrop, lighting layer, custom standees, hero photo zone, and on-site coordination.'
  }
])
</script>

<style scoped>
.theme-detail-page {
  min-height: 100vh;
  background: #fff8fb;
  color: #241823;
}

.detail-hero {
  max-width: 1120px;
  margin: 0 auto;
  padding: 84px 24px 36px;
  display: grid;
  grid-template-columns: minmax(0, 0.85fr) minmax(320px, 0.7fr);
  gap: 30px;
  align-items: center;
}

.back-link {
  display: inline-flex;
  margin-bottom: 18px;
  color: #7d3f5d;
  font-weight: 900;
  text-decoration: none;
}

.eyebrow {
  margin: 0 0 10px;
  color: #9a4d70;
  font-size: 0.82rem;
  font-weight: 900;
  text-transform: uppercase;
}

.detail-hero h1 {
  margin: 0;
  font-size: clamp(2.4rem, 5vw, 4.9rem);
  line-height: 1;
}

.detail-hero p {
  max-width: 680px;
  margin: 18px 0 0;
  color: #65505f;
  font-size: 1.08rem;
  line-height: 1.75;
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 24px;
  flex-wrap: wrap;
}

.hero-actions :deep(.language-switcher) {
  color: #241823;
}

.hero-actions :deep(.language-select) {
  border-color: #d7a7bc;
  background: #fff;
  color: #241823;
}

.primary-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: 0 18px;
  border-radius: 8px;
  background: #241823;
  color: #fff;
  font-weight: 900;
  text-decoration: none;
}

.hero-image {
  width: 100%;
  aspect-ratio: 16 / 11;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 18px 50px rgba(64, 30, 48, 0.18);
}

.package-section {
  max-width: 1120px;
  margin: 0 auto;
  padding: 20px 24px 78px;
}

.package-section h2 {
  margin: 0 0 18px;
  font-size: 1.8rem;
}

.package-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.package-card {
  min-height: 210px;
  padding: 20px;
  border: 1px solid #f0d6e2;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 12px 34px rgba(91, 45, 68, 0.1);
}

.package-card span {
  font-size: 2rem;
}

.package-card h3 {
  margin: 14px 0 8px;
}

.package-card p {
  margin: 0;
  color: #66515d;
  line-height: 1.6;
}

@media (max-width: 900px) {
  .detail-hero,
  .package-grid {
    grid-template-columns: 1fr;
  }
}
</style>
