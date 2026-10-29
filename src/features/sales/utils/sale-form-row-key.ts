import { toRaw } from 'vue';

/** Keep focus-bearing rows stable when a first save assigns their persistent ids. */
export function createSaleFormRowKey(): (row: object) => string {
  const keys = new WeakMap<object, string>();
  let sequence = 0;
  return (row) => {
    const value = toRaw(row);
    let key = keys.get(value);
    if (!key) {
      key = `sale-row-${++sequence}`;
      keys.set(value, key);
    }
    return key;
  };
}
