import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import PublicLayout from '../layouts/PublicLayout.vue'
import DashboardLayout from '../layouts/DashboardLayout.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: PublicLayout,
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('../pages/public/Home.vue'),
        },
        {
          path: 'login',
          name: 'login',
          component: () => import('../pages/public/Login.vue'),
          meta: { guestOnly: true },
        },
      ],
    },
    {
      path: '/dashboard',
      component: DashboardLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('../pages/dashboard/Index.vue'),
        },
        {
          path: 'kegiatan',
          name: 'dashboard-kegiatan',
          component: () => import('../pages/dashboard/Kegiatan.vue'),
        },
        {
          path: 'kas',
          name: 'dashboard-kas',
          component: () => import('../pages/dashboard/Kas.vue'),
        },
        {
          path: 'inventaris',
          name: 'dashboard-inventaris',
          component: () => import('../pages/dashboard/Inventaris.vue'),
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { name: 'dashboard' }
  }
})

export default router
