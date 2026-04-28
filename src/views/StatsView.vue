<template>
  <div class="flex flex-col gap-4">
    <h1 class="text-xl font-bold text-main" style="font-family: var(--font-heading)">Estadísticas</h1>

    <div v-if="loading" class="grid grid-cols-2 gap-3">
      <div v-for="i in 8" :key="i" class="card p-4 animate-pulse">
        <div class="h-8 bg-brand-light rounded w-1/2 mb-2" />
        <div class="h-3 bg-surface-2 rounded w-3/4" />
      </div>
    </div>

    <div v-else class="grid grid-cols-2 gap-3">
      <div class="card p-4 flex flex-col gap-1">
        <p class="text-2xl font-bold text-brand">{{ stats.total }}</p>
        <p class="text-xs text-muted uppercase tracking-wide">Total salidas</p>
      </div>

      <div class="card p-4 flex flex-col gap-1">
        <p class="text-2xl font-bold text-brand">{{ currentStreak }}</p>
        <p class="text-xs text-muted uppercase tracking-wide">Racha actual</p>
      </div>

      <div class="card p-4 flex flex-col gap-1">
        <p class="text-2xl font-bold text-brand">{{ bestStreak }}</p>
        <p class="text-xs text-muted uppercase tracking-wide">Mejor racha</p>
      </div>

      <div class="card p-4 flex flex-col gap-1">
        <p class="text-2xl font-bold text-brand">{{ stats.avgScore }}</p>
        <p class="text-xs text-muted uppercase tracking-wide">Puntuación prom.</p>
      </div>

      <div class="card p-4 flex flex-col gap-1">
        <p class="text-2xl font-bold text-brand">{{ stats.avgPrice }}</p>
        <p class="text-xs text-muted uppercase tracking-wide">Precio prom. p/p</p>
      </div>

      <div class="card p-4 flex flex-col gap-1">
        <p class="text-2xl font-bold text-brand truncate">{{ stats.mostVisited.name || '—' }}</p>
        <p class="text-xs text-muted uppercase tracking-wide">
          Más visitado{{ stats.mostVisited.count ? ` (${stats.mostVisited.count}x)` : '' }}
        </p>
      </div>

      <div class="card p-4 flex flex-col gap-1">
        <p class="text-2xl font-bold text-brand truncate">{{ stats.topRated.name || '—' }}</p>
        <p class="text-xs text-muted uppercase tracking-wide">
          Mejor puntuado{{ stats.topRated.avg ? ` (${stats.topRated.avg})` : '' }}
        </p>
      </div>

      <div class="card p-4 flex flex-col gap-1">
        <p class="text-2xl font-bold text-brand">{{ stats.busiestMonth || '—' }}</p>
        <p class="text-xs text-muted uppercase tracking-wide">Mes más activo</p>
      </div>
    </div>

    <RouterLink
      v-if="!loading && stats.total"
      to="/anual"
      class="card p-4 flex items-center gap-3 cursor-pointer hover:shadow-app-md transition-shadow min-h-[44px]"
    >
      <div class="w-10 h-10 rounded-full bg-brand-light flex items-center justify-center flex-shrink-0">
        <Calendar :size="18" class="text-brand" />
      </div>
      <div class="flex-1 min-w-0">
        <p class="font-semibold text-main" style="font-family: var(--font-heading)">Ver año en revista</p>
        <p class="text-xs text-soft">Resumen del año actual</p>
      </div>
      <ChevronRight :size="16" class="text-muted flex-shrink-0" />
    </RouterLink>

    <!-- Por tipo de salida -->
    <div v-if="!loading && stats.byCategory.length" class="flex flex-col gap-2">
      <p class="text-xs font-semibold text-muted uppercase tracking-wide px-1">Por tipo de salida</p>
      <div class="card p-4 flex flex-col gap-3">
        <div v-for="item in stats.byCategory" :key="item.value" class="flex items-center gap-3">
          <span
            class="inline-flex items-center justify-center w-7 h-7 rounded-lg flex-shrink-0"
            :class="item.bg"
          >
            <component :is="item.icon" :size="14" :class="item.text" />
          </span>
          <span class="text-sm text-main flex-1">{{ item.label }}</span>
          <div class="flex items-center gap-2">
            <div class="w-20 h-1.5 rounded-full bg-surface-2 overflow-hidden">
              <div class="h-full rounded-full bg-brand" :style="{ width: `${item.pct}%` }" />
            </div>
            <span class="text-sm font-semibold text-brand w-4 text-right">{{ item.count }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { usePlacesStore } from '../stores/places'
import { useVisitsStore } from '../stores/visits'
import { useCurrentStreak, useBestStreak } from '../composables/useStreak'
import { useVisitStats } from '../composables/useVisitStats'
import { CATEGORIES } from '../utils/categories'
import { RouterLink } from 'vue-router'
import { Calendar, ChevronRight } from 'lucide-vue-next'

const placesStore = usePlacesStore()
const visitsStore = useVisitsStore()
const { places } = storeToRefs(placesStore)
const { visits } = storeToRefs(visitsStore)

const loading = ref(true)
const currentStreak = useCurrentStreak(visits)
const bestStreak = useBestStreak(visits)
const { byPlace } = useVisitStats(visits)

onMounted(async () => {
  await Promise.all([placesStore.fetchPlaces(), visitsStore.fetchVisits()])
  loading.value = false
})

const stats = computed(() => {
  const v = visits.value
  if (!v.length) {
    return {
      total: 0, avgScore: '—', avgPrice: '—',
      mostVisited: { name: '—', count: 0 },
      topRated: { name: '—', avg: null },
      busiestMonth: null,
      byCategory: [],
    }
  }

  let scoreSum = 0, scoreCount = 0, priceSum = 0, priceCount = 0
  const monthCounts = new Map()
  const categoryCounts = new Map()

  for (const visit of v) {
    if (visit.score) { scoreSum += visit.score; scoreCount++ }
    if (visit.price != null) { priceSum += Number(visit.price); priceCount++ }

    const d = new Date(visit.date)
    const monthKey = d.toLocaleDateString('es-AR', { month: 'short', year: '2-digit' })
    monthCounts.set(monthKey, (monthCounts.get(monthKey) || 0) + 1)

    const cat = visit.category || 'merienda'
    categoryCounts.set(cat, (categoryCounts.get(cat) || 0) + 1)
  }

  const placeById = new Map(places.value.map(p => [p.id, p]))
  let topCount = 0, topId = null
  let topAvg = 0, topAvgId = null
  for (const [id, s] of byPlace.value) {
    if (s.count > topCount) { topCount = s.count; topId = id }
    if (s.avg > topAvg) { topAvg = s.avg; topAvgId = id }
  }

  let busiestMonth = null, busiestCount = 0
  for (const [k, c] of monthCounts) {
    if (c > busiestCount) { busiestCount = c; busiestMonth = k }
  }

  const maxCat = Math.max(1, ...categoryCounts.values())
  const byCategory = CATEGORIES
    .map(c => {
      const count = categoryCounts.get(c.value) || 0
      return { ...c, count, pct: Math.round((count / maxCat) * 100) }
    })
    .filter(c => c.count > 0)
    .sort((a, b) => b.count - a.count)

  return {
    total: v.length,
    avgScore: scoreCount ? (scoreSum / scoreCount).toFixed(1) : '—',
    avgPrice: priceCount ? '$' + Math.round(priceSum / priceCount) : '—',
    mostVisited: topId ? { name: placeById.get(topId)?.name || '—', count: topCount } : { name: '—', count: 0 },
    topRated: topAvgId ? { name: placeById.get(topAvgId)?.name || '—', avg: topAvg.toFixed(1) } : { name: '—', avg: null },
    busiestMonth,
    byCategory,
  }
})
</script>
