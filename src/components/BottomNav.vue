<template>
  <div>
    <nav class="fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-app safe-area-bottom transition-colors duration-300">
      <div class="flex items-center justify-around h-16 max-w-2xl mx-auto">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex flex-col items-center justify-center gap-0.5 flex-1 min-h-[44px] cursor-pointer transition-colors duration-200"
          :class="isActive(item.to) ? 'text-brand' : 'text-muted hover:text-soft'"
          :aria-label="item.label"
        >
          <component :is="item.icon" :size="21" :stroke-width="isActive(item.to) ? 2.5 : 1.75" />
          <span class="text-[10px] font-medium tracking-wide">{{ item.label }}</span>
        </RouterLink>
      </div>
    </nav>

    <RouterLink
      v-if="!hideFab"
      to="/visitas/nueva"
      class="fixed right-5 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-brand text-white shadow-brand cursor-pointer active:scale-90 transition-all duration-150"
      style="bottom: calc(5rem + env(safe-area-inset-bottom, 0))"
      aria-label="Registrar visita"
    >
      <Plus :size="26" :stroke-width="2" />
    </RouterLink>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Home, MapPin, Map, Plus, Trophy, BarChart2 } from 'lucide-vue-next'

const route = useRoute()

const hideFab = computed(() =>
  ['/lugares/nuevo', '/visitas/nueva'].includes(route.path) ||
  route.path.endsWith('/editar')
)

const navItems = [
  { to: '/', label: 'Inicio', icon: Home },
  { to: '/lugares', label: 'Lugares', icon: MapPin },
  { to: '/ranking', label: 'Ranking', icon: Trophy },
  { to: '/mapa', label: 'Mapa', icon: Map },
  { to: '/estadisticas', label: 'Stats', icon: BarChart2 },
]

function isActive(path) {
  return path === '/' ? route.path === '/' : route.path.startsWith(path)
}
</script>
