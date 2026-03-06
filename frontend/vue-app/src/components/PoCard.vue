<template>
  <div
    :class="[
      'po-card',
      `po-card--${variant}`,
      { 'po-card--hoverable': hoverable, 'po-card--padding-none': noPadding }
    ]"
    @click="$emit('click', $event)"
  >
    <div v-if="$slots.header || title" class="po-card__header">
      <slot name="header">
        <h3 class="po-card__title">{{ title }}</h3>
        <p v-if="subtitle" class="po-card__subtitle">{{ subtitle }}</p>
      </slot>
    </div>
    <div class="po-card__body">
      <slot />
    </div>
    <div v-if="$slots.footer" class="po-card__footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  subtitle: String,
  variant: { type: String, default: 'default' }, // default, elevated, outlined
  hoverable: Boolean,
  noPadding: Boolean
})

defineEmits(['click'])
</script>

<style scoped>
.po-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all var(--transition-base);
}

.po-card--default {
  box-shadow: var(--shadow-base);
  border: 1px solid var(--border-light);
}

.po-card--elevated {
  box-shadow: var(--shadow-lg);
}

.po-card--outlined {
  border: 1px solid var(--border-base);
  box-shadow: none;
}

.po-card--hoverable:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
}

.po-card__header {
  padding: var(--space-5) var(--space-6) 0;
}

.po-card__title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  line-height: var(--line-height-tight);
  margin: 0;
}

.po-card__subtitle {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: var(--space-1) 0 0;
}

.po-card__body {
  padding: var(--space-5) var(--space-6);
}

.po-card--padding-none .po-card__body {
  padding: 0;
}

.po-card__footer {
  padding: 0 var(--space-6) var(--space-5);
  border-top: 1px solid var(--border-light);
  margin-top: var(--space-4);
}
</style>
