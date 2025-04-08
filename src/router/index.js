import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import GlobeView from '../views/GlobeView.vue'
import TripView from '../views/TripView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/globe',
      name: 'globe',
      component: GlobeView, //Import globe view
    },
    {
      path: '/trip/:id',
      name: 'Trip',
      component: TripView,
      props: true,
    }
  ],
})

export default router
