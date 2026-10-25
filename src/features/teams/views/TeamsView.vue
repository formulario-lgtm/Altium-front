<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import EmptyState from '@/components/common/EmptyState.vue';
import ErrorState from '@/components/common/ErrorState.vue';
import PageHeader from '@/components/common/PageHeader.vue';
import StatusBadge from '@/components/common/StatusBadge.vue';
import { useDebouncedRef } from '@/composables/useDebouncedRef';
import { apiErrorMessage, isApiError, type Team, type TeamListQuery } from '@/services/http';
import { useAuthStore } from '@/stores/auth.store';
import { fullName } from '@/utils/format';
import TeamFormDialog from '../components/TeamFormDialog.vue';
import { useTeamEditor } from '../composables/useTeamEditor';
import { useTeamsQuery } from '../composables/useTeams';

const auth = useAuthStore();
const router = useRouter();
const canCreate = computed(() => auth.hasPermission('teams.create'));

const page = ref(1);
const itemsPerPage = ref(25);
const search = ref('');
const debouncedSearch = useDebouncedRef(search);
const activeFilter = ref<boolean | null>(null);

watch([debouncedSearch, activeFilter], () => {
  page.value = 1;
});

const listQuery = computed<TeamListQuery>(() => {
  const query: TeamListQuery = {
    limit: itemsPerPage.value,
    offset: (page.value - 1) * itemsPerPage.value,
  };
  const q = debouncedSearch.value.trim();
  if (q) query.q = q;
  if (activeFilter.value !== null) query.isActive = activeFilter.value;
  return query;
});

const teamsQuery = useTeamsQuery(listQuery);
const items = computed(() => teamsQuery.data.value?.items ?? []);
const total = computed(() => teamsQuery.data.value?.pageInfo.total ?? 0);
const loadError = computed(() => teamsQuery.error.value);

const editor = useTeamEditor((team) => {
  void router.push({ name: 'team-detail', params: { id: team.id } });
});

const activeOptions = [
  { title: 'Activos', value: true },
  { title: 'Inactivos', value: false },
];

const headers = [
  { title: 'Equipo', key: 'name', sortable: false },
  { title: 'Supervisor', key: 'supervisor', sortable: false },
  { title: 'Miembros', key: 'activeMemberCount', sortable: false, align: 'end' as const },
  { title: 'Estado', key: 'isActive', sortable: false },
];

function openTeam(_event: unknown, row: { item: Team }): void {
  void router.push({ name: 'team-detail', params: { id: row.item.id } });
}
</script>

<template>
  <div>
    <PageHeader title="Equipos" subtitle="Equipos comerciales, supervisores y miembros.">
      <template v-if="canCreate" #actions>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="editor.openCreate()">
          Nuevo equipo
        </v-btn>
      </template>
    </PageHeader>

    <v-row dense class="altium-filters mb-4">
      <v-col cols="12" md="6">
        <v-text-field
          v-model="search"
          label="Buscar por nombre"
          prepend-inner-icon="mdi-magnify"
          clearable
          @click:clear="search = ''"
        />
      </v-col>
      <v-col cols="12" md="3">
        <v-select v-model="activeFilter" :items="activeOptions" label="Estado" clearable />
      </v-col>
    </v-row>

    <ErrorState
      v-if="loadError"
      :message="apiErrorMessage(loadError)"
      :request-id="isApiError(loadError) ? loadError.requestId : null"
      :loading="teamsQuery.isFetching.value"
      @retry="teamsQuery.refetch()"
    />

    <v-card v-else>
      <v-data-table-server
        v-model:page="page"
        v-model:items-per-page="itemsPerPage"
        :headers="headers"
        :items="items"
        :items-length="total"
        :loading="teamsQuery.isFetching.value"
        :items-per-page-options="[10, 25, 50, 100]"
        item-value="id"
        loading-text="Cargando equipos…"
        class="altium-clickable-rows"
        @click:row="openTeam"
      >
        <template #[`item.name`]="{ item }">
          <router-link
            :to="{ name: 'team-detail', params: { id: item.id } }"
            class="font-weight-medium text-decoration-none"
            @click.stop
          >
            {{ item.name }}
          </router-link>
        </template>
        <template #[`item.supervisor`]="{ item }">{{ fullName(item.supervisor) }}</template>
        <template #[`item.isActive`]="{ item }">
          <StatusBadge :status="item.isActive ? 'ACTIVE' : 'INACTIVE'" />
        </template>
        <template #no-data>
          <EmptyState
            title="No hay equipos"
            text="Crea un equipo o ajusta los filtros."
            icon="mdi-account-group-outline"
          />
        </template>
      </v-data-table-server>
    </v-card>

    <TeamFormDialog
      v-model="editor.open.value"
      :team="editor.editing.value"
      :supervisors="editor.supervisors.value"
      :supervisors-loading="editor.supervisorsLoading.value"
      :loading="editor.loading.value"
      :error-message="editor.errorMessage.value"
      @submit="editor.submit"
    />
  </div>
</template>
