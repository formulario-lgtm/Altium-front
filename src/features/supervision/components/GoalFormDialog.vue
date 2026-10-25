<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import ConfirmDialog from '@/components/common/ConfirmDialog.vue';
import type {
  CreateMonthlyGoalBody,
  MonthlyGoal,
  MonthlyGoalTargetType,
  MonthlyGoalType,
  MonthlyGoalUnit,
} from '@/services/http';
import { apiErrorMessage, isApiError } from '@/services/http';
import {
  useCreateSupervisionGoalMutation,
  usePatchSupervisionGoalMutation,
  useSupervisionTeamsQuery,
} from '../composables/useSupervision';
import {
  GOAL_TYPE_OPTIONS,
  isClosedPeriod,
  MONTH_OPTIONS,
  yearOptions,
} from '../utils/supervision-labels';

const props = defineProps<{
  goal?: MonthlyGoal | null;
  defaultYear: number;
  defaultMonth: number;
}>();

const open = defineModel<boolean>({ default: false });
const emit = defineEmits<{ saved: [] }>();

const createMutation = useCreateSupervisionGoalMutation();
const patchMutation = usePatchSupervisionGoalMutation();
const teamsQuery = useSupervisionTeamsQuery();

const isEdit = computed(() => Boolean(props.goal));
const goalType = ref<MonthlyGoalType>('SALES_SUBMITTED');
const targetType = ref<MonthlyGoalTargetType>('TEAM');
const teamId = ref<string | null>(null);
const userId = ref('');
const year = ref(props.defaultYear);
const month = ref(props.defaultMonth);
const targetValue = ref<number>(0);
const unit = ref<MonthlyGoalUnit>('COUNT');
const reason = ref('');
const formError = ref<string | null>(null);
const confirmClosedOpen = ref(false);

const needsReason = computed(
  () =>
    isEdit.value &&
    isClosedPeriod(props.goal?.year ?? year.value, props.goal?.month ?? month.value),
);

const goalTypeMeta = computed(() => GOAL_TYPE_OPTIONS.find((g) => g.value === goalType.value));

watch(open, (isOpen) => {
  formError.value = null;
  if (!isOpen) return;
  if (props.goal) {
    goalType.value = props.goal.goalType;
    targetType.value = props.goal.targetType;
    teamId.value = props.goal.teamId;
    userId.value = props.goal.userId ?? '';
    year.value = props.goal.year;
    month.value = props.goal.month;
    targetValue.value = props.goal.targetValue;
    unit.value = props.goal.unit;
    reason.value = '';
  } else {
    goalType.value = 'SALES_SUBMITTED';
    targetType.value = 'TEAM';
    teamId.value = null;
    userId.value = '';
    year.value = props.defaultYear;
    month.value = props.defaultMonth;
    targetValue.value = 0;
    unit.value = 'COUNT';
    reason.value = '';
  }
});

watch(goalType, (type) => {
  const meta = GOAL_TYPE_OPTIONS.find((g) => g.value === type);
  if (meta) unit.value = meta.unit;
  if (type !== 'SALES_SUBMITTED') targetType.value = 'USER';
});

function requestSubmit(): void {
  formError.value = null;
  if (targetValue.value < 0 || Number.isNaN(targetValue.value)) {
    formError.value = 'El objetivo debe ser un número mayor o igual a cero.';
    return;
  }
  if (needsReason.value && reason.value.trim().length < 3) {
    formError.value = 'Los períodos cerrados requieren un motivo (mín. 3 caracteres).';
    return;
  }
  if (needsReason.value) {
    confirmClosedOpen.value = true;
    return;
  }
  void submit();
}

