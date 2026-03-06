<template>
  <div class="po-input-wrapper">
    <label v-if="label" class="po-input__label">
      {{ label }}
      <span v-if="required" class="po-input__required">*</span>
    </label>
    <div class="po-input__wrapper">
      <span v-if="prefix" class="po-input__prefix">{{ prefix }}</span>
      <input
        :value="modelValue"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :class="['po-input', { 'po-input--error': error }]"
        @input="$emit('update:modelValue', $event.target.value)"
        @blur="$emit('blur', $event)"
        @focus="$emit('focus', $event)"
      />
      <span v-if="suffix" class="po-input__suffix">{{ suffix }}</span>
    </div>
    <p v-if="error" class="po-input__error">{{ error }}</p>
    <p v-else-if="hint" class="po-input__hint">{{ hint }}</p>
  </div>
</template>

<script setup>
defineProps({
  modelValue: String,
  type: { type: String, default: 'text' },
  label: String,
  placeholder: String,
  hint: String,
  error: String,
  prefix: String,
  suffix: String,
  required: Boolean,
  disabled: Boolean
})

defineEmits(['update:modelValue', 'blur', 'focus'])
</script>

<style scoped>
.po-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.po-input__label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.po-input__required {
  color: var(--error-500);
  margin-left: var(--space-1);
}

.po-input__wrapper {
  display: flex;
  align-items: center;
  background: var(--bg-card);
  border: 1px solid var(--border-base);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  overflow: hidden;
}

.po-input__wrapper:focus-within {
  border-color: var(--border-focus);
  box-shadow: 0 0 0 3px var(--primary-100);
}

.po-input {
  flex: 1;
  height: 44px;
  padding: 0 var(--space-4);
  font-size: var(--font-size-base);
  color: var(--text-primary);
  background: transparent;
  border: none;
  outline: none;
}

.po-input::placeholder {
  color: var(--text-tertiary);
}

.po-input__prefix,
.po-input__suffix {
  padding: 0 var(--space-3);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.po-input--error {
  color: var(--error-500);
}

.po-input__wrapper:has(.po-input--error) {
  border-color: var(--error-500);
}

.po-input__error {
  font-size: var(--font-size-sm);
  color: var(--error-500);
  margin: 0;
}

.po-input__hint {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0;
}
</style>
