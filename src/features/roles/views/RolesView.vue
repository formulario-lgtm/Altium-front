<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import ConfirmDialog from '@/components/common/ConfirmDialog.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import ErrorState from '@/components/common/ErrorState.vue';
import PageHeader from '@/components/common/PageHeader.vue';
import { apiErrorMessage, isApiError } from '@/services/http';
import { useAuthStore } from '@/stores/auth.store';
import { roleLabel } from '@/utils/role-labels';
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
const selectedCount = computed(() => draft.value.length);

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
      subtitle="Definí qué puede hacer cada rol. Los cambios aplican en la próxima solicitud de las sesiones activas."
    >
      <template v-if="canEdit && canReadCatalog && selectedRole" #actions>
        <v-btn
          color="primary"
          :disabled="!dirty"
          prepend-icon="mdi-content-save-outline"
          @click="openConfirm"
        >
          Guardar cambios
        </v-btn>
      </template>
    </PageHeader>

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
      <v-col cols="12" md="4" lg="3">
        <v-card class="altium-roles-rail">
          <v-card-title class="text-subtitle-1 font-weight-bold pb-1">Roles</v-card-title>
          <v-card-subtitle class="pb-3">
            Elegí un rol para ver o editar sus permisos.
          </v-card-subtitle>
          <v-progress-linear v-if="rolesQuery.isPending.value" indeterminate color="primary" />
          <v-list class="altium-nav pa-2 pt-0" nav aria-label="Roles">
            <v-list-item
              v-for="role in roles"
              :key="role.id"
              :value="role.id"
              :active="role.id === selectedRoleId"
              :title="role.name"
              :subtitle="`${role.permissionCodes.length} permiso${role.permissionCodes.length === 1 ? '' : 's'}`"
              rounded="lg"
              class="mb-1"
              @click="selectedRoleId = role.id"
            >
              <template #append>
                <span class="text-caption text-medium-emphasis font-weight-medium">{{
                  roleLabel(role.code)
                }}</span>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <v-col cols="12" md="8" lg="9">
        <v-card v-if="selectedRole">
          <v-card-item class="pb-2">
            <v-card-title class="text-h6 font-weight-bold">{{ selectedRole.name }}</v-card-title>
            <v-card-subtitle class="text-wrap">
              {{ selectedRole.description ?? 'Sin descripción.' }}
              ·
              {{ selectedCount }} permiso{{ selectedCount === 1 ? '' : 's' }} seleccionados
            </v-card-subtitle>
          </v-card-item>

          <v-card-text>
            <v-alert v-if="saved" type="success" density="comfortable" class="mb-4" variant="tonal">
              Permisos actualizados. Las sesiones activas los aplican en su próxima solicitud.
            </v-alert>
            <v-alert
              v-if="isSuperAdmin"
              type="info"
              density="comfortable"
              class="mb-4"
              variant="tonal"
            >
              Super administrador conserva permisos críticos (candado). No se pueden quitar desde
              esta pantalla.
            </v-alert>
            <v-alert v-if="!canEdit" type="info" density="comfortable" class="mb-4" variant="tonal">
              Solo lectura: tu usuario no puede modificar permisos de roles.
            </v-alert>
            <v-alert v-if="dirty" type="warning" density="comfortable" class="mb-4" variant="tonal">
              Hay cambios sin guardar. Usá “Guardar cambios” para aplicarlos.
            </v-alert>

            <v-progress-linear
              v-if="canReadCatalog && permissionsQuery.isPending.value"
              indeterminate
              color="primary"
              class="mb-4"
            />
            <RolePermissionsEditor
              v-else-if="canReadCatalog"
              v-model="draft"
              :role-code="selectedRole.code"
              :catalog="catalog"
              :readonly="!canEdit"
            />
            <p v-else class="text-body-2 text-medium-emphasis mb-0">
              Este rol tiene {{ selectedRole.permissionCodes.length }} permiso{{
                selectedRole.permissionCodes.length === 1 ? '' : 's'
              }}. Necesitás permiso para leer el catálogo y ver el detalle.
            </p>
          </v-card-text>
        </v-card>
        <EmptyState
          v-else-if="!rolesQuery.isPending.value"
          title="No hay roles"
          text="Los roles de sistema se cargan con las semillas de la base de datos."
          icon="mdi-shield-account-outline"
        />
      </v-col>
    </v-row>

    <ConfirmDialog
      v-model="confirmOpen"
      title="Guardar permisos del rol"
      confirm-text="Guardar"
      color="primary"
      :loading="saveMutation.isPending.value"
      :error-message="saveMutation.error.value ? apiErrorMessage(saveMutation.error.value) : null"
      @confirm="save"
    >
      <p class="text-body-2 mb-2">
        Se reemplazará el conjunto completo de permisos de
        <strong>{{ selectedRole?.name }}</strong
        >. Quienes tengan este rol verán el cambio en su próxima solicitud al sistema.
      </p>
      <p v-if="isSuperAdmin" class="text-body-2 mb-0">
        Los permisos protegidos de Super administrador no pueden quitarse; si faltan, el servidor
        rechazará el cambio.
      </p>
    </ConfirmDialog>
  </div>
</template>
