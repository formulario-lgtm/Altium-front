<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import ConfirmDialog from '@/components/common/ConfirmDialog.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import ErrorState from '@/components/common/ErrorState.vue';
import PageHeader from '@/components/common/PageHeader.vue';
import StatusBadge from '@/components/common/StatusBadge.vue';
import UserAvatar from '@/components/common/UserAvatar.vue';
import { useDebouncedRef } from '@/composables/useDebouncedRef';
import { useRolesQuery } from '@/features/roles/composables/useRoles';
import {
  apiErrorMessage,
  fieldErrorsToMap,
  isApiError,
  type SettableUserStatus,
  type User,
  type UserListQuery,
  type UserStatus,
} from '@/services/http';
import { useAuthStore } from '@/stores/auth.store';
import { formatDateTime, fullName, initialsFromPerson } from '@/utils/format';
import UserFormDialog from '../components/UserFormDialog.vue';
import {
  useCreateUserMutation,
  useRequestUserPasswordResetMutation,
  useUpdateUserMutation,
  useUpdateUserStatusMutation,
  useUsersQuery,
} from '../composables/useUsers';
import type { UserFormValues } from '../schemas/user.schema';
import {
  availableStatusTargets,
  canSendPasswordLink,
  STATUS_ACTION_LABELS,
} from '../utils/user-actions';

const auth = useAuthStore();
const canCreate = computed(() => auth.hasPermission('users.create'));
const canUpdate = computed(() => auth.hasPermission('users.update'));
const canUpdateStatus = computed(() => auth.hasPermission('users.update_status'));
const canResetPassword = computed(() => auth.hasPermission('users.reset_password'));

const page = ref(1);
const itemsPerPage = ref(25);
const search = ref('');
const debouncedSearch = useDebouncedRef(search);
const statusFilter = ref<UserStatus | null>(null);
const roleFilter = ref<string | null>(null);

watch([debouncedSearch, statusFilter, roleFilter], () => {
  page.value = 1;
});

const listQuery = computed<UserListQuery>(() => {
  const query: UserListQuery = {
    limit: itemsPerPage.value,
    offset: (page.value - 1) * itemsPerPage.value,
  };
  const q = debouncedSearch.value.trim();
  if (q) query.q = q;
  if (statusFilter.value) query.status = statusFilter.value;
  if (roleFilter.value) query.roleId = roleFilter.value;
  return query;
});

const usersQuery = useUsersQuery(listQuery);
const rolesQuery = useRolesQuery(() => auth.hasPermission('roles.read'));
const roles = computed(() => rolesQuery.data.value?.items ?? []);

const items = computed(() => usersQuery.data.value?.items ?? []);
const total = computed(() => usersQuery.data.value?.pageInfo.total ?? 0);
const loadError = computed(() => usersQuery.error.value);

const statusOptions: { title: string; value: UserStatus }[] = [
  { title: 'Pendiente', value: 'PENDING' },
  { title: 'Activo', value: 'ACTIVE' },
  { title: 'Suspendido', value: 'SUSPENDED' },
  { title: 'Deshabilitado', value: 'DISABLED' },
];
const roleOptions = computed(() =>
  roles.value.map((role) => ({ title: role.name, value: role.id })),
);

const headers = [
  { title: 'Nombre', key: 'name', sortable: false },
  { title: 'Rol', key: 'role', sortable: false },
  { title: 'Estado', key: 'status', sortable: false },
  { title: 'Último acceso', key: 'lastLoginAt', sortable: false },
  { title: '', key: 'actions', sortable: false, align: 'end' as const },
];

const snackbar = ref<string | null>(null);

// Create / edit
const formOpen = ref(false);
const editing = ref<User | null>(null);
const createMutation = useCreateUserMutation();
const updateMutation = useUpdateUserMutation();
const activeFormMutation = computed(() => (editing.value ? updateMutation : createMutation));
const formError = computed(() => activeFormMutation.value.error.value);
const formErrorMessage = computed(() =>
  formError.value ? apiErrorMessage(formError.value) : null,
);
const formFieldErrors = computed(() =>
  isApiError(formError.value) ? fieldErrorsToMap(formError.value) : {},
);

function openCreate(): void {
  editing.value = null;
  createMutation.reset();
  formOpen.value = true;
}

