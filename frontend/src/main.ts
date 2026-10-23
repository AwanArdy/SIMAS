import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import './style.css'
import App from './App.vue'
import { useAuthStore } from './stores/auth'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

const authStore = useAuthStore()
authStore.hydrateFromStorage()

if (authStore.token) {
  authStore.fetchMe().finally(() => {
    app.mount('#app')
  })
} else {
  app.mount('#app')
}
