import './assets/main.css';

import { createApp } from 'vue';
import App from './App.vue';

import { globalState } from './globalState.js';

const app = createApp(App);

app.config.globalProperties.$globalState = globalState;

app.mount('#app');