function openEdit(user: User): void {
  editing.value = user;
  updateMutation.reset();
  formOpen.value = true;
}

async function submitForm(values: UserFormValues): Promise<void> {
  try {
    if (editing.value) {
      const current = editing.value;
      const body = {
        ...(values.firstName !== current.firstName && { firstName: values.firstName }),
        ...(values.lastName !== current.lastName && { lastName: values.lastName }),
        ...(values.email !== current.email && { email: values.email }),
        ...(values.roleId !== current.role.id && { roleId: values.roleId }),
      };
      if (Object.keys(body).length > 0) {
        await updateMutation.mutateAsync({ id: current.id, body });
      }
      snackbar.value = 'Usuario actualizado.';
    } else {
      await createMutation.mutateAsync(values);
      snackbar.value = 'Usuario creado como pendiente de activación.';
    }
    formOpen.value = false;
  } catch {
    // Rendered in the dialog.
  }
}

// Status change
const statusMutation = useUpdateUserStatusMutation();
const statusTarget = ref<{ user: User; status: SettableUserStatus } | null>(null);
const statusOpen = ref(false);
const statusDialogTitle = computed(() =>
  statusTarget.value
    ? `${STATUS_ACTION_LABELS[statusTarget.value.status]} a ${fullName(statusTarget.value.user)}`
    : '',
);
const statusDialogMessage = computed(() =>
  statusTarget.value?.status === 'ACTIVE'
    ? 'El usuario podrá volver a iniciar sesión.'
    : 'Se cerrarán todas las sesiones activas del usuario.',
);

function askStatus(user: User, status: SettableUserStatus): void {
  statusTarget.value = { user, status };
  statusMutation.reset();
  statusOpen.value = true;
}

async function confirmStatus(): Promise<void> {
  if (!statusTarget.value) return;
  try {
    await statusMutation.mutateAsync({
      id: statusTarget.value.user.id,
      status: statusTarget.value.status,
    });
    statusOpen.value = false;
    snackbar.value = 'Estado actualizado.';
  } catch {
    // Rendered in the dialog.
  }
}

// Password / activation link
const resetMutation = useRequestUserPasswordResetMutation();
const resetTarget = ref<User | null>(null);
const resetOpen = ref(false);

function askReset(user: User): void {
  resetTarget.value = user;
  resetMutation.reset();
  resetOpen.value = true;
}

async function confirmReset(): Promise<void> {
  if (!resetTarget.value) return;
  try {
    await resetMutation.mutateAsync(resetTarget.value.id);
    resetOpen.value = false;
    snackbar.value = 'Solicitud registrada. El enlace se envía por el canal de notificaciones.';
  } catch {
    // Rendered in the dialog.
  }
}

function isSelf(user: User): boolean {
  return user.id === auth.user?.id;
}

function hasRowActions(user: User): boolean {
  if (canUpdate.value) return true;
  if (isSelf(user)) return false;
  return canUpdateStatus.value || (canResetPassword.value && canSendPasswordLink(user));
}
</script>

