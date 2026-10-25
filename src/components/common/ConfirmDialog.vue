<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    color?: 'primary' | 'error' | 'warning';
    loading?: boolean;
    errorMessage?: string | null;
  }>(),
  {
    message: undefined,
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    color: 'primary',
    loading: false,
    errorMessage: null,
  },
);

const open = defineModel<boolean>({ default: false });
const emit = defineEmits<{ confirm: []; cancel: [] }>();

function cancel(): void {
  open.value = false;
  emit('cancel');
}
</script>

<template>
  <v-dialog v-model="open" max-width="460" :persistent="loading">
    <v-card :title="title" data-testid="confirm-dialog">
      <v-card-text class="pt-2">
        <p v-if="message" class="text-body-2 mb-0">{{ message }}</p>
        <slot />
        <v-alert v-if="errorMessage" type="error" class="mt-4" density="compact" role="alert">
          {{ errorMessage }}
        </v-alert>
      </v-card-text>
      <v-card-actions class="px-6 pb-4">
        <v-spacer />
        <v-btn variant="text" :disabled="loading" @click="cancel">{{ cancelText }}</v-btn>
        <v-btn :color="color" variant="flat" :loading="loading" @click="emit('confirm')">
          {{ confirmText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
