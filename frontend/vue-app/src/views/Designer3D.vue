<template>
  <main class="designer-preview-page" aria-labelledby="designer-title">
    <section class="hero-panel">
      <div class="hero-copy">
        <p class="eyebrow">{{ t('designerPreview.eyebrow') }}</p>
        <h1 id="designer-title">{{ t('designerPreview.title') }}</h1>
        <p class="lead">
          {{ t('designerPreview.lead') }}
        </p>
        <p class="safety-note">
          {{ t('designerPreview.safetyNote') }}
        </p>
        <div class="cta-row" aria-label="3D design preview actions">
          <router-link class="primary-action" to="/">{{ t('designerPreview.backHome') }}</router-link>
          <router-link class="secondary-action" to="/themes">{{ t('designerPreview.enterThemes') }}</router-link>
          <router-link class="secondary-action" to="/quote">{{ t('designerPreview.getQuote') }}</router-link>
        </div>
      </div>

      <div class="scene-card" aria-label="Restaurant A visual planning preview">
        <div class="scene-toolbar">
          <span>Restaurant A</span>
          <span>Castle Standard sample</span>
        </div>
        <div class="scene-board">
          <div class="backdrop">{{ t('designerPreview.scene.backdrop') }}</div>
          <div class="balloon-arch">Balloon Arch</div>
          <div class="photo-zone">{{ t('designerPreview.scene.photoZone') }}</div>
          <div class="dessert-table">{{ t('designerPreview.scene.dessertTable') }}</div>
          <div class="main-table">{{ t('designerPreview.scene.mainTable') }}</div>
          <div
            v-for="table in tables"
            :key="table"
            class="guest-table"
            :style="tableStyle(table)"
          >
            {{ table }}
          </div>
          <div class="entrance">{{ t('designerPreview.scene.entrance') }}</div>
        </div>
      </div>
    </section>

    <section class="status-grid" aria-label="3D preview status">
      <article>
        <h2>{{ t('designerPreview.status.currentTitle') }}</h2>
        <p>{{ t('designerPreview.status.currentCopy') }}</p>
      </article>
      <article>
        <h2>{{ t('designerPreview.status.contentTitle') }}</h2>
        <p>{{ t('designerPreview.status.contentCopy') }}</p>
      </article>
      <article>
        <h2>{{ t('designerPreview.status.nextTitle') }}</h2>
        <p>{{ t('designerPreview.status.nextCopy') }}</p>
      </article>
    </section>
  </main>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const tables = [1, 2, 3, 4, 5, 6, 7, 8]

const tableStyle = (table) => {
  const positions = [
    { left: '18%', top: '48%' },
    { left: '35%', top: '48%' },
    { left: '52%', top: '48%' },
    { left: '69%', top: '48%' },
    { left: '22%', top: '68%' },
    { left: '39%', top: '68%' },
    { left: '56%', top: '68%' },
    { left: '73%', top: '68%' }
  ]

  return positions[table - 1]
}
</script>

<style scoped>
.designer-preview-page {
  min-height: calc(100vh - 120px);
  padding: 56px clamp(20px, 5vw, 72px);
  background:
    radial-gradient(circle at 18% 16%, rgba(255, 214, 230, 0.9), transparent 26%),
    radial-gradient(circle at 88% 22%, rgba(206, 236, 255, 0.8), transparent 30%),
    linear-gradient(135deg, #fff8fb 0%, #f4fbff 48%, #fff9ed 100%);
  color: #233044;
}

.hero-panel {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(420px, 1.1fr);
  gap: 36px;
  align-items: center;
  max-width: 1220px;
  margin: 0 auto;
}

.hero-copy {
  padding: 34px;
  border: 1px solid rgba(255, 165, 190, 0.35);
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.84);
  box-shadow: 0 24px 70px rgba(67, 88, 113, 0.16);
}

.eyebrow {
  display: inline-flex;
  margin: 0 0 14px;
  padding: 8px 13px;
  border-radius: 999px;
  background: #fff0f5;
  color: #b94272;
  font-size: 13px;
  font-weight: 800;
}

h1 {
  margin: 0;
  max-width: 620px;
  color: #26364f;
  font-size: clamp(36px, 5vw, 64px);
  line-height: 1.02;
}

.lead {
  margin: 18px 0 0;
  color: #54657c;
  font-size: 18px;
  line-height: 1.7;
}

