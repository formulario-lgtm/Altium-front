<script setup lang="ts">
import { computed } from 'vue';
import type { Permission } from '@/services/http';
import { groupPermissionsByResource, isProtectedPermission } from '../utils/permissions';

const props = withDefaults(
  defineProps<{ roleCode: string; catalog: readonly Permission[]; readonly?: boolean }>(),
  { readonly: false },
);

const selected = defineModel<string[]>({ required: true });

const groups = computed(() => groupPermissionsByResource(props.catalog));

function isChecked(code: string): boolean {
  return selected.value.includes(code);
}

function toggle(code: string, checked: boolean | null): void {
  if (checked) {
    if (!isChecked(code)) selected.value = [...selected.value, code];
  } else {
    selected.value = selected.value.filter((item) => item !== code);
  }
}

function titleFor(permission: Permission): string {
  return permission.description?.trim() || permission.code;
}
</script>

<template>
  <div class="role-permissions">
    <section v-for="group in groups" :key="group.resource" class="role-permissions__group mb-5">
      <header class="role-permissions__group-head mb-3">
        <h3 class="role-permissions__group-title">{{ group.label }}</h3>
        <span class="text-caption text-medium-emphasis">
          {{ group.items.filter((item) => isChecked(item.code)).length }}/{{ group.items.length }}
        </span>
      </header>

      <div class="role-permissions__list">
        <label
          v-for="permission in group.items"
          :key="permission.code"
          class="role-permissions__item"
          :class="{
            'role-permissions__item--checked': isChecked(permission.code),
            'role-permissions__item--locked': isProtectedPermission(roleCode, permission.code),
          }"
        >
          <v-checkbox
            :model-value="isChecked(permission.code)"
            :disabled="readonly || isProtectedPermission(roleCode, permission.code)"
            :aria-label="titleFor(permission)"
            density="comfortable"
            color="primary"
            hide-details
            class="flex-grow-0 mt-0"
            @update:model-value="toggle(permission.code, $event)"
          />
          <span class="role-permissions__copy">
            <span class="role-permissions__title">
              {{ titleFor(permission) }}
              <v-icon
                v-if="isProtectedPermission(roleCode, permission.code)"
                icon="mdi-lock-outline"
                size="16"
                class="ms-1"
                aria-label="Permiso protegido: no se puede quitar de Super administrador"
              />
            </span>
          </span>
        </label>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.role-permissions__group-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
}

.role-permissions__group-title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: rgb(var(--v-theme-on-surface));
}

.role-permissions__list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.65rem;
}

@media (min-width: 960px) {
  .role-permissions__list {
    grid-template-columns: 1fr 1fr;
  }
}

.role-permissions__item {
  display: flex;
  align-items: flex-start;
  gap: 0.35rem;
  min-height: 3.5rem;
  padding: 0.65rem 0.85rem 0.65rem 0.35rem;
  border-radius: var(--altium-radius-lg, 1rem);
  border: 1px solid rgba(var(--v-border-color), 0.7);
  background: var(--altium-field-bg, transparent);
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease;
}

.role-permissions__item--checked {
  border-color: rgba(var(--v-theme-primary), 0.45);
  background: rgba(var(--v-theme-primary), 0.08);
}

.role-permissions__item--locked {
  opacity: 0.92;
}

.role-permissions__copy {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
  padding-top: 0.35rem;
}

.role-permissions__title {
  font-size: 0.9rem;
  font-weight: 600;
  line-height: 1.35;
  color: rgb(var(--v-theme-on-surface));
}
</style>
