<template>
  <div class="min-h-screen bg-app transition-colors duration-300">

    <Transition name="chrome-fade">
      <header v-if="auth.user" class="bg-surface border-b border-app sticky top-0 z-40 transition-colors duration-300">
        <div class="max-w-2xl mx-auto px-4 h-12 flex items-center justify-between">
          <RouterLink to="/" class="font-semibold text-brand text-base tracking-tight" style="font-family: var(--font-heading)">
            22 Razones
          </RouterLink>
          <div class="flex items-center gap-1">
            <button
              @click="toggle()"
              class="text-muted hover:text-main cursor-pointer transition-colors duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
              :aria-label="isDark ? 'Modo claro' : 'Modo oscuro'"
            >
              <Sun v-if="isDark" :size="18" />
              <Moon v-else :size="18" />
            </button>
            <button
              @click="handleLogout"
              class="text-muted hover:text-main cursor-pointer transition-colors duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Cerrar sesión"
            >
              <LogOut :size="18" />
            </button>
          </div>
        </div>
      </header>
    </Transition>

    <main class="max-w-2xl mx-auto px-4 py-5" :class="auth.user ? 'pb-28' : ''">
      <RouterView v-slot="{ Component, route: r }">
        <Transition :name="r.meta.transitionName || 'fade'" mode="out-in">
          <component :is="Component" :key="r.path" />
        </Transition>
      </RouterView>
    </main>

    <Transition name="nav-fade">
      <BottomNav v-if="auth.user" />
    </Transition>

    <Toast />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'
import { useTheme } from './composables/useTheme'
import BottomNav from './components/BottomNav.vue'
import Toast from './components/Toast.vue'
import { LogOut, Sun, Moon } from 'lucide-vue-next'

const auth = useAuthStore()
const router = useRouter()
const { isDark, toggle } = useTheme()

async function handleLogout() {
  await auth.logout()
  router.push('/login')
}

onMounted(async () => {
  try {
    const day = new Date().getDate()
    if ([20, 21, 22].includes(day) && Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        if (day === 22) {
          new Notification('22 Razones', { body: '¡Hoy es el 22! No olviden registrar la salida.' })
        } else {
          new Notification('22 Razones', { body: `Faltan ${22 - day} días. ¿Ya eligieron a dónde van?` })
        }
      }
    }
  } catch {}
})
</script>
