import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import DocumentView from '../views/DocumentView.vue'
import LoginView from '../views/LoginView.vue'
import KPIView from '../views/KPIView.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: '/dashboard'
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { guest: true }
    },
    {
      path: '/document/:id',
      name: 'document',
      component: DocumentView,
      props: true,
      meta: { requiresAuth: true }
    },
    {
      path: '/bilanz/:id',
      name: 'bilanz-view',
      component: DocumentView,
      props: true,
      meta: { requiresAuth: true }
    },
    {
      path: '/bilanz/:id/edit',
      name: 'bilanz-edit',
      component: DocumentView,
      props: route => ({ 
        id: route.params.id,
        editMode: true 
      }),
      meta: { requiresAuth: true }
    },
    {
      path: '/upload',
      name: 'upload',
      component: () => import('../views/UploadView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/bilanz/:id/kpi',
      name: 'bilanz-kpi',
      component: KPIView,
      props: true,
      meta: { requiresAuth: true }
    },
    {
      path: '/bilanz/:id/completion',
      name: 'bilanz-completion',
      component: () => import('../views/CompletionView.vue'),
      props: true,
      meta: { requiresAuth: true }
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/dashboard'
    }
  ]
})

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated

  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      next({ name: 'login' })
    } else {
      next()
    }
  } 
  else if (to.matched.some(record => record.meta.guest) && isAuthenticated) {
    next({ name: 'dashboard' })
  } else {
    next()
  }
})

export default router

