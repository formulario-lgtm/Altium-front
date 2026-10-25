<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import ConfirmDialog from '@/components/common/ConfirmDialog.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import ErrorState from '@/components/common/ErrorState.vue';
import PageHeader from '@/components/common/PageHeader.vue';
import { apiErrorMessage, isApiError } from '@/services/http';
import { useAuthStore } from '@/stores/auth.store';
import RolePermissionsEditor from '../components/RolePermissionsEditor.vue';
import {
  usePermissionsQuery,
  useReplaceRolePermissionsMutation,
  useRolesQuery,
} from '../composables/useRoles';
import { sameCodes, SUPER_ADMIN_ROLE_CODE } from '../utils/permissions';

const auth = useAuthStore();
const canEdit = computed(() => auth.hasPermission('roles.update_permissions'));
const canReadCatalog = computed(() => auth.hasPermission('permissions.read'));

const rolesQuery = useRolesQuery();
const permissionsQuery = usePermissionsQuery(canReadCatalog);
const saveMutation = useReplaceRolePermissionsMutation();

const roles = computed(() => rolesQuery.data.value?.items ?? []);
const catalog = computed(() => permissionsQuery.data.value?.items ?? []);
const selectedRoleId = ref<string | null>(null);
const selectedRole = computed(() => roles.value.find((role) => role.id === selectedRoleId.value));
const draft = ref<string[]>([]);
const confirmOpen = ref(false);
const saved = ref(false);

watch(
  roles,
  (items) => {
    if (!selectedRoleId.value && items[0]) selectedRoleId.value = items[0].id;
  },
  { immediate: true },
);

watch(
  selectedRole,
  (role) => {
    draft.value = role ? [...role.permissionCodes] : [];
  },
  { immediate: true },
);

watch(selectedRoleId, () => {
  saved.value = false;
});

const dirty = computed(() =>
  selectedRole.value ? !sameCodes(draft.value, selectedRole.value.permissionCodes) : false,
);
const isSuperAdmin = computed(() => selectedRole.value?.code === SUPER_ADMIN_ROLE_CODE);
const loadError = computed(() => rolesQuery.error.value ?? permissionsQuery.error.value);

function openConfirm(): void {
  saveMutation.reset();
  confirmOpen.value = true;
}

async function save(): Promise<void> {
  if (!selectedRole.value) return;
  try {
    await saveMutation.mutateAsync({
      roleId: selectedRole.value.id,
      permissionCodes: [...draft.value].sort(),
    });
    confirmOpen.value = false;
    saved.value = true;
  } catch {
    // Rendered in the dialog.
  }
}
</script>

<template>
  <div>
    <PageHeader
      title="Roles y permisos"
      subtitle="Los cambios aplican a las sesiones activas en su próxima solicitud."
    />

    <ErrorState
      v-if="loadError"
      :message="apiErrorMessage(loadError)"
      :request-id="isApiError(loadError) ? loadError.requestId : null"
      @retry="
        rolesQuery.refetch();
        permissionsQuery.refetch();
      "
    />

    <v-row v-else>
      <v-col cols="12" md="4">
        <v-card>
          <v-progress-linear v-if="rolesQuery.isPending.value" indeterminate color="primary" />
          <v-list color="primary" nav class="pa-2" aria-label="Roles">
            <v-list-item
              v-for="role in roles"
              :key="role.id"
              :value="role.id"
              :active="role.id === selectedRoleId"
              :title="role.name"
              :subtitle="`${role.code} · ${role.permissionCodes.length} permisos`"
              rounded="md"
              @click="selectedRoleId = role.id"
            />
          </v-list>
        </v-card>
      </v-col>

      <v-col cols="12" md="8">
        <v-card v-if="selectedRole">
          <v-card-item :title="selectedRole.name" :subtitle="selectedRole.description ?? undefined">
            <template v-if="canEdit && canReadCatalog" #append>
              <v-btn color="primary" :disabled="!dirty" @click="openConfirm">Guardar cambios</v-btn>
            </template>
          </v-card-item>
          <v-card-text>
            <v-alert v-if="saved" type="success" density="compact" class="mb-4">
              Permisos actualizados.
            </v-alert>
            <v-alert v-if="isSuperAdmin" type="info" density="compact" class="mb-4">
              SUPER_ADMIN conserva siempre sus permisos protegidos (marcados con candado).
            </v-alert>
            <v-alert v-if="!canEdit" type="info" density="compact" class="mb-4">
              Vista de solo lectura: tu rol no puede modificar permisos.
            </v-alert>

            <v-progress-linear
              v-if="canReadCatalog && permissionsQuery.isPending.value"
              indeterminate
              color="primary"
            />
            <RolePermissionsEditor
              v-else-if="canReadCatalog"
              v-model="draft"
              :role-code="selectedRole.code"
              :catalog="catalog"
              :readonly="!canEdit"
            />
            <div v-else class="d-flex flex-wrap ga-2">
              <v-chip v-for="code in selectedRole.permissionCodes" :key="code" label>
                {{ code }}
              </v-chip>
            </div>
          </v-card-text>
        </v-card>
        <EmptyState v-else-if="!rolesQuery.isPending.value" title="No hay roles" />
      </v-col>
    </v-row>

    <ConfirmDialog
      v-model="confirmOpen"
      title="Reemplazar permisos del rol"
      confirm-text="Guardar"
      color="warning"
      :loading="saveMutation.isPending.value"
      :error-message="saveMutation.error.value ? apiErrorMessage(saveMutation.error.value) : null"
      @confirm="save"
    >
      <p class="text-body-2 mb-2">
        Se reemplazará el conjunto completo de permisos de
        <strong>{{ selectedRole?.name }}</strong
        >. Los usuarios con este rol verán el cambio de inmediato.
      </p>
      <p v-if="isSuperAdmin" class="text-body-2 mb-0">
        Los permisos protegidos de SUPER_ADMIN no pueden quitarse; el servidor rechazará el cambio
        si faltan.
      </p>
    </ConfirmDialog>
  </div>
</template>
