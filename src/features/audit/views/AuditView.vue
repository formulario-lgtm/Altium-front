<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import EmptyState from '@/components/common/EmptyState.vue';
import ErrorState from '@/components/common/ErrorState.vue';
import PageHeader from '@/components/common/PageHeader.vue';
import StatusBadge from '@/components/common/StatusBadge.vue';
import { useDebouncedRef } from '@/composables/useDebouncedRef';
import { apiErrorMessage, isApiError, type AuditLog, type AuditLogQuery } from '@/services/http';
import { formatDateTime } from '@/utils/format';
import AuditDetailDrawer from '../components/AuditDetailDrawer.vue';
import { useAuditLogsQuery } from '../composables/useAuditLogs';

const page = ref(1);
const itemsPerPage = ref(25);
const action = ref('');
const entityType = ref('');
const fromDate = ref('');
const toDate = ref('');
const debouncedAction = useDebouncedRef(action);
const debouncedEntityType = useDebouncedRef(entityType);

watch([debouncedAction, debouncedEntityType, fromDate, toDate], () => {
  page.value = 1;
});

/** `<input type="date">` gives local dates; convert to inclusive ISO bounds. */
function toIsoBound(value: string, endOfDay: boolean): string | undefined {
  if (!value) return undefined;
  const date = new Date(`${value}T${endOfDay ? '23:59:59.999' : '00:00:00.000'}`);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

const listQuery = computed<AuditLogQuery>(() => {
  const query: AuditLogQuery = {
    limit: itemsPerPage.value,
    offset: (page.value - 1) * itemsPerPage.value,
  };
  const actionValue = debouncedAction.value.trim();
  const entityValue = debouncedEntityType.value.trim();
  const from = toIsoBound(fromDate.value, false);
  const to = toIsoBound(toDate.value, true);
  if (actionValue) query.action = actionValue;
  if (entityValue) query.entityType = entityValue;
  if (from) query.from = from;
  if (to) query.to = to;
  return query;
});

const auditQuery = useAuditLogsQuery(listQuery);
const items = computed(() => auditQuery.data.value?.items ?? []);
const total = computed(() => auditQuery.data.value?.pageInfo.total ?? 0);
const loadError = computed(() => auditQuery.error.value);

const selected = ref<AuditLog | null>(null);
const drawerOpen = ref(false);

function openDetail(_event: unknown, row: { item: AuditLog }): void {
  selected.value = row.item;
  drawerOpen.value = true;
}

const headers = [
  { title: 'Fecha', key: 'occurredAt', sortable: false },
  { title: 'Acción', key: 'action', sortable: false },
  { title: 'Entidad', key: 'entityType', sortable: false },
  { title: 'Resultado', key: 'outcome', sortable: false },
  { title: 'IP', key: 'ipAddress', sortable: false },
];
</script>

<template>
  <div>
    <PageHeader
      title="Auditoría"
      subtitle="Registro de solo lectura de acciones relevantes, del más reciente al más antiguo."
    />

    <v-row dense class="altium-filters mb-4">
      <v-col cols="12" sm="6" md="3">
        <v-text-field
          v-model="action"
          label="Acción exacta (p. ej. auth.login)"
          clearable
          maxlength="100"
          @click:clear="action = ''"
        />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-text-field
          v-model="entityType"
          label="Entidad (p. ej. user)"
          clearable
          maxlength="100"
          @click:clear="entityType = ''"
        />
      </v-col>
      <v-col cols="6" md="3">
        <v-text-field v-model="fromDate" label="Desde" type="date" />
      </v-col>
      <v-col cols="6" md="3">
        <v-text-field v-model="toDate" label="Hasta" type="date" />
      </v-col>
    </v-row>

    <ErrorState
      v-if="loadError"
      :message="apiErrorMessage(loadError)"
      :request-id="isApiError(loadError) ? loadError.requestId : null"
      :loading="auditQuery.isFetching.value"
      @retry="auditQuery.refetch()"
    />

    <v-card v-else>
      <v-data-table-server
        v-model:page="page"
        v-model:items-per-page="itemsPerPage"
        :headers="headers"
        :items="items"
        :items-length="total"
        :loading="auditQuery.isFetching.value"
        :items-per-page-options="[10, 25, 50, 100]"
        item-value="id"
        loading-text="Cargando eventos…"
        class="altium-clickable-rows"
        @click:row="openDetail"
      >
        <template #[`item.occurredAt`]="{ item }">{{ formatDateTime(item.occurredAt) }}</template>
        <template #[`item.action`]="{ item }">
          <code class="text-body-2">{{ item.action }}</code>
        </template>
        <template #[`item.outcome`]="{ item }">
          <StatusBadge :status="item.outcome" />
        </template>
        <template #[`item.ipAddress`]="{ item }">{{ item.ipAddress ?? '—' }}</template>
        <template #no-data>
          <EmptyState title="Sin eventos" text="Ajusta los filtros." icon="mdi-history" />
        </template>
      </v-data-table-server>
    </v-card>

    <AuditDetailDrawer v-model="drawerOpen" :log="selected" />
  </div>
</template>
