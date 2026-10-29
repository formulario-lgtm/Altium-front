import { computed, onScopeDispose, ref, watch, type Ref } from 'vue';
import {
  apiErrorMessage,
  fieldErrorsToMap,
  isApiError,
  type Sale,
  type UpdateSaleBody,
} from '@/services/http';
import {
  formModelToUpdateBody,
  saleToFormModel,
  type SaleFormModel,
} from '../utils/sale-form-model';
import { validateSaleDraft } from '../utils/sale-draft-validation';
import { getSessionVersion } from '@/services/http/session-version';
import { canEditSaleStatus } from '../utils/sale-labels';
import { useSaleQuery, useUpdateSaleMutation } from './useSales';

export type SaveStatus = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';

function fingerprint(model: SaleFormModel): string {
  return JSON.stringify({ ...formModelToUpdateBody(model), version: 0 });
}

export function useSaleForm(saleId: Ref<string>) {
  const saleQuery = useSaleQuery(saleId);
  const updateMutation = useUpdateSaleMutation();
  const model = ref<SaleFormModel | null>(null);
  const saveStatus = ref<SaveStatus>('idle');
  const saveError = ref<string | null>(null);
  const fieldErrors = ref<Record<string, string>>({});
  const versionConflict = ref(false);
  const sale = computed(() => saleQuery.data.value);
  const editable = computed(() => canEditSaleStatus(sale.value?.status));
  const revision = ref(0);
  const savedRevision = ref(0);
  const hasUnsavedChanges = computed(
    () => Boolean(model.value) && revision.value !== savedRevision.value,
  );
  let baseline = '';
  let applyingServer = false;
  let disposed = false;
  let saveChain: Promise<Sale | null> = Promise.resolve(null);
  onScopeDispose(() => {
    disposed = true;
  });

  function hydrate(next: Sale): void {
    applyingServer = true;
    model.value = saleToFormModel(next);
    baseline = fingerprint(model.value);
    revision.value = 0;
    savedRevision.value = 0;
    versionConflict.value = false;
    saveError.value = null;
    fieldErrors.value = {};
    saveStatus.value = 'saved';
    applyingServer = false;
  }

  watch(
    saleId,
    () => {
      applyingServer = true;
      model.value = null;
      baseline = '';
      revision.value = 0;
      savedRevision.value = 0;
      versionConflict.value = false;
      saveStatus.value = 'idle';
      applyingServer = false;
    },
    { flush: 'sync' },
  );

  watch(
    () => saleQuery.data.value,
    (next) => {
      if (!next || next.id !== saleId.value || disposed) return;
      if (
        model.value &&
        (hasUnsavedChanges.value || saveStatus.value === 'saving' || versionConflict.value)
      )
        return;
      if (model.value?.version === next.version) return;
      hydrate(next);
    },
    { immediate: true },
  );

  // Track edits synchronously; typing never starts a network request or a timer.
  watch(
    model,
    () => {
      if (!model.value || applyingServer || !editable.value || disposed) return;
      revision.value++;
      if (saveStatus.value !== 'saving' && !versionConflict.value) saveStatus.value = 'dirty';
    },
    { deep: true, flush: 'sync' },
  );

  async function runPersist(id: string, force: boolean): Promise<Sale | null> {
    if (!model.value || !editable.value || versionConflict.value || disposed || id !== saleId.value)
      return null;
    const validationErrors = validateSaleDraft(model.value);
    if (Object.keys(validationErrors).length) {
      fieldErrors.value = validationErrors;
      saveStatus.value = 'error';
      saveError.value = 'Corregí los datos indicados antes de guardar o avanzar.';
      return null;
    }
    fieldErrors.value = {};
    saveError.value = null;
    if (!force && saveStatus.value !== 'error' && fingerprint(model.value) === baseline) {
      savedRevision.value = revision.value;
      saveStatus.value = 'saved';
      return sale.value ?? null;
    }
    saveStatus.value = 'saving';
    const sentRevision = revision.value;
    const session = getSessionVersion();
    // Form values are JSON-only DTO data; detach the snapshot from subsequent keystrokes.
    const snapshot = JSON.parse(JSON.stringify(model.value)) as SaleFormModel;
    const memberRefs = [...model.value.members];
    const employerRefs = [...model.value.employment.employers];
    const body: UpdateSaleBody = formModelToUpdateBody(snapshot);
    try {
      const updated = await updateMutation.mutateAsync({ id, body });
      if (disposed || id !== saleId.value || !model.value || session !== getSessionVersion())
        return null;
      applyingServer = true;
      model.value.version = updated.version;
      // Merge server identities without replacing fields, moving focus or losing in-flight edits.
      snapshot.members.forEach((member, index) => {
        const stored = updated.members.find((row) =>
          member.id ? row.id === member.id : row.displayOrder === index,
        );
        if (!stored) return;
        member.id = stored.id;
        const local = memberRefs[index];
        if (local && model.value!.members.includes(local)) local.id = stored.id;
      });
      snapshot.employment.employers.forEach((employer, index) => {
        const stored = updated.employment?.employers.find((row) =>
          employer.id ? row.id === employer.id : row.displayOrder === index,
        );
        if (!stored) return;
        employer.id = stored.id;
        const local = employerRefs[index];
        if (local && model.value!.employment.employers.includes(local)) local.id = stored.id;
      });
      baseline = fingerprint(snapshot);
      savedRevision.value = sentRevision;
      saveStatus.value = hasUnsavedChanges.value ? 'dirty' : 'saved';
      applyingServer = false;
      return updated;
    } catch (error: unknown) {
      if (disposed || id !== saleId.value || session !== getSessionVersion()) return null;
      applyingServer = false;
      if (isApiError(error) && (error.code === 'VERSION_CONFLICT' || error.kind === 'conflict'))
        versionConflict.value = true;
      if (isApiError(error) && error.kind === 'validation')
        fieldErrors.value = fieldErrorsToMap(error);
      saveStatus.value = 'error';
      saveError.value = apiErrorMessage(error);
      return null;
    }
  }

  /** Explicit saves are serialized; unchanged section changes do not issue another PATCH. */
  function persist(options: { force?: boolean } = {}): Promise<Sale | null> {
    const id = saleId.value;
    const next = saveChain.then(() => runPersist(id, options.force ?? false));
    saveChain = next.then(
      () => null,
      () => null,
    );
    return next;
  }

  async function reloadFromServer(): Promise<void> {
    await saveChain;
    const result = await saleQuery.refetch();
    if (result.error) {
      saveError.value = apiErrorMessage(result.error);
      return;
    }
    if (result.data && result.data.id === saleId.value) hydrate(result.data);
  }

  return {
    saleQuery,
    sale,
    model,
    editable,
    saveStatus,
    saveError,
    fieldErrors,
    versionConflict,
    hasUnsavedChanges,
    persist,
    reloadFromServer,
    waitForPendingSave: () => saveChain,
  };
}
