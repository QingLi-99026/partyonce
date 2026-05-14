<template>
  <main class="themes-page">
    <section class="themes-hero">
      <p class="eyebrow">{{ $t('home.navThemes') }} · PartyOnce</p>
      <h1>{{ $t('home.themesTitle') }}</h1>
      <p>{{ $t('home.themesSubtitle') }}</p>
      <div class="hero-actions">
        <LanguageSwitcher />
        <button type="button" class="quote-button" @click="$router.push('/quote')">
          {{ $t('quote.entry') }}
        </button>
      </div>
    </section>

    <section class="theme-grid" aria-label="Party themes">
      <article
        v-for="theme in themes"
        :key="theme.id"
        class="theme-card"
      >
        <img :src="theme.image" :alt="theme.name" loading="lazy">
        <div class="theme-card-body">
          <span class="theme-icon">{{ theme.icon }}</span>
          <p class="theme-kicker">{{ theme.englishName }}</p>
          <h2>{{ theme.name }}</h2>
          <p>{{ theme.description }}</p>
          <div class="tier-row">
            <span>{{ $t('tiers.basic') }}</span>
            <span>{{ $t('tiers.standard') }}</span>
            <span>{{ $t('tiers.premium') }}</span>
          </div>
          <router-link class="theme-link" :to="`/themes/${theme.slug}`">
            {{ theme.cta }}
          </router-link>
        </div>
      </article>
    </section>
  </main>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'

const { t } = useI18n()

const themes = computed(() => [
  {
    id: 'castle',
    slug: 'castle-princess',
    icon: '👑',
    image: '/party-assets/themes/castle-princess-full.png',
    name: t('themes.castle.name'),
    englishName: 'Castle Princess',
    description: t('themes.castle.description'),
    cta: t('home.themeCta.castle')
  },
  {
    id: 'space',
    slug: 'space-explorer',
    icon: '🚀',
    image: '/party-assets/themes/space-explorer.png',
    name: t('themes.space.name'),
    englishName: 'Space Explorer',
    description: t('themes.space.description'),
    cta: t('home.themeCta.space')
  },
  {
    id: 'forest',
    slug: 'forest-adventure',
    icon: '🌲',
    image: '/party-assets/themes/forest-adventure-full.png',
    name: t('themes.forest.name'),
    englishName: 'Forest Adventure',
    description: t('themes.forest.description'),
    cta: t('home.themeCta.forest')
  }
])
</script>

<style scoped>
.themes-page {
  min-height: 100vh;
  background: #fff8fb;
  color: #261b24;
}

.themes-hero {
  padding: 78px 24px 34px;
  max-width: 1120px;
  margin: 0 auto;
}

.eyebrow {
  margin: 0 0 10px;
  color: #9a4d70;
  font-size: 0.82rem;
  font-weight: 800;
  text-transform: uppercase;
}

.themes-hero h1 {
  margin: 0;
  font-size: clamp(2.3rem, 5vw, 4.6rem);
  line-height: 1;
}

.themes-hero p {
  max-width: 760px;
  margin: 16px 0 0;
  color: #65445b;
  font-size: 1.08rem;
  line-height: 1.7;
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 22px;
  flex-wrap: wrap;
}

.hero-actions :deep(.language-switcher) {
  color: #261b24;
}

.hero-actions :deep(.language-select) {
  border-color: #d7a7bc;
  background: #fff;
  color: #261b24;
}

.quote-button,
.theme-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: 0 18px;
  border: 0;
  border-radius: 8px;
  background: #26203a;
  color: #fff;
  font-weight: 800;
  text-decoration: none;
  cursor: pointer;
}

.theme-grid {
  max-width: 1120px;
  margin: 0 auto;
  padding: 20px 24px 76px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.theme-card {
  overflow: hidden;
  border: 1px solid #f0d6e2;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 14px 40px rgba(91, 45, 68, 0.12);
}

.theme-card img {
  width: 100%;
  aspect-ratio: 16 / 10;
  object-fit: cover;
  display: block;
}

.theme-card-body {
  padding: 18px;
}

.theme-icon {
  font-size: 2rem;
}

.theme-kicker {
  margin: 12px 0 4px;
  color: #9a4d70;
  font-size: 0.78rem;
  font-weight: 900;
}

.theme-card h2 {
  margin: 0;
  font-size: 1.45rem;
}

.theme-card p {
  min-height: 84px;
  margin: 10px 0 0;
  color: #6d5a66;
  line-height: 1.55;
}

.tier-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin: 18px 0;
}

.tier-row span {
  padding: 6px 9px;
  border-radius: 999px;
  background: #fff0f6;
  color: #7d3f5d;
  font-size: 0.76rem;
  font-weight: 800;
}

@media (max-width: 900px) {
  .theme-grid {
    grid-template-columns: 1fr;
  }
}
</style>
