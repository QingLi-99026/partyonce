<template>
  <Teleport to="body">
    <Transition name="po-modal">
      <div v-if="modelValue" class="po-modal__overlay" @click.self="closeOnOverlay && $emit('update:modelValue', false)">
        <div class="po-modal" :style="{ width: width }">
          <div v-if="title || $slots.header" class="po-modal__header">
            <slot name="header">
              <h3 class="po-modal__title">{{ title }}</h3>
            </slot>
            <button v-if="showClose" class="po-modal__close" @click="$emit('update:modelValue', false)"></button>
          </div>
          
          <div class="po-modal__body">
            <slot />
          </div>
          
          <div v-if="$slots.footer" class="po-modal__footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
defineProps({
  modelValue: Boolean,
  title: String,
  width: { type: String, default: '480px' },
  showClose: { type: Boolean, default: true },
  closeOnOverlay: { type: Boolean, default: true }
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.po-modal__overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  padding: var(--space-5);
}

.po-modal {
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  max-width: 100%;
  max-height: 90vh;
  overflow: auto;
}

.po-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-6);
  border-bottom: 1px solid var(--border-light);
}

.po-modal__title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0;
}

.po-modal__close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: var(--radius-base);
  cursor: pointer;
  color: var(--text-tertiary);
  transition: all var(--transition-fast);
}

.po-modal__close::before,
.po-modal__close::after {
  content: '';
  position: absolute;
  width: 14px;
  height: 2px;
  background: currentColor;
}

.po-modal__close::before { transform: rotate(45deg); }
.po-modal__close::after { transform: rotate(-45deg); }

.po-modal__close:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.po-modal__body {
  padding: var(--space-6);
}

.po-modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  padding: 0 var(--space-6) var(--space-6);
}

/* Transitions */
.po-modal-enter-active,
.po-modal-leave-active {
  transition: opacity var(--transition-base);
}

.po-modal-enter-from,
.po-modal-leave-to {
  opacity: 0;
}

.po-modal-enter-active .po-modal,
.po-modal-leave-active .po-modal {
  transition: transform var(--transition-base);
}

.po-modal-enter-from .po-modal,
.po-modal-leave-to .po-modal {
  transform: scale(0.95);
}
</style>