.safety-note {
  margin: 20px 0 0;
  padding: 16px;
  border-left: 4px solid #ff9dbc;
  border-radius: 14px;
  background: #fff6f9;
  color: #6d5060;
  line-height: 1.6;
}

.cta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 26px;
}

.primary-action,
.secondary-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  padding: 0 20px;
  border-radius: 999px;
  font-weight: 800;
  text-decoration: none;
}

.primary-action {
  background: linear-gradient(135deg, #ff7fab, #ffad71);
  color: #fff;
  box-shadow: 0 12px 24px rgba(255, 127, 171, 0.28);
}

.secondary-action {
  border: 1px solid rgba(64, 112, 160, 0.18);
  background: #fff;
  color: #326083;
}

.scene-card {
  overflow: hidden;
  border: 1px solid rgba(95, 122, 151, 0.18);
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 28px 80px rgba(50, 70, 93, 0.18);
}

.scene-toolbar {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 20px;
  background: #2f4057;
  color: #fff;
  font-weight: 800;
}

.scene-board {
  position: relative;
  min-height: 440px;
  margin: 20px;
  border: 8px solid #d8c4a3;
  border-radius: 24px;
  background:
    linear-gradient(90deg, rgba(255,255,255,0.36) 1px, transparent 1px),
    linear-gradient(0deg, rgba(255,255,255,0.36) 1px, transparent 1px),
    linear-gradient(135deg, #f8e7d8, #fff5eb);
  background-size: 46px 46px, 46px 46px, auto;
  box-shadow: inset 0 0 0 1px rgba(135, 96, 55, 0.12);
}

.backdrop,
.balloon-arch,
.photo-zone,
.dessert-table,
.main-table,
.guest-table,
.entrance {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #5c3b55;
  font-size: 12px;
  font-weight: 900;
  box-shadow: 0 10px 20px rgba(71, 54, 75, 0.14);
}

.backdrop {
  left: 31%;
  top: 7%;
  width: 38%;
  height: 13%;
  border-radius: 18px;
  background: linear-gradient(135deg, #f8c9e3, #d8b2ff);
}

.balloon-arch {
  left: 26%;
  top: 4%;
  width: 48%;
  height: 21%;
  border: 8px dotted #ff8fbd;
  border-bottom: 0;
  border-radius: 999px 999px 0 0;
  background: transparent;
  box-shadow: none;
}

.photo-zone {
  left: 7%;
  top: 12%;
  width: 16%;
  height: 21%;
  border-radius: 18px;
  background: #ffe3ef;
}

.dessert-table {
  right: 7%;
  top: 14%;
  width: 18%;
  height: 17%;
  border-radius: 18px;
  background: #fff1bd;
}

.main-table {
  left: 39%;
  top: 30%;
  width: 22%;
  height: 12%;
  border-radius: 999px;
  background: #fff;
  border: 4px solid #ffb6cf;
}

.guest-table {
  width: 62px;
  height: 52px;
  transform: translate(-50%, -50%);
  border-radius: 18px;
  background: #ffffff;
  border: 3px solid #eec1d3;
}

.guest-table::before,
.guest-table::after {
  content: '';
  position: absolute;
  width: 18px;
  height: 18px;
  border-radius: 999px;
  background: #c8e4ff;
}

.guest-table::before {
  left: -14px;
}

.guest-table::after {
  right: -14px;
}

.entrance {
  left: 39%;
  bottom: 4%;
  width: 22%;
  height: 9%;
  border-radius: 999px;
  background: #dceeff;
  color: #2f668f;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
  max-width: 1220px;
  margin: 30px auto 0;
}

.status-grid article {
  padding: 22px;
  border: 1px solid rgba(95, 122, 151, 0.14);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.78);
}

.status-grid h2 {
  margin: 0 0 8px;
  color: #26364f;
  font-size: 18px;
}

.status-grid p {
  margin: 0;
  color: #607187;
  line-height: 1.6;
}

@media (max-width: 980px) {
  .hero-panel,
  .status-grid {
    grid-template-columns: 1fr;
  }

  .scene-board {
    min-height: 380px;
  }
}

@media (max-width: 640px) {
  .designer-preview-page {
    padding: 28px 16px;
  }

  .hero-copy {
    padding: 24px;
  }

  .scene-toolbar {
    flex-direction: column;
  }
}
</style>
