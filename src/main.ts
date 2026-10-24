import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { registerQuery } from './app/plugins/query';
import { createVuetifyPlugin } from './app/plugins/vuetify';
import { router } from './app/router';
import './styles/main.scss';

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(createVuetifyPlugin());
registerQuery(app);

app.mount('#app');
