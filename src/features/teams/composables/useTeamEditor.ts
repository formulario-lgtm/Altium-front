import { computed, ref } from 'vue';
import { apiErrorMessage, type Team } from '@/services/http';
import { useAuthStore } from '@/stores/auth.store';
import type { TeamFormValues } from '../schemas/team.schema';
import { toCreateTeamBody, toUpdateTeamBody } from '../utils/team-payload';
import { useActiveUsersByRole, useCreateTeamMutation, useUpdateTeamMutation } from './useTeams';

/** Open/submit state for `TeamFormDialog` (create or edit). */
export function useTeamEditor(onSaved?: (team: Team) => void) {
  const auth = useAuthStore();
  const open = ref(false);
  const editing = ref<Team | null>(null);
  const createMutation = useCreateTeamMutation();
  const updateMutation = useUpdateTeamMutation();

  const supervisorPicker = useActiveUsersByRole(
    ['SUPERVISOR'],
    () => open.value && auth.hasPermission('users.read'),
  );

  const mutation = computed(() => (editing.value ? updateMutation : createMutation));
  const errorMessage = computed(() =>
    mutation.value.error.value ? apiErrorMessage(mutation.value.error.value) : null,
  );
  const loading = computed(() => mutation.value.isPending.value);

  function openCreate(): void {
    editing.value = null;
    createMutation.reset();
    open.value = true;
  }

  function openEdit(team: Team): void {
    editing.value = team;
    updateMutation.reset();
    open.value = true;
  }

  async function submit(values: TeamFormValues): Promise<void> {
    try {
      let saved: Team;
      if (editing.value) {
        const body = toUpdateTeamBody(editing.value, values);
        saved =
          Object.keys(body).length > 0
            ? await updateMutation.mutateAsync({ id: editing.value.id, body })
            : editing.value;
      } else {
        saved = await createMutation.mutateAsync(toCreateTeamBody(values));
      }
      open.value = false;
      onSaved?.(saved);
    } catch {
      // Rendered in the dialog.
    }
  }

  return {
    open,
    editing,
    errorMessage,
    loading,
    supervisors: supervisorPicker.users,
    supervisorsLoading: computed(() => supervisorPicker.query.isFetching.value),
    openCreate,
    openEdit,
    submit,
  };
}
