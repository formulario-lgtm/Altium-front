<script setup lang="ts">
defineProps<{
  title: string;
  value: string | number;
  hint: string;
  icon: string;
  help?: string;
  clickable?: boolean;
}>();

const emit = defineEmits<{ click: [] }>();
</script>

<template>
  <v-card
    class="h-100"
    :class="{ 'kpi-metric-card--clickable': clickable }"
    :role="clickable ? 'button' : undefined"
    :tabindex="clickable ? 0 : undefined"
    :aria-label="`${title}: ${value}`"
    @click="clickable && emit('click')"
    @keydown.enter="clickable && emit('click')"
  >
    <v-card-text class="d-flex align-start ga-3">
      <v-avatar color="primary" variant="tonal" size="40" rounded="lg">
        <v-icon :icon="icon" />
      </v-avatar>
      <div class="min-w-0 flex-grow-1">
        <div class="d-flex align-center ga-1 mb-1">
          <p class="text-caption text-medium-emphasis mb-0">{{ title }}</p>
          <v-tooltip v-if="help" location="top" :text="help">
            <template #activator="{ props: tip }">
              <v-icon
                v-bind="tip"
                icon="mdi-information-outline"
                size="16"
                class="text-medium-emphasis"
              />
            </template>
          </v-tooltip>
        </div>
        <p class="text-h5 font-weight-bold mb-1" data-testid="supervision-kpi-value">{{ value }}</p>
        <p class="text-caption text-medium-emphasis mb-0">{{ hint }}</p>
      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped lang="scss">
.kpi-metric-card--clickable {
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    transform 0.15s ease;

  &:hover {
    border-color: rgb(var(--v-theme-primary));
    transform: translateY(-1px);
  }
}
</style>
