import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import HomeView from './views/HomeView.vue'
import MenuView from './views/MenuView.vue'
import GameView from './views/GameView.vue'

const routes = [
  { path: '/', component: HomeView },
  { path: '/menu', component: MenuView },
  { path: '/:roomName/:playerName', component: GameView },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
