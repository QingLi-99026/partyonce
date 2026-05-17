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
      <img v-if="locale === 'zh'" :src="theme.image" :alt="theme.name" class="hero-image">
      <div v-else class="hero-image-placeholder">
        <span>{{ theme.icon }}</span>
        <strong>{{ theme.englishName }}</strong>
        <p>{{ t('themes.englishImageFallback') }}</p>
      </div>
    </section>

    <section class="package-section">
      <div class="section-heading">
        <p class="eyebrow">{{ safeT('trustConversionV1.packageComparison.kicker', localeCopy.packageKicker) }}</p>
        <h2>{{ safeT('tiers.heading', localeCopy.heading) }}</h2>
        <p>{{ safeT('trustConversionV1.packageComparison.subtitle', localeCopy.subtitle) }}</p>
      </div>
      <div class="package-grid">
        <article v-for="tier in tiers" :key="tier.id" class="package-card">
          <span>{{ tier.icon }}</span>
          <h3>{{ tier.label }}</h3>
          <p>{{ tier.description }}</p>
          <dl>
            <div>
              <dt>{{ safeT('trustConversionV1.ageGuestLabels.ageRange', localeCopy.ageRange) }}</dt>
              <dd>{{ tier.ageGuests }}</dd>
            </div>
            <div>
              <dt>{{ safeT('quotePage.packageComparison.rows.priceRange.label', localeCopy.priceRange) }}</dt>
              <dd>{{ tier.priceRange }}</dd>
            </div>
            <div>
              <dt>{{ safeT('quotePage.packageComparison.rows.upgrade.label', localeCopy.upgradeValue) }}</dt>
              <dd>{{ tier.upgrade }}</dd>
            </div>
          </dl>
          <router-link class="package-quote-link" :to="`/quote?theme=${theme.id}&package=${tier.id}`">
            {{ safeT('quote.entry', localeCopy.quoteEntry) }}
          </router-link>
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
const { t, locale } = useI18n()

const themeMap = computed(() => ({
  'castle-princess': {
    id: 'castle',
    slug: 'castle-princess',
    englishName: 'Castle Princess',
    icon: '🏰',
    name: t('themes.castle.name'),
    description: t('themes.castle.description'),
    image: '/party-assets/themes/castle-princess-full.png'
  },
  'space-explorer': {
    id: 'space',
    slug: 'space-explorer',
    englishName: 'Space Explorer',
    icon: '🚀',
    name: t('themes.space.name'),
    description: t('themes.space.description'),
    image: '/party-assets/themes/space-explorer.png'
  },
  'forest-adventure': {
    id: 'forest',
    slug: 'forest-adventure',
    englishName: 'Forest Adventure',
    icon: '🌲',
    name: t('themes.forest.name'),
    description: t('themes.forest.description'),
    image: '/party-assets/themes/forest-adventure-full.png'
  }
}))

const theme = computed(() => themeMap.value[route.params.slug] || themeMap.value['castle-princess'])

const fallbackCopyByLocale = {
  zh: {
    packageKicker: '套餐对比',
    heading: '基础 / 标准 / 高级',
    subtitle: '每一档都保留说明文字、适合年龄人数和价格范围，提交报价后仍需人工复核。',
    ageRange: '适合年龄 / 人数',
    priceRange: '价格范围',
    upgradeValue: '升级价值',
    quoteEntry: '获取报价'
  },
  en: {
    packageKicker: 'Package comparison',
    heading: 'Basic / Standard / Premium',
    subtitle: 'Each tier keeps clear copy, age and guest fit, and price range. Final quote still needs human review.',
    ageRange: 'Age / guests',
    priceRange: 'Price range',
    upgradeValue: 'Upgrade value',
    quoteEntry: 'Request quote'
  },
  ko: {
    packageKicker: '패키지 비교',
    heading: '기본 / 표준 / 프리미엄',
    subtitle: '각 단계는 설명, 적합 연령과 인원, 가격 범위를 유지하며 최종 견적은 사람이 검토합니다.',
    ageRange: '연령 / 인원',
    priceRange: '가격 범위',
    upgradeValue: '업그레이드 가치',
    quoteEntry: '견적 요청'
  },
  ar: {
    packageKicker: 'مقارنة الباقات',
    heading: 'أساسي / قياسي / فاخر',
    subtitle: 'تحتفظ كل باقة بوصف واضح وملاءمة العمر والضيوف ونطاق السعر، مع مراجعة بشرية قبل السعر النهائي.',
    ageRange: 'العمر / الضيوف',
    priceRange: 'نطاق السعر',
    upgradeValue: 'قيمة الترقية',
    quoteEntry: 'طلب عرض سعر'
  }
}

const localeCopy = computed(() => fallbackCopyByLocale[locale.value] || fallbackCopyByLocale.zh)

const safeT = (key, fallback) => {
  const translated = t(key)
  return translated && translated !== key ? translated : fallback
}

