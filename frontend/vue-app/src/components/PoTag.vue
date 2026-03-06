<template>
  <span
    :class="[
      'po-tag',
      `po-tag--${type}`,
      `po-tag--${size}`,
      { 'po-tag--closable': closable }
    ]"
  >
    <slot />
    <button
      v-if="closable"
      class="po-tag__close"
      @click.stop="$emit('close', $event)"
    ></button>
  </span>
</template>

<script setup>
defineProps({
  type: { type: String, default: 'default' }, // default, primary, success, warning, error
  size: { type: String, default: 'md' }, // sm, md
  closable: Boolean
})

defineEmits(['close'])
</script>

<style scoped>
.po-tag {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-weight: var(--font-weight-medium);
  white-space: nowrap;
  transition: all var(--transition-fast);
}

/* Sizes */
.po-tag--sm {
  height: 24px;
  padding: 0 var(--space-2);
  font-size: var(--font-size-xs);
  border-radius: var(--radius-sm);
}

.po-tag--md {
  height: 28px;
  padding: 0 var(--space-3);
  font-size: var(--font-size-sm);
  border-radius: var(--radius-base);
}

/* Types */
.po-tag--default {
  background: var(--gray-100);
  color: var(--text-secondary);
}

.po-tag--primary {
  background: var(--primary-100);
  color: var(--primary-700);
}

.po-tag--success {
  background: rgba(81, 207, 102, 0.15);
  color: #2f9e44;
}

.po-tag--warning {
  background: rgba(255, 212, 59, 0.15);
  color: #f08c00;
}

.po-tag--error {
  background: rgba(255, 107, 107, 0.15);
  color: #e03131;
}

/* Close button */
.po-tag__close {
  width: 14px;
  height: 14px;
  padding: 0;
  margin-left: var(--space-1);
  background: transparent;
  border: none;
  cursor: pointer;
  opacity: 0.6;
  position: relative;
}

.po-tag__close::before,
.po-tag__close::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 8px;
  height: 1px;
  background: currentColor;
}

.po-tag__close::before { transform: translate(-50%, -50%) rotate(45deg); }
.po-tag__close::after { transform: translate(-50%, -50%) rotate(-45deg); }

.po-tag__close:hover {
  opacity: 1;
}
</style>