async function submit(): Promise<void> {
  formError.value = null;
  confirmClosedOpen.value = false;
  try {
    if (isEdit.value && props.goal) {
      await patchMutation.mutateAsync({
        id: props.goal.id,
        body: {
          targetValue: targetValue.value,
          ...(reason.value.trim() ? { reason: reason.value.trim() } : {}),
        },
      });
    } else {
      if (targetType.value === 'TEAM' && !teamId.value) {
        formError.value = 'Seleccioná un equipo.';
        return;
      }
      if (targetType.value === 'USER' && !userId.value.trim()) {
        formError.value = 'Indicá el UUID del usuario.';
        return;
      }
      const body: CreateMonthlyGoalBody = {
        goalType: goalType.value,
        targetType: targetType.value,
        year: year.value,
        month: month.value,
        targetValue: targetValue.value,
        unit: unit.value,
        ...(targetType.value === 'TEAM'
          ? { teamId: teamId.value }
          : { userId: userId.value.trim() }),
        ...(reason.value.trim() ? { reason: reason.value.trim() } : {}),
      };
      await createMutation.mutateAsync(body);
    }
    open.value = false;
    emit('saved');
  } catch (error: unknown) {
    formError.value = apiErrorMessage(error);
    if (isApiError(error) && error.requestId) {
      formError.value = `${formError.value} (ref: ${error.requestId})`;
    }
  }
}
</script>

<template>
  <v-dialog
    v-model="open"
    max-width="560"
    :persistent="createMutation.isPending.value || patchMutation.isPending.value"
  >
    <v-card :title="isEdit ? 'Editar objetivo' : 'Nuevo objetivo'">
      <v-card-text>
        <v-alert v-if="formError" type="error" density="compact" class="mb-4" variant="tonal">
          {{ formError }}
        </v-alert>
        <v-alert v-if="needsReason" type="warning" density="compact" class="mb-4" variant="tonal">
          Estás modificando un mes cerrado: el motivo es obligatorio.
        </v-alert>

        <v-select
          v-model="goalType"
          :items="[...GOAL_TYPE_OPTIONS]"
          item-title="title"
          item-value="value"
          label="Métrica"
          :disabled="isEdit"
          :hint="goalTypeMeta?.hint"
          persistent-hint
          class="mb-3"
        />
        <v-select
          v-model="targetType"
          :items="[
            { title: 'Equipo', value: 'TEAM' },
            { title: 'Usuario', value: 'USER' },
          ]"
          label="Sujeto"
          :disabled="isEdit || goalType !== 'SALES_SUBMITTED'"
          class="mb-3"
        />
        <v-select
          v-if="targetType === 'TEAM'"
          v-model="teamId"
          :items="
            (teamsQuery.data.value?.items ?? []).map((t: { name: string; id: string }) => ({
              title: t.name,
              value: t.id,
            }))
          "
          label="Equipo"
          :disabled="isEdit"
          :loading="teamsQuery.isFetching.value"
          class="mb-3"
        />
        <v-text-field
          v-else
          v-model="userId"
          label="Usuario (UUID)"
          :disabled="isEdit"
          class="mb-3"
          hint="Vendedor (SALES_SUBMITTED) o administrativo (métricas de revisión)."
          persistent-hint
        />
        <v-row dense>
          <v-col cols="6">
            <v-select
              v-model="month"
              :items="[...MONTH_OPTIONS]"
              item-title="title"
              item-value="value"
              label="Mes"
              :disabled="isEdit"
            />
          </v-col>
          <v-col cols="6">
            <v-select v-model="year" :items="yearOptions()" label="Año" :disabled="isEdit" />
          </v-col>
        </v-row>
        <v-text-field
          v-model.number="targetValue"
          type="number"
          label="Valor objetivo"
          min="0"
          step="0.01"
          class="mt-2"
        />
        <v-textarea
          v-model="reason"
          label="Motivo"
          :required="needsReason"
          rows="2"
          class="mt-2"
          :hint="needsReason ? 'Obligatorio para períodos cerrados' : 'Opcional'"
          persistent-hint
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="open = false">Cancelar</v-btn>
        <v-btn
          color="primary"
          :loading="createMutation.isPending.value || patchMutation.isPending.value"
          @click="requestSubmit"
        >
          Guardar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <ConfirmDialog
    v-model="confirmClosedOpen"
    title="Confirmar cambio retroactivo"
    message="Estás modificando un objetivo de un mes cerrado. El motivo quedará en el historial."
    confirm-text="Confirmar cambio"
    color="warning"
    :loading="patchMutation.isPending.value"
    @confirm="submit"
  />
</template>