const tiers = computed(() => [
  {
    id: 'basic',
    icon: '🎈',
    label: safeT('tiers.basic', locale.value === 'zh' ? '基础套餐' : 'Basic'),
    description: safeT('tiers.basicDescription', locale.value === 'zh' ? '基础桌面造型、主题气球、欢迎牌和轻量拍照角，适合预算清晰的小型派对。' : 'Essential styling for a controlled small party.'),
    ageGuests: safeT('quotePage.packageComparison.rows.ageGuests.basic', locale.value === 'zh' ? '3-8 岁，约 10-18 人' : 'Ages 3-8, about 10-18 guests'),
    priceRange: safeT('quotePage.packageComparison.rows.priceRange.basic', locale.value === 'zh' ? '约 $899-$1,299 起' : 'From about $899-$1,299'),
    upgrade: safeT('quotePage.packageComparison.rows.upgrade.basic', locale.value === 'zh' ? '保留基础拍照点' : 'Keeps key photo moment')
  },
  {
    id: 'standard',
    icon: '🎂',
    label: safeT('tiers.standard', locale.value === 'zh' ? '标准套餐' : 'Standard'),
    description: safeT('tiers.standardDescription', locale.value === 'zh' ? '完整主题桌面、气球拱门、甜品台、背景板和供应商建议，适合多数家庭生日派对。' : 'Full theme styling for most family birthday parties.'),
    ageGuests: safeT('quotePage.packageComparison.rows.ageGuests.standard', locale.value === 'zh' ? '5-12 岁，约 15-35 人' : 'Ages 5-12, about 15-35 guests'),
    priceRange: safeT('quotePage.packageComparison.rows.priceRange.standard', locale.value === 'zh' ? '约 $1,499-$2,399 起' : 'From about $1,499-$2,399'),
    upgrade: safeT('quotePage.packageComparison.rows.upgrade.standard', locale.value === 'zh' ? '增加背景、甜品台和协调' : 'Adds backdrop, dessert table, coordination')
  },
  {
    id: 'premium',
    icon: '✨',
    label: safeT('tiers.premium', locale.value === 'zh' ? '高级套餐' : 'Premium'),
    description: safeT('tiers.premiumDescription', locale.value === 'zh' ? '沉浸式背景、灯光层次、定制立牌、主视觉拍照区和现场协调，适合更重视仪式感的派对。' : 'Immersive styling for families who want a polished celebration.'),
    ageGuests: safeT('quotePage.packageComparison.rows.ageGuests.premium', locale.value === 'zh' ? '8 岁以上或大型活动，约 25-60 人' : 'Older kids or larger events, about 25-60 guests'),
    priceRange: safeT('quotePage.packageComparison.rows.priceRange.premium', locale.value === 'zh' ? '约 $2,800+，需人工复核' : 'About $2,800+, human review required'),
    upgrade: safeT('quotePage.packageComparison.rows.upgrade.premium', locale.value === 'zh' ? '增加定制、灯光和全场包装' : 'Adds customization, lighting, full-room styling')
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

.hero-image-placeholder {
  min-height: 360px;
  aspect-ratio: 16 / 11;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 12px;
  padding: 30px;
  text-align: center;
  border: 1px solid #f0d6e2;
  border-radius: 8px;
  background:
    radial-gradient(circle at 20% 22%, rgba(255, 138, 91, 0.22), transparent 28%),
    linear-gradient(135deg, #fff, #fff0f7 48%, #edf8ff);
  box-shadow: 0 18px 50px rgba(64, 30, 48, 0.12);
}

.hero-image-placeholder span {
  font-size: 4rem;
}

.hero-image-placeholder strong {
  color: #241823;
  font-size: clamp(1.6rem, 3vw, 2.5rem);
  line-height: 1.1;
}

.hero-image-placeholder p {
  max-width: 360px;
  margin: 0;
  color: #65505f;
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

.section-heading {
  max-width: 820px;
  margin-bottom: 18px;
}

.section-heading h2 {
  margin-bottom: 8px;
}

.section-heading p:not(.eyebrow) {
  margin: 0;
  color: #65505f;
  line-height: 1.7;
}

.package-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.package-card {
  min-height: 280px;
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

.package-card dl {
  display: grid;
  gap: 10px;
  margin: 16px 0;
}

.package-card dl div {
  border-radius: 8px;
  background: #fff7fb;
  padding: 10px;
}

.package-card dt {
  color: #9a4d70;
  font-size: 0.78rem;
  font-weight: 900;
}

.package-card dd {
  margin: 4px 0 0;
  color: #241823;
  font-weight: 800;
  line-height: 1.45;
}

.package-quote-link {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  min-height: 38px;
  border-radius: 8px;
  background: #241823;
  color: #fff;
  font-weight: 900;
  text-decoration: none;
  padding: 0 14px;
}

@media (max-width: 900px) {
  .detail-hero,
  .package-grid {
    grid-template-columns: 1fr;
  }
}
</style>
