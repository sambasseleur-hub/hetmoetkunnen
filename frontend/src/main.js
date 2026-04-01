import { createApp } from 'vue'
import { createVuetify } from 'vuetify'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import App from './App.vue'

const vuetify = createVuetify({
  theme: {
    defaultTheme: 'light'
  }
})

createApp(App).use(vuetify).mount('#app')
