<script setup lang="ts">
withDefaults(
  defineProps<{
    withWordmark?: boolean;
    size?: 'sm' | 'md' | 'lg' | 'xl';
  }>(),
  { withWordmark: true, size: 'md' },
);
</script>

<template>
  <div class="altium-mark" :class="`altium-mark--${size}`" aria-label="Altium">
    <!-- Provisional mark: folded "A" inspired by the Stage 5 mock (not a final logo). -->
    <svg
      class="altium-mark__glyph"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path class="altium-mark__back" d="M20 4.5L34.5 33.5H24.2L20 24.2L15.8 33.5H5.5L20 4.5Z" />
      <path class="altium-mark__front" d="M20 10.2L29.8 32H22.6L20 26.2L17.4 32H10.2L20 10.2Z" />
      <path
        class="altium-mark__fold"
        d="M20 10.2L24.8 21.2C22.9 22.4 20.9 22.4 19 21.2L20 10.2Z"
        opacity="0.9"
      />
    </svg>
    <span v-if="withWordmark" class="altium-mark__word">Altium</span>
  </div>
</template>

<style scoped lang="scss">
.altium-mark {
  display: inline-flex;
  align-items: center;
  gap: 0.85rem;
  user-select: none;
}

.altium-mark__glyph {
  display: block;
  flex-shrink: 0;
}

.altium-mark--sm .altium-mark__glyph {
  width: 1.5rem;
  height: 1.5rem;
}
.altium-mark--md .altium-mark__glyph {
  width: 2rem;
  height: 2rem;
}
.altium-mark--lg .altium-mark__glyph {
  width: 2.75rem;
  height: 2.75rem;
}
.altium-mark--xl .altium-mark__glyph {
  width: 6.5rem;
  height: 6.5rem;
}

.altium-mark__back {
  fill: color-mix(in srgb, var(--auth-accent, #3b82f6) 50%, #16305c);
}

.altium-mark__front {
  fill: var(--auth-accent, #3b82f6);
}

.altium-mark__fold {
  fill: color-mix(in srgb, var(--auth-accent, #3b82f6) 45%, white);
}

.altium-mark__word {
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--auth-text, rgb(var(--v-theme-on-background)));
  line-height: 1;
}

.altium-mark--sm .altium-mark__word {
  font-size: 1.15rem;
}
.altium-mark--md .altium-mark__word {
  font-size: 1.35rem;
}
.altium-mark--lg .altium-mark__word {
  font-size: 1.85rem;
}
.altium-mark--xl .altium-mark__word {
  font-size: 6.5rem;
}

.altium-mark--xl {
  gap: 1.35rem;
}
</style>