<template>
  <div>
    <PageHeader title="Usuarios" subtitle="Cuentas con acceso a Altium CRM.">
      <template v-if="canCreate" #actions>
        <v-btn color="primary" prepend-icon="mdi-account-plus-outline" @click="openCreate">
          Nuevo usuario
        </v-btn>
      </template>
    </PageHeader>

    <v-row dense class="altium-filters mb-4">
      <v-col cols="12" md="5">
        <v-text-field
          v-model="search"
          label="Buscar por nombre o correo"
          prepend-inner-icon="mdi-magnify"
          clearable
          maxlength="100"
          @click:clear="search = ''"
        />
      </v-col>
      <v-col cols="6" md="3">
        <v-select v-model="statusFilter" :items="statusOptions" label="Estado" clearable />
      </v-col>
      <v-col v-if="roleOptions.length > 0" cols="6" md="4">
        <v-select v-model="roleFilter" :items="roleOptions" label="Rol" clearable />
      </v-col>
    </v-row>

    <ErrorState
      v-if="loadError"
      :message="apiErrorMessage(loadError)"
      :request-id="isApiError(loadError) ? loadError.requestId : null"
      :loading="usersQuery.isFetching.value"
      @retry="usersQuery.refetch()"
    />

    <v-card v-else>
      <v-data-table-server
        v-model:page="page"
        v-model:items-per-page="itemsPerPage"
        :headers="headers"
        :items="items"
        :items-length="total"
        :loading="usersQuery.isFetching.value"
        :items-per-page-options="[10, 25, 50, 100]"
        item-value="id"
        loading-text="Cargando usuarios…"
        data-testid="users-table"
      >
        <template #[`item.name`]="{ item }">
          <div class="d-flex align-center ga-3 py-2">
            <UserAvatar :initials="initialsFromPerson(item)" :size="40" />
            <div style="min-width: 0">
              <div class="font-weight-medium text-truncate">{{ fullName(item) }}</div>
              <div class="text-caption text-medium-emphasis text-truncate">{{ item.email }}</div>
            </div>
          </div>
        </template>
        <template #[`item.role`]="{ item }">{{ item.role.name }}</template>
        <template #[`item.status`]="{ item }">
          <StatusBadge :status="item.status" />
        </template>
        <template #[`item.lastLoginAt`]="{ item }">{{ formatDateTime(item.lastLoginAt) }}</template>
        <template #[`item.actions`]="{ item }">
          <v-menu v-if="hasRowActions(item)" location="bottom end">
            <template #activator="{ props: menuProps }">
              <v-btn
                v-bind="menuProps"
                icon="mdi-dots-vertical"
                variant="text"
                size="small"
                :aria-label="`Acciones para ${fullName(item)}`"
              />
            </template>
            <v-list density="compact">
              <v-list-item
                v-if="canUpdate"
                prepend-icon="mdi-pencil-outline"
                title="Editar"
                @click="openEdit(item)"
              />
              <template v-if="canUpdateStatus && !isSelf(item)">
                <v-list-item
                  v-for="status in availableStatusTargets(item)"
                  :key="status"
                  :title="STATUS_ACTION_LABELS[status]"
                  prepend-icon="mdi-account-switch-outline"
                  @click="askStatus(item, status)"
                />
              </template>
              <v-list-item
                v-if="canResetPassword && !isSelf(item) && canSendPasswordLink(item)"
                prepend-icon="mdi-email-fast-outline"
                :title="
                  item.status === 'PENDING' ? 'Reenviar activación' : 'Enviar restablecimiento'
                "
                @click="askReset(item)"
              />
            </v-list>
          </v-menu>
        </template>
        <template #no-data>
          <EmptyState
            title="No hay usuarios"
            text="Ajusta la búsqueda o los filtros."
            icon="mdi-account-search-outline"
          />
        </template>
      </v-data-table-server>
    </v-card>

    <UserFormDialog
      v-model="formOpen"
      :user="editing"
      :roles="roles"
      :role-locked="editing !== null && isSelf(editing)"
      :loading="activeFormMutation.isPending.value"
      :error-message="formErrorMessage"
      :field-errors="formFieldErrors"
      @submit="submitForm"
    />

    <ConfirmDialog
      v-model="statusOpen"
      :title="statusDialogTitle"
      :message="statusDialogMessage"
      :confirm-text="statusTarget ? STATUS_ACTION_LABELS[statusTarget.status] : 'Confirmar'"
      :color="statusTarget?.status === 'ACTIVE' ? 'primary' : 'error'"
      :loading="statusMutation.isPending.value"
      :error-message="
        statusMutation.error.value ? apiErrorMessage(statusMutation.error.value) : null
      "
      @confirm="confirmStatus"
    />

    <ConfirmDialog
      v-model="resetOpen"
      :title="resetTarget?.status === 'PENDING' ? 'Reenviar activación' : 'Enviar restablecimiento'"
      :message="
        resetTarget
          ? `Se generará un nuevo enlace para ${resetTarget.email}. Los enlaces anteriores dejarán de funcionar.`
          : undefined
      "
      confirm-text="Enviar enlace"
      :loading="resetMutation.isPending.value"
      :error-message="resetMutation.error.value ? apiErrorMessage(resetMutation.error.value) : null"
      @confirm="confirmReset"
    />

    <v-snackbar
      :model-value="snackbar !== null"
      timeout="4000"
      @update:model-value="snackbar = null"
    >
      {{ snackbar }}
    </v-snackbar>
  </div>
</template>
