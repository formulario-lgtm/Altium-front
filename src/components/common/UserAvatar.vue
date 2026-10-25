<script setup lang="ts">
withDefaults(
  defineProps<{
    initials: string;
    size?: number | string;
    label?: string;
  }>(),
  { size: 40, label: undefined },
);
</script>

<template>
  <v-avatar
    class="altium-user-avatar"
    :size="size"
    :aria-hidden="label ? undefined : true"
    :aria-label="label"
  >
    <span class="altium-user-avatar__text">{{ initials }}</span>
  </v-avatar>
</template>

<style scoped lang="scss">
.altium-user-avatar {
  background: var(--altium-avatar-bg) !important;
  color: var(--altium-avatar-fg) !important;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.altium-user-avatar__text {
  font-size: 0.75em;
  line-height: 1;
}
</style>
