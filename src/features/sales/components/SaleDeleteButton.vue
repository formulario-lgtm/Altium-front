<script setup lang="ts">
import { computed, ref } from 'vue';
import ConfirmDialog from '@/components/common/ConfirmDialog.vue';
import { useAuthStore } from '@/stores/auth.store';
import { apiErrorMessage, type SaleListItem } from '@/services/http';
import { formatSaleNumber } from '@/utils/format';
import { useDeleteSaleMutation } from '../composables/useSales';

const props = defineProps<{
  sale: Pick<SaleListItem, 'id' | 'saleNumber' | 'seller' | 'status' | 'submittedAt'>;
  compact?: boolean;
}>();
const emit = defineEmits<{ deleted: [] }>();
const auth = useAuthStore();
const mutation = useDeleteSaleMutation();
const open = ref(false);
const error = ref<string | null>(null);
const allowed = computed(
  () =>
    auth.roleCode === 'SELLER' &&
    auth.hasPermission('sales.update') &&
    props.sale.seller.id === auth.user?.id &&
    props.sale.status === 'DRAFT' &&
    !props.sale.submittedAt,
);
function askDelete(): void {
  error.value = null;
  open.value = true;
}
async function confirmDelete(): Promise<void> {
  if (!allowed.value || mutation.isPending.value) return;
  error.value = null;
  try {
    await mutation.mutateAsync(props.sale.id);
    open.value = false;
    emit('deleted');
  } catch (cause: unknown) {
    error.value = apiErrorMessage(cause);
  }
}
</script>

<template>
  <template v-if="allowed">
    <v-btn
      color="error"
      :variant="compact ? 'text' : 'tonal'"
      :size="compact ? 'small' : 'default'"
      prepend-icon="mdi-trash-can-outline"
      :aria-label="`Borrar venta ${formatSaleNumber(sale.saleNumber)}`"
      :disabled="mutation.isPending.value"
      @click.stop="askDelete"
      >Borrar</v-btn
    >
    <ConfirmDialog
      v-model="open"
      title="Borrar borrador"
      :message="`¿Querés borrar la venta ${formatSaleNumber(sale.saleNumber)}? Dejará de estar disponible y no podrás seguir editándola.`"
      confirm-text="Borrar venta"
      cancel-text="Cancelar"
      color="error"
      :loading="mutation.isPending.value"
      :error-message="error"
      @confirm="confirmDelete"
    />
  </template>
</template>
