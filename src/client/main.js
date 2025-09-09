import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'

const routes = [
  // Route pour la page d'accueil, sans paramètres
  { path: '/', component: App },
  // Route pour rejoindre une partie, avec les paramètres requis
  { path: '/:roomName/:playerName', component: App },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
