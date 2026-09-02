import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import DashboardView from '../views/DashboardView.vue'
import RoosterView from '../views/RoosterView.vue'
import KampioenenView from '../views/KampioenenView.vue'
import WieZijnWijView from '../views/WieZijnWijView.vue'
import NieuwsView from '../views/NieuwsView.vue'
import FotosView from '../views/FotosView.vue'
import SpelersView from '../views/SpelersView.vue'
import SpelerDetailView from '../views/SpelerDetailView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/rooster', name: 'rooster', component: RoosterView },
    { path: '/kampioenen', name: 'kampioenen', component: KampioenenView },
    { path: '/spelers', name: 'spelers', component: SpelersView },
    { path: '/spelers/:id', name: 'speler-detail', component: SpelerDetailView },
    { path: '/wie-zijn-wij', name: 'wie-zijn-wij', component: WieZijnWijView },
    { path: '/nieuws', name: 'nieuws', component: NieuwsView },
    { path: '/fotos', name: 'fotos', component: FotosView },
    { path: '/beheer', name: 'beheer', component: DashboardView }
  ]
})

export default router
