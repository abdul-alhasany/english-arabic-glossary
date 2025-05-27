import './assets/main.css';

// Ensure sql.js is bundled
import 'sql.js/dist/sql-wasm.js';

import { createApp } from 'vue';
import App from './App.vue';

createApp(App).mount('#app');
