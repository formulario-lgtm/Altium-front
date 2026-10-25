import { computed, ref, watch, type Ref } from 'vue';
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
import { canEditSaleStatus } from '../utils/sale-labels';
import { useSaleQuery, useUpdateSaleMutation } from './useSales';

export type SaveStatus = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';

function createDebounced(fn: () => void, ms: number): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(fn, ms);
  };
}

export function useSaleForm(saleId: Ref<string>) {
  const saleQuery = useSaleQuery(saleId);
  const updateMutation = useUpdateSaleMutation();

  const model = ref<SaleFormModel | null>(null);
  const saveStatus = ref<SaveStatus>('idle');
  const saveError = ref<string | null>(null);
  const fieldErrors = ref<Record<string, string>>({});
  const versionConflict = ref(false);
  const hydrated = ref(false);
  const suppressAutosave = ref(false);
  /** Serialize PATCH calls so concurrent autosaves cannot race on the same version. */
  let saveChain: Promise<Sale | null> = Promise.resolve(null);
  let dirtyAfterSave = false;

  const sale = computed(() => saleQuery.data.value);
  const editable = computed(() => canEditSaleStatus(sale.value?.status));

  watch(
    () => saleQuery.data.value,
    (next) => {
      if (!next) return;
      suppressAutosave.value = true;
      model.value = saleToFormModel(next);
      hydrated.value = true;
      versionConflict.value = false;
      queueMicrotask(() => {
        suppressAutosave.value = false;
        if (saveStatus.value !== 'error') saveStatus.value = 'saved';
      });
    },
    { immediate: true },
  );

  async function runPersist(): Promise<Sale | null> {
    if (!model.value || !editable.value || versionConflict.value) return null;

    saveStatus.value = 'saving';
    saveError.value = null;
    fieldErrors.value = {};
    dirtyAfterSave = false;

    const body: UpdateSaleBody = formModelToUpdateBody(model.value);
    try {
      const updated = await updateMutation.mutateAsync({ id: saleId.value, body });
      suppressAutosave.value = true;
      model.value = saleToFormModel(updated);
      saveStatus.value = dirtyAfterSave ? 'dirty' : 'saved';
      queueMicrotask(() => {
        suppressAutosave.value = false;
      });
      if (dirtyAfterSave) {
        dirtyAfterSave = false;
        scheduleSave();
      }
      return updated;
    } catch (error: unknown) {
      if (isApiError(error) && (error.code === 'VERSION_CONFLICT' || error.kind === 'conflict')) {
        versionConflict.value = true;
        saveStatus.value = 'error';
        saveError.value = apiErrorMessage(error);
        return null;
      }
      if (isApiError(error) && error.kind === 'validation') {
        fieldErrors.value = fieldErrorsToMap(error);
      }
      saveStatus.value = 'error';
      saveError.value = apiErrorMessage(error);
      return null;
    }
  }

  function persist(): Promise<Sale | null> {
    const next = saveChain.then(runPersist, runPersist);
    saveChain = next.then(
      () => null,
      () => null,
    );
    return next;
  }

  const scheduleSave = createDebounced(() => {
    void persist();
  }, 800);

  watch(
    model,
    () => {
      if (!hydrated.value || suppressAutosave.value || !editable.value) return;
      if (versionConflict.value) return;
      if (saveStatus.value === 'saving') {
        dirtyAfterSave = true;
        return;
      }
      saveStatus.value = 'dirty';
      scheduleSave();
    },
    { deep: true },
  );

  async function reloadFromServer(): Promise<void> {
    versionConflict.value = false;
    await saleQuery.refetch();
    saveStatus.value = 'saved';
    saveError.value = null;
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
    persist,
    reloadFromServer,
  };
}
