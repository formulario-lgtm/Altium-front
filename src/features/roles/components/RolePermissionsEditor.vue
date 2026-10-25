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
</script>

<template>
  <div>
    <section v-for="group in groups" :key="group.resource" class="mb-4">
      <h3 class="text-overline text-medium-emphasis mb-1">{{ group.resource }}</h3>
      <v-row dense>
        <v-col v-for="permission in group.items" :key="permission.code" cols="12" sm="6">
          <v-checkbox
            :model-value="isChecked(permission.code)"
            :disabled="readonly || isProtectedPermission(roleCode, permission.code)"
            :hint="permission.description ?? undefined"
            :persistent-hint="Boolean(permission.description)"
            density="compact"
            color="primary"
            @update:model-value="toggle(permission.code, $event)"
          >
            <template #label>
              <code class="text-body-2">{{ permission.code }}</code>
              <v-icon
                v-if="isProtectedPermission(roleCode, permission.code)"
                icon="mdi-lock-outline"
                size="small"
                class="ml-1"
                aria-label="Permiso protegido"
              />
            </template>
          </v-checkbox>
        </v-col>
      </v-row>
    </section>
  </div>
</template>
