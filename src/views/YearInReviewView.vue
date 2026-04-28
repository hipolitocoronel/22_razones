<template>
  <div class="flex flex-col gap-4 pb-4">
    <button @click="router.back()" class="flex items-center gap-1.5 text-sm text-brand cursor-pointer transition-colors mb-1 min-h-[44px]">
      <ArrowLeft :size="16" /> Volver
    </button>

    <!-- Hero -->
    <div class="rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white p-6 shadow-brand">
      <p class="text-amber-200 text-xs font-medium uppercase tracking-widest mb-1">Año en revista</p>
      <h1 class="text-3xl font-bold mb-3" style="font-family: var(--font-heading)">Nuestro {{ year }}</h1>
      <div class="flex items-center gap-5">
        <div>
          <p class="text-3xl font-bold" style="font-family: var(--font-heading)">{{ summary.total }}</p>
          <p class="text-amber-200 text-xs uppercase tracking-widest">Salidas</p>
        </div>
        <div v-if="summary.bestStreak">
          <p class="text-3xl font-bold" style="font-family: var(--font-heading)">{{ summary.bestStreak }}</p>
          <p class="text-amber-200 text-xs uppercase tracking-widest">Mejor racha</p>
        </div>
      </div>
    </div>

    <div v-if="loading" class="card p-5 animate-pulse">
      <div class="h-4 bg-brand-light rounded w-1/2 mb-3" />
      <div class="h-20 bg-surface-2 rounded" />
    </div>

    <!-- Empty -->
    <div v-else-if="!summary.total" class="card p-8 flex flex-col items-center text-center gap-3">
      <div class="w-14 h-14 rounded-full bg-brand-light flex items-center justify-center">
        <Calendar :size="28" class="text-brand" />
      </div>
      <div>
        <p class="font-semibold text-main" style="font-family: var(--font-heading)">Sin salidas en {{ year }}</p>
        <p class="text-sm text-muted mt-1">Todavía no registraron salidas este año</p>
      </div>
      <RouterLink to="/visitas/nueva" class="btn-primary px-6 py-2.5 text-sm flex items-center gap-1.5 mt-2">
        <Coffee :size="15" /> Agregar visita
      </RouterLink>
    </div>

    <template v-else>
      <!-- Foto destacada -->
      <div v-if="summary.photoUrl" class="card p-0 overflow-hidden">
        <img :src="summary.photoUrl" alt="Foto destacada" class="w-full object-cover max-h-64" />
      </div>

      <!-- Stats grid -->
      <div class="grid grid-cols-2 gap-3">
        <div class="card p-4 flex flex-col gap-1">
          <p class="text-lg font-bold text-brand truncate">{{ summary.topRated.name || '—' }}</p>
          <p class="text-xs text-muted uppercase tracking-wide">
            Mejor lugar{{ summary.topRated.avg ? ` (${summary.topRated.avg})` : '' }}
          </p>
        </div>
        <div class="card p-4 flex flex-col gap-1">
          <p class="text-lg font-bold text-brand truncate">{{ summary.mostVisited.name || '—' }}</p>
          <p class="text-xs text-muted uppercase tracking-wide">
            Más visitado{{ summary.mostVisited.count ? ` (${summary.mostVisited.count}x)` : '' }}
          </p>
        </div>
        <div class="card p-4 flex flex-col gap-1">
          <p class="text-lg font-bold text-brand capitalize">{{ summary.busiestMonth || '—' }}</p>
          <p class="text-xs text-muted uppercase tracking-wide">Mes más activo</p>
        </div>
        <div class="card p-4 flex flex-col gap-1">
          <p class="text-lg font-bold text-brand capitalize">{{ summary.favCategory || '—' }}</p>
          <p class="text-xs text-muted uppercase tracking-wide">Categoría favorita</p>
        </div>
        <div class="card p-4 flex flex-col gap-1 col-span-2">
          <p class="text-2xl font-bold text-brand">{{ summary.totalSpent }}</p>
          <p class="text-xs text-muted uppercase tracking-wide">Gasto total del año</p>
        </div>
      </div>

      <!-- Timeline 12 meses -->
      <div class="card p-5">
        <p class="text-xs font-semibold text-muted uppercase tracking-wide mb-3">Meses con salidas</p>
        <div class="grid grid-cols-6 gap-2">
          <div
            v-for="m in monthGrid"
            :key="m.idx"
            class="flex flex-col items-center gap-1"
          >
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold transition-all"
              :class="m.active ? 'bg-brand text-white' : 'bg-surface-2 text-muted'"
            >
              {{ m.count || '' }}
            </div>
            <p class="text-[10px] text-muted capitalize">{{ m.label }}</p>
          </div>
        </div>
      </div>

      <!-- Top 3 -->
      <div v-if="summary.topThree.length" class="card p-5 flex flex-col gap-3">
        <p class="text-xs font-semibold text-muted uppercase tracking-wide">Top 3 lugares</p>
        <div v-for="(p, i) in summary.topThree" :key="p.id" class="flex items-center gap-3">
          <div class="w-7 h-7 rounded-full bg-brand-light text-brand flex items-center justify-center text-sm font-bold flex-shrink-0">
            {{ i + 1 }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-main truncate">{{ p.name }}</p>
            <Stars :score="Math.round(p.avg)" />
          </div>
          <span class="text-xs text-muted">{{ p.avg.toFixed(1) }}</span>
        </div>
      </div>

      <!-- Primera y última -->
      <div v-if="summary.firstVisit" class="card p-5 flex items-start gap-3">
        <div class="w-9 h-9 rounded-full bg-brand-light flex items-center justify-center flex-shrink-0">
          <Sunrise :size="18" class="text-brand" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-xs font-semibold text-muted uppercase tracking-wide">Primera del año</p>
          <p class="font-semibold text-main truncate" style="font-family: var(--font-heading)">{{ summary.firstVisit.name }}</p>
          <p class="text-xs text-soft">{{ summary.firstVisit.date }}</p>
        </div>
      </div>

      <div v-if="summary.lastVisit && summary.lastVisit.id !== summary.firstVisit?.id" class="card p-5 flex items-start gap-3">
        <div class="w-9 h-9 rounded-full bg-brand-light flex items-center justify-center flex-shrink-0">
          <Sunset :size="18" class="text-brand" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-xs font-semibold text-muted uppercase tracking-wide">Última del año</p>
          <p class="font-semibold text-main truncate" style="font-family: var(--font-heading)">{{ summary.lastVisit.name }}</p>
          <p class="text-xs text-soft">{{ summary.lastVisit.date }}</p>
        </div>
      </div>
    </template>

    <RouterLink to="/" class="btn-outline w-full py-3 text-center mt-2">
      Volver al inicio
    </RouterLink>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useVisitsStore } from '../stores/visits'
