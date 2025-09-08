import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

// Import styles, router, etc. here if needed in the future

const app = createApp(App)

app.use(createPinia())
// app.use(router) // To be added when routes are created

app.mount('#app')
