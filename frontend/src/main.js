import { createApp } from 'vue'
import { createVuetify } from 'vuetify'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import axios from 'axios'
import App from './App.vue'
import router from './router'
import { initAuth, clearToken } from './utils/auth'

initAuth()

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearToken()
      if (router.currentRoute.value.name === 'beheer') {
        router.push({ name: 'login' })
      }
    }
    return Promise.reject(error)
  }
)

const vuetify = createVuetify({
  theme: {
    defaultTheme: 'light'
  }
})

createApp(App).use(vuetify).use(router).mount('#app')