import Stars from '../components/Stars.vue'
import { ArrowLeft, Coffee, Calendar, Sunrise, Sunset } from 'lucide-vue-next'
import { getCategory } from '../utils/categories'

const route = useRoute()
const router = useRouter()
const store = useVisitsStore()
const { visits } = storeToRefs(store)
const loading = ref(true)

const year = computed(() => Number(route.query.year) || new Date().getFullYear())

onMounted(async () => {
  if (!visits.value.length) await store.fetchVisits()
  loading.value = false
})

const yearVisits = computed(() =>
  visits.value.filter(v => new Date(v.date).getFullYear() === year.value)
)

const monthGrid = computed(() => {
  const counts = new Array(12).fill(0)
  for (const v of yearVisits.value) counts[new Date(v.date).getMonth()]++
  const labels = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']
  return counts.map((c, i) => ({ idx: i, label: labels[i], count: c, active: c > 0 }))
})

const summary = computed(() => {
  const v = yearVisits.value
  if (!v.length) {
    return {
      total: 0,
      totalSpent: '$0',
      bestStreak: 0,
      mostVisited: { name: '', count: 0 },
      topRated: { name: '', avg: null },
      busiestMonth: null,
      favCategory: null,
      topThree: [],
      firstVisit: null,
      lastVisit: null,
      photoUrl: null,
    }
  }

  const sorted = [...v].sort((a, b) => new Date(a.date) - new Date(b.date))
  let spent = 0
  const byPlace = new Map()
  const monthCount = new Map()
  const catCount = new Map()
  let photoUrl = null

  for (const it of v) {
    if (it.price) spent += Number(it.price) * 2
    const pid = it.place_id
    if (!byPlace.has(pid)) byPlace.set(pid, { id: pid, name: it.places?.name || '—', sum: 0, count: 0 })
    const p = byPlace.get(pid)
    if (it.score) { p.sum += it.score; p.count++ }
    const m = new Date(it.date).getMonth()
    monthCount.set(m, (monthCount.get(m) || 0) + 1)
    const c = it.category || 'merienda'
    catCount.set(c, (catCount.get(c) || 0) + 1)
    if (!photoUrl) {
      if (it.photo_url) photoUrl = it.photo_url
      else if (Array.isArray(it.photo_urls) && it.photo_urls.length) photoUrl = it.photo_urls[0]
    }
  }

  const places = [...byPlace.values()].map(p => ({
    ...p,
    avg: p.count ? p.sum / p.count : 0,
  }))

  const mostVisitedArr = [...places].sort((a, b) => {
    const aCount = v.filter(x => x.place_id === a.id).length
    const bCount = v.filter(x => x.place_id === b.id).length
    return bCount - aCount
  })
  const mvPlace = mostVisitedArr[0]
  const mvCount = v.filter(x => x.place_id === mvPlace.id).length

  const rated = places.filter(p => p.count > 0).sort((a, b) => b.avg - a.avg)
  const top = rated[0]

  let busiestIdx = null, busiestCount = 0
  for (const [k, c] of monthCount) if (c > busiestCount) { busiestCount = c; busiestIdx = k }
  const monthName = busiestIdx != null
    ? new Date(year.value, busiestIdx, 1).toLocaleDateString('es-AR', { month: 'long' })
    : null

  let favCat = null, favCount = 0
  for (const [k, c] of catCount) if (c > favCount) { favCount = c; favCat = k }

  const uniqueMonths = [...new Set(v.map(x => new Date(x.date).getMonth()))].sort((a, b) => a - b)
  let bestStreak = 1, cur = 1
  for (let i = 1; i < uniqueMonths.length; i++) {
    if (uniqueMonths[i] - uniqueMonths[i - 1] === 1) { cur++; if (cur > bestStreak) bestStreak = cur }
    else cur = 1
  }
  if (uniqueMonths.length === 0) bestStreak = 0

  const fmtDate = d => new Date(d).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })

  return {
    total: v.length,
    totalSpent: spent ? `$${Math.round(spent).toLocaleString('es-AR')}` : '$0',
    bestStreak,
    mostVisited: { name: mvPlace.name, count: mvCount },
    topRated: top ? { name: top.name, avg: top.avg.toFixed(1) } : { name: '—', avg: null },
    busiestMonth: monthName,
    favCategory: favCat ? getCategory(favCat).label : null,
    topThree: rated.slice(0, 3),
    firstVisit: { id: sorted[0].id, name: sorted[0].places?.name || '—', date: fmtDate(sorted[0].date) },
    lastVisit: { id: sorted[sorted.length - 1].id, name: sorted[sorted.length - 1].places?.name || '—', date: fmtDate(sorted[sorted.length - 1].date) },
    photoUrl,
  }
})
</script>
