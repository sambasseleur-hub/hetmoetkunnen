import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import RoosterView from '../views/RoosterView.vue'
import KampioenenView from '../views/KampioenenView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'rooster', component: RoosterView },
    { path: '/kampioenen', name: 'kampioenen', component: KampioenenView },
    { path: '/beheer', name: 'beheer', component: DashboardView }
  ]
})

export default router
