<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import ConfirmDialog from '@/components/common/ConfirmDialog.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import ErrorState from '@/components/common/ErrorState.vue';
import PageHeader from '@/components/common/PageHeader.vue';
import StatusBadge from '@/components/common/StatusBadge.vue';
import { apiErrorMessage, isApiError, type TeamMember } from '@/services/http';
import { useAuthStore } from '@/stores/auth.store';
import { formatDateTime, fullName } from '@/utils/format';
import { roleLabel } from '@/utils/role-labels';
import TeamFormDialog from '../components/TeamFormDialog.vue';
import { useTeamEditor } from '../composables/useTeamEditor';
import {
  useActiveUsersByRole,
  useAddTeamMemberMutation,
  useRemoveTeamMemberMutation,
  useTeamMembersQuery,
  useTeamQuery,
} from '../composables/useTeams';

const route = useRoute();
const auth = useAuthStore();
const teamId = computed(() => String(route.params.id ?? ''));

const canUpdate = computed(() => auth.hasPermission('teams.update'));
const canManageMembers = computed(() => auth.hasPermission('teams.manage_members'));

const includeFormer = ref(false);
const teamQuery = useTeamQuery(teamId);
const membersQuery = useTeamMembersQuery(teamId, includeFormer);
const team = computed(() => teamQuery.data.value);
const members = computed(() => membersQuery.data.value?.items ?? []);
const loadError = computed(() => teamQuery.error.value);

const editor = useTeamEditor();

// Add member
const candidatePicker = useActiveUsersByRole(
  ['SELLER', 'ADMINISTRATIVE'],
  () => canManageMembers.value && auth.hasPermission('users.read'),
);
const candidateItems = computed(() => {
  const current = new Set(members.value.filter((m) => !m.leftAt).map((m) => m.userId));
  return candidatePicker.users.value
    .filter((user) => !current.has(user.id))
    .map((user) => ({ title: `${fullName(user)} · ${roleLabel(user.role.code)}`, value: user.id }));
});
const candidateId = ref<string | null>(null);
const addMutation = useAddTeamMemberMutation();

async function addMember(): Promise<void> {
  if (!candidateId.value) return;
  try {
    await addMutation.mutateAsync({ teamId: teamId.value, userId: candidateId.value });
    candidateId.value = null;
  } catch {
    // Rendered below the picker.
  }
}

// Remove member
const removeMutation = useRemoveTeamMemberMutation();
const removeTarget = ref<TeamMember | null>(null);
const removeOpen = ref(false);

function askRemove(member: TeamMember): void {
  removeTarget.value = member;
  removeMutation.reset();
  removeOpen.value = true;
}

async function confirmRemove(): Promise<void> {
  if (!removeTarget.value) return;
  try {
    await removeMutation.mutateAsync({ teamId: teamId.value, userId: removeTarget.value.userId });
    removeOpen.value = false;
  } catch {
    // Rendered in the dialog.
  }
}
</script>

