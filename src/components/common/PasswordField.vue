<script setup lang="ts">
import { computed, ref } from 'vue';

const props = withDefaults(
  defineProps<{
    label?: string;
    autocomplete?: 'current-password' | 'new-password';
    errorMessages?: string | string[];
    hint?: string;
    name?: string;
    disabled?: boolean;
  }>(),
  {
    label: 'Contraseña',
    autocomplete: 'current-password',
    errorMessages: () => [],
    hint: undefined,
    name: undefined,
    disabled: false,
  },
);

const model = defineModel<string>({ default: '' });
const emit = defineEmits<{ blur: [event: FocusEvent] }>();

const visible = ref(false);
const toggleLabel = computed(() => (visible.value ? 'Ocultar contraseña' : 'Mostrar contraseña'));
</script>

<template>
  <v-text-field
    v-model="model"
    :label="props.label"
    :type="visible ? 'text' : 'password'"
    :autocomplete="props.autocomplete"
    :error-messages="props.errorMessages"
    :hint="props.hint"
    :persistent-hint="Boolean(props.hint)"
    :name="props.name"
    :disabled="props.disabled"
    prepend-inner-icon="mdi-lock-outline"
    autocapitalize="off"
    spellcheck="false"
    @blur="emit('blur', $event)"
  >
    <template #append-inner>
      <v-btn
        :aria-label="toggleLabel"
        :title="toggleLabel"
        :icon="visible ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
        :aria-pressed="visible"
        data-testid="password-visibility-toggle"
        density="comfortable"
        size="small"
        variant="text"
        @click="visible = !visible"
      />
    </template>
  </v-text-field>
</template>
