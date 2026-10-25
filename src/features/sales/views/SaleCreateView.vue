<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import ErrorState from '@/components/common/ErrorState.vue';
import PageHeader from '@/components/common/PageHeader.vue';
import { apiErrorMessage, isApiError } from '@/services/http';
import { useCreateSaleMutation, useHealthInsurersQuery } from '../composables/useSales';

const router = useRouter();
const insurersQuery = useHealthInsurersQuery();
const createMutation = useCreateSaleMutation();
const errorMessage = ref<string | null>(null);

async function createDraft(): Promise<void> {
  errorMessage.value = null;
  try {
    await insurersQuery.refetch();
    const defaultInsurer = insurersQuery.data.value?.items[0];
    const sale = await createMutation.mutateAsync(
      defaultInsurer ? { healthInsurerId: defaultInsurer.id } : {},
    );
    await router.replace({ name: 'sale-edit', params: { id: sale.id } });
  } catch (error: unknown) {
    errorMessage.value = apiErrorMessage(error);
  }
}

onMounted(() => {
  void createDraft();
});
</script>

<template>
  <div>
    <PageHeader title="Nueva venta" subtitle="Creando borrador…" />
    <v-progress-linear v-if="!errorMessage" indeterminate color="primary" class="mb-4" />
    <ErrorState
      v-if="errorMessage"
      :message="errorMessage"
      :request-id="
        createMutation.error.value && isApiError(createMutation.error.value)
          ? createMutation.error.value.requestId
          : null
      "
      :loading="createMutation.isPending.value"
      @retry="createDraft"
    />
  </div>
</template>
