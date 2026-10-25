import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { registerQuery } from './app/plugins/query';
import { appQueryClient } from './app/plugins/query-client';
import { createVuetifyPlugin } from './app/plugins/vuetify';
import { router } from './app/router';
import { installAuthGuards } from './app/router/guards';
import { installSessionHandlers } from './app/session';
import './styles/main.scss';

const app = createApp(App);

app.use(createPinia());
installAuthGuards(router);
installSessionHandlers(router, appQueryClient);
app.use(router);
app.use(createVuetifyPlugin());
registerQuery(app);

app.mount('#app');
