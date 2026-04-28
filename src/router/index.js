import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  { path: '/login', component: () => import('../views/LoginView.vue'), meta: { public: true } },
  { path: '/', component: () => import('../views/TimelineView.vue') },
  { path: '/lugares', component: () => import('../views/PlacesView.vue') },
  { path: '/lugares/nuevo', component: () => import('../views/PlaceFormView.vue') },
  { path: '/lugares/:id', component: () => import('../views/PlaceDetailView.vue') },
  { path: '/lugares/:id/editar', component: () => import('../views/PlaceEditView.vue') },
  { path: '/visitas/nueva', component: () => import('../views/NewVisitView.vue') },
  { path: '/visitas/:id', component: () => import('../views/VisitDetailView.vue') },
  { path: '/visitas/:id/editar', component: () => import('../views/EditVisitView.vue') },
  { path: '/mapa', component: () => import('../views/MapView.vue') },
  { path: '/ranking', component: () => import('../views/RankingView.vue') },
  { path: '/estadisticas', component: () => import('../views/StatsView.vue') },
  { path: '/anual', component: () => import('../views/YearInReviewView.vue') },
  { path: '/sugerencias', component: () => import('../views/SuggestionsView.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

function depth(path) {
  return path.split('/').filter(Boolean).length
}

router.beforeEach(async (to, from) => {
  const auth = useAuthStore()
  await auth.init()
  if (!to.meta.public && !auth.user) return '/login'

  if (to.path === '/login' || from.path === '/login') {
    to.meta.transitionName = 'auth-fade'
    return
  }

  const d1 = depth(to.path)
  const d2 = depth(from.path)
  if (d1 > d2) to.meta.transitionName = 'slide-forward'
  else if (d1 < d2) to.meta.transitionName = 'slide-back'
  else to.meta.transitionName = 'fade'
})

export default router
