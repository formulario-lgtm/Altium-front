import { VueQueryPlugin } from '@tanstack/vue-query';
import type { App } from 'vue';
import { vueQueryPluginOptions } from './query-client';

export function registerQuery(app: App): void {
  app.use(VueQueryPlugin, vueQueryPluginOptions);
}
