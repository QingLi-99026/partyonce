<template>
  <label class="language-switcher" :class="{ 'is-compact': compact }">
    <span class="language-label">{{ t('language.label') }}</span>
    <select
      class="language-select"
      :value="locale"
      :aria-label="t('language.label')"
      @change="handleLocaleChange"
    >
      <option
        v-for="item in supportedLocales"
        :key="item.code"
        :value="item.code"
      >
        {{ item.label }}
      </option>
    </select>
  </label>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { setLocale, supportedLocales } from '@/i18n'

defineProps({
  compact: {
    type: Boolean,
    default: false
  }
})

const { locale, t } = useI18n()

const handleLocaleChange = (event) => {
  setLocale(event.target.value)
}
</script>

<style scoped>
.language-switcher {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: max-content;
  color: inherit;
}

.language-label {
  font-size: 0.82rem;
  font-weight: 700;
  white-space: nowrap;
}

.language-select {
  min-width: 124px;
  height: 34px;
  padding: 0 28px 0 10px;
  border: 1px solid rgba(255, 255, 255, 0.36);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.16);
  color: inherit;
  font-size: 0.86rem;
  font-weight: 700;
  cursor: pointer;
}

.language-select option {
  color: #1f2937;
  background: #ffffff;
}

.is-compact .language-select {
  min-width: 124px;
  border-color: #dcdfe6;
  background: #ffffff;
  color: #303133;
}

.is-compact .language-label {
  color: #303133;
}
</style>
