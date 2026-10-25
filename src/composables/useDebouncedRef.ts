import { onScopeDispose, ref, watch, type Ref } from 'vue';

/** Mirrors `source` after `delayMs` without changes (search inputs). */
export function useDebouncedRef<T>(source: Ref<T>, delayMs = 300): Ref<T> {
  const debounced = ref(source.value) as Ref<T>;
  let timer: ReturnType<typeof setTimeout> | undefined;

  watch(source, (value) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      debounced.value = value;
    }, delayMs);
  });

  onScopeDispose(() => clearTimeout(timer));
  return debounced;
}
