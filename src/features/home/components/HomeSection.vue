<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string;
    subtitle?: string;
  }>(),
  { subtitle: undefined },
);
</script>

<template>
  <section class="home-section d-flex flex-column flex-grow-1 h-100 w-100 mb-6">
    <header class="home-section__header d-flex flex-wrap align-start justify-space-between ga-2 mb-3">
      <div class="home-section__titles min-w-0 flex-grow-1">
        <h2 class="text-subtitle-1 font-weight-bold mb-0">{{ title }}</h2>
        <!-- Always reserve one subtitle line so paired columns share the same baseline. -->
        <p class="home-section__subtitle text-body-2 text-medium-emphasis mb-0">
          {{ subtitle || '\u00A0' }}
        </p>
      </div>
      <div v-if="$slots.actions" class="d-flex flex-wrap ga-2">
        <slot name="actions" />
      </div>
    </header>
    <div class="home-section__body flex-grow-1 d-flex flex-column min-h-0">
      <slot />
    </div>
  </section>
</template>

<style scoped lang="scss">
.home-section__subtitle {
  min-height: 1.25rem;
  line-height: 1.25rem;
}

.home-section__body {
  :deep(> .v-card),
  :deep(> .home-panel-card) {
    flex: 1 1 auto;
    width: 100%;
    min-height: 220px;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  :deep(> .v-card > .v-card-text),
  :deep(> .home-panel-card > .v-card-text) {
    flex: 1 1 auto;
  }
}
</style>
