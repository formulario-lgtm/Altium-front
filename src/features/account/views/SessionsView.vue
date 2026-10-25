<script setup lang="ts">
import { computed, ref } from 'vue';
import ConfirmDialog from '@/components/common/ConfirmDialog.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import ErrorState from '@/components/common/ErrorState.vue';
import PageHeader from '@/components/common/PageHeader.vue';
import { useLogoutAllMutation } from '@/features/auth/composables/useAuthMutations';
import { formatDateTime } from '@/utils/format';
import { apiErrorMessage, isApiError, type Session } from '@/services/http';
import { useRevokeSessionMutation, useSessionsQuery } from '../composables/useSessions';

const sessionsQuery = useSessionsQuery();
const revokeMutation = useRevokeSessionMutation();
const logoutAllMutation = useLogoutAllMutation();

const sessions = computed(() => sessionsQuery.data.value?.items ?? []);
const target = ref<Session | null>(null);
const revokeOpen = ref(false);
const logoutAllOpen = ref(false);

const loadError = computed(() => sessionsQuery.error.value);
const revokeError = computed(() =>
  revokeMutation.error.value ? apiErrorMessage(revokeMutation.error.value) : null,
);

function askRevoke(session: Session): void {
  target.value = session;
  revokeMutation.reset();
  revokeOpen.value = true;
}

async function confirmRevoke(): Promise<void> {
  if (!target.value) return;
  try {
    await revokeMutation.mutateAsync(target.value.id);
    revokeOpen.value = false;
  } catch {
    // Rendered in the dialog.
  }
}
</script>

<template>
  <div>
    <PageHeader
      title="Sesiones activas"
      subtitle="Dispositivos con una sesión abierta en tu cuenta."
    >
      <template #actions>
        <v-btn
          variant="outlined"
          color="error"
          prepend-icon="mdi-logout-variant"
          @click="logoutAllOpen = true"
        >
          Cerrar todas
        </v-btn>
      </template>
    </PageHeader>

    <ErrorState
      v-if="loadError"
      :message="apiErrorMessage(loadError)"
      :request-id="isApiError(loadError) ? loadError.requestId : null"
      :loading="sessionsQuery.isFetching.value"
      @retry="sessionsQuery.refetch()"
    />

    <v-card v-else>
      <v-progress-linear v-if="sessionsQuery.isPending.value" indeterminate color="primary" />
      <EmptyState
        v-if="!sessionsQuery.isPending.value && sessions.length === 0"
        title="No hay sesiones activas"
      />
      <v-list v-else lines="three" class="py-0">
        <template v-for="(session, index) in sessions" :key="session.id">
          <v-divider v-if="index > 0" />
          <v-list-item>
            <template #prepend>
              <v-icon icon="mdi-monitor-cellphone" class="text-medium-emphasis" />
            </template>
            <v-list-item-title class="d-flex align-center ga-2">
              <span class="text-truncate">{{
                session.userAgent ?? 'Dispositivo desconocido'
              }}</span>
              <v-chip v-if="session.current" color="primary" variant="tonal" label>
                Sesión actual
              </v-chip>
            </v-list-item-title>
            <v-list-item-subtitle>
              IP {{ session.ipAddress ?? '—' }} · Última actividad
              {{ formatDateTime(session.lastActivityAt) }}
            </v-list-item-subtitle>
            <v-list-item-subtitle>
              Iniciada {{ formatDateTime(session.createdAt) }} · Expira
              {{ formatDateTime(session.expiresAt) }}
            </v-list-item-subtitle>
            <template v-if="!session.current" #append>
              <v-btn variant="text" color="error" size="small" @click="askRevoke(session)">
                Cerrar
              </v-btn>
            </template>
          </v-list-item>
        </template>
      </v-list>
    </v-card>

    <ConfirmDialog
      v-model="revokeOpen"
      title="Cerrar sesión remota"
      message="El dispositivo deberá iniciar sesión nuevamente."
      confirm-text="Cerrar sesión"
      color="error"
      :loading="revokeMutation.isPending.value"
      :error-message="revokeError"
      @confirm="confirmRevoke"
    />
    <ConfirmDialog
      v-model="logoutAllOpen"
      title="Cerrar todas las sesiones"
      message="Se cerrarán todas tus sesiones, incluida esta. Tendrás que volver a iniciar sesión."
      confirm-text="Cerrar todas"
      color="error"
      :loading="logoutAllMutation.isPending.value"
      @confirm="logoutAllMutation.mutate()"
    />
  </div>
</template>
