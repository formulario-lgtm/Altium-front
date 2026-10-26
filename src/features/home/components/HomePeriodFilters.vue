<script setup lang="ts">
import { computed } from 'vue';
import { useSupervisionTeamsQuery } from '@/features/supervision/composables/useSupervision';
import { MONTH_OPTIONS, yearOptions } from '@/features/supervision/utils/supervision-labels';

const year = defineModel<number>('year', { required: true });
const month = defineModel<number>('month', { required: true });
const teamId = defineModel<string | null>('teamId', { default: null });

const props = withDefaults(
  defineProps<{
    showTeam?: boolean;
    disabled?: boolean;
  }>(),
  { showTeam: false, disabled: false },
);

const teamsQuery = useSupervisionTeamsQuery();
const years = yearOptions();

const teamItems = computed(() => [
  { title: 'Todos los equipos', value: null as string | null },
  ...(teamsQuery.data.value?.items ?? []).map((team: { name: string; id: string }) => ({
    title: team.name,
    value: team.id as string | null,
  })),
]);

const showTeamFilter = computed(
  () => props.showTeam && (teamsQuery.data.value?.items?.length ?? 0) > 1,
);
</script>

<template>
  <v-row dense class="altium-filters mb-4" data-testid="home-period-filters">
    <v-col cols="6" sm="4" md="3">
      <v-select
        v-model="month"
        :items="[...MONTH_OPTIONS]"
        item-title="title"
        item-value="value"
        label="Mes"
        hide-details
        :disabled="disabled"
      />
    </v-col>
    <v-col cols="6" sm="4" md="3">
      <v-select v-model="year" :items="years" label="Año" hide-details :disabled="disabled" />
    </v-col>
    <v-col v-if="showTeamFilter" cols="12" sm="4" md="4">
      <v-select
        v-model="teamId"
        :items="teamItems"
        item-title="title"
        item-value="value"
        label="Equipo"
        clearable
        hide-details
        :disabled="disabled"
        :loading="teamsQuery.isFetching.value"
      />
    </v-col>
  </v-row>
</template>
