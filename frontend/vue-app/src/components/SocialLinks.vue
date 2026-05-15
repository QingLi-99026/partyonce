<template>
  <nav v-if="featureFlags.showSocialLinks" class="social-links-panel" aria-label="Official social media links">
    <div class="social-links-row">
      <a
        v-for="link in socialLinks"
        :key="link.name"
        class="social-link"
        :href="link.url"
        target="_blank"
        rel="noopener noreferrer"
        :aria-label="link.name"
      >
        <img :src="link.iconPath" :alt="`${link.name} icon`" loading="lazy">
        <span>{{ link.name }}</span>
      </a>
    </div>

    <a
      v-if="socialVideoLink?.url"
      class="highlight-video-link"
      :href="socialVideoLink.url"
      target="_blank"
      rel="noopener noreferrer"
    >
      {{ socialVideoLink.label }}
    </a>
  </nav>
</template>

<script setup>
import { featureFlags, socialLinks, socialVideoLink } from '@/config/featureFlags'
</script>

<style scoped>
.social-links-panel {
  display: grid;
  gap: 12px;
}

.social-links-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.social-link,
.highlight-video-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  border-radius: 999px;
  text-decoration: none;
  font-weight: 800;
  transition: transform 160ms ease, border-color 160ms ease, background 160ms ease;
}

.social-link {
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid rgba(157, 54, 108, 0.20);
  background: rgba(255, 255, 255, 0.72);
  color: #5f2444;
}

.social-link:hover,
.highlight-video-link:hover {
  transform: translateY(-1px);
  border-color: rgba(183, 45, 122, 0.42);
  background: #fff;
}

.social-link img {
  width: 18px;
  height: 18px;
  display: block;
}

.highlight-video-link {
  width: fit-content;
  padding: 9px 14px;
  border: 1px solid rgba(183, 45, 122, 0.26);
  background: #fff0f7;
  color: #9d366c;
}
</style>
