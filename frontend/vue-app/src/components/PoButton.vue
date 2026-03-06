<template>
  <button
    :class="[
      'po-button',
      `po-button--${type}`,
      `po-button--${size}`,
      { 'po-button--loading': loading, 'po-button--block': block }
    ]"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="po-button__spinner"></span>
    <slot />
  </button>
</template>

<script setup>
defineProps({
  type: { type: String, default: 'primary' }, // primary, secondary, text, danger
  size: { type: String, default: 'md' }, // sm, md, lg
  loading: Boolean,
  disabled: Boolean,
  block: Boolean
})

defineEmits(['click'])
</script>

<style scoped>
.po-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  font-family: var(--font-family-base);
  font-weight: var(--font-weight-medium);
  border: none;
  cursor: pointer;
  transition: all var(--transition-base);
  outline: none;
  white-space: nowrap;
}

/* Sizes */
.po-button--sm {
  height: 32px;
  padding: 0 var(--space-3);
  font-size: var(--font-size-sm);
  border-radius: var(--radius-base);
}

.po-button--md {
  height: 40px;
  padding: 0 var(--space-5);
  font-size: var(--font-size-base);
  border-radius: var(--radius-md);
}

.po-button--lg {
  height: 48px;
  padding: 0 var(--space-6);
  font-size: var(--font-size-lg);
  border-radius: var(--radius-lg);
}

/* Types */
.po-button--primary {
  background: var(--btn-primary-bg);
  color: var(--btn-primary-text);
  box-shadow: var(--shadow-base);
}

.po-button--primary:hover:not(:disabled) {
  background: var(--btn-primary-hover);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.po-button--secondary {
  background: var(--btn-secondary-bg);
  color: var(--text-primary);
  border: 1px solid var(--btn-secondary-border);
}

.po-button--secondary:hover:not(:disabled) {
  background: var(--btn-secondary-hover);
  border-color: var(--border-focus);
}

.po-button--text {
  background: transparent;
  color: var(--text-link);
  padding: 0 var(--space-2);
}

.po-button--text:hover:not(:disabled) {
  background: var(--bg-active);
}

.po-button--danger {
  background: var(--error-500);
  color: var(--gray-0);
}

.po-button--danger:hover:not(:disabled) {
  filter: brightness(0.9);
}

/* States */
.po-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.po-button--block {
  width: 100%;
}

.po-button__spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
