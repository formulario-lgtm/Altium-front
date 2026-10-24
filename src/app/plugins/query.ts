import { VueQueryPlugin, type VueQueryPluginOptions } from '@tanstack/vue-query';
import type { App } from 'vue';

const queryOptions: VueQueryPluginOptions = {
  queryClientConfig: {
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  },
};

export function registerQuery(app: App): void {
  app.use(VueQueryPlugin, queryOptions);
}