<template>
  <div>
    <v-btn
      :to="{ name: 'teams' }"
      variant="text"
      prepend-icon="mdi-arrow-left"
      class="mb-2 px-1"
      size="small"
    >
      Equipos
    </v-btn>

    <ErrorState
      v-if="loadError"
      :message="apiErrorMessage(loadError)"
      :request-id="isApiError(loadError) ? loadError.requestId : null"
      :retryable="!isApiError(loadError) || loadError.kind !== 'not_found'"
      @retry="teamQuery.refetch()"
    />
    <v-progress-linear v-else-if="teamQuery.isPending.value" indeterminate color="primary" />

    <template v-else-if="team">
      <PageHeader :title="team.name" :subtitle="team.description ?? undefined">
        <template #actions>
          <StatusBadge :status="team.isActive ? 'ACTIVE' : 'INACTIVE'" />
          <v-btn
            v-if="canUpdate"
            variant="outlined"
            prepend-icon="mdi-pencil-outline"
            @click="editor.openEdit(team)"
          >
            Editar
          </v-btn>
        </template>
      </PageHeader>

      <v-card class="mb-6">
        <v-card-text class="d-flex flex-wrap ga-6">
          <div>
            <p class="text-caption text-medium-emphasis mb-0">Supervisor</p>
            <p class="mb-0 font-weight-medium">{{ fullName(team.supervisor) }}</p>
            <p class="text-body-2 text-medium-emphasis mb-0">{{ team.supervisor.email }}</p>
          </div>
          <div>
            <p class="text-caption text-medium-emphasis mb-0">Miembros activos</p>
            <p class="mb-0 font-weight-medium">{{ team.activeMemberCount }}</p>
          </div>
          <div>
            <p class="text-caption text-medium-emphasis mb-0">Actualizado</p>
            <p class="mb-0">{{ formatDateTime(team.updatedAt) }}</p>
          </div>
        </v-card-text>
      </v-card>

      <div class="d-flex flex-wrap align-center ga-4 mb-3">
        <h2 class="text-subtitle-1 font-weight-bold flex-grow-1 mb-0">Miembros</h2>
        <v-switch v-model="includeFormer" label="Incluir históricos" hide-details />
      </div>

      <v-card v-if="canManageMembers && team.isActive" class="mb-4">
        <v-card-text class="d-flex flex-wrap align-start ga-3">
          <v-autocomplete
            v-model="candidateId"
            :items="candidateItems"
            :loading="candidatePicker.query.isFetching.value"
            label="Agregar miembro (vendedor o administrativo activo)"
            class="flex-grow-1"
            style="min-width: 260px"
            no-data-text="No hay usuarios disponibles"
          />
          <v-btn
            color="primary"
            :disabled="!candidateId"
            :loading="addMutation.isPending.value"
            @click="addMember"
          >
            Agregar
          </v-btn>
        </v-card-text>
        <v-alert
          v-if="addMutation.error.value"
          type="error"
          density="compact"
          class="mx-4 mb-4"
          role="alert"
        >
          {{ apiErrorMessage(addMutation.error.value) }}
        </v-alert>
      </v-card>

      <v-card>
        <v-progress-linear v-if="membersQuery.isFetching.value" indeterminate color="primary" />
        <EmptyState
          v-if="!membersQuery.isPending.value && members.length === 0"
          title="El equipo no tiene miembros"
          icon="mdi-account-multiple-outline"
        />
        <v-list v-else lines="two" class="py-0">
          <template v-for="(member, index) in members" :key="member.id">
            <v-divider v-if="index > 0" />
            <v-list-item
              :title="fullName(member)"
              :subtitle="`${member.email} · ${roleLabel(member.roleCode)}`"
            >
              <template #append>
                <span class="text-caption text-medium-emphasis mr-3">
                  {{
                    member.leftAt
                      ? `Salió ${formatDateTime(member.leftAt)}`
                      : `Desde ${formatDateTime(member.joinedAt)}`
                  }}
                </span>
                <v-btn
                  v-if="canManageMembers && !member.leftAt"
                  variant="text"
                  color="error"
                  size="small"
                  @click="askRemove(member)"
                >
                  Quitar
                </v-btn>
              </template>
            </v-list-item>
          </template>
        </v-list>
      </v-card>
    </template>

    <TeamFormDialog
      v-model="editor.open.value"
      :team="editor.editing.value"
      :supervisors="editor.supervisors.value"
      :supervisors-loading="editor.supervisorsLoading.value"
      :loading="editor.loading.value"
      :error-message="editor.errorMessage.value"
      @submit="editor.submit"
    />

    <ConfirmDialog
      v-model="removeOpen"
      title="Quitar miembro"
      :message="
        removeTarget
          ? `${fullName(removeTarget)} dejará el equipo. El historial de membresía se conserva.`
          : undefined
      "
      confirm-text="Quitar"
      color="error"
      :loading="removeMutation.isPending.value"
      :error-message="
        removeMutation.error.value ? apiErrorMessage(removeMutation.error.value) : null
      "
      @confirm="confirmRemove"
    />
  </div>
</template>
