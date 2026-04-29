<template>
  <div class="flex flex-col gap-4 relative">
    <!-- Hero card -->
    <div class="rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white p-5 shadow-brand">
      <div class="flex items-start justify-between">
        <div>
          <p class="text-amber-200 text-xs font-medium uppercase tracking-widest mb-1">Próximo 22</p>
          <p class="text-2xl font-bold" style="font-family: var(--font-heading)">{{ nextDate }}</p>
          <p class="text-amber-200 text-sm mt-0.5">{{ daysUntilNext === 0 ? '¡Es hoy!' : `en ${daysUntilNext} días` }}</p>
        </div>
        <div class="text-right">
          <p class="text-amber-200 text-xs font-medium uppercase tracking-widest mb-1">Salidas</p>
          <p class="text-2xl font-bold" style="font-family: var(--font-heading)">{{ visits.length }}</p>
        </div>
      </div>

      <div v-if="streak > 0" class="mt-4 flex items-center gap-2 bg-white/15 rounded-xl px-3 py-2">
        <Flame :size="16" class="text-orange-300" />
        <span class="text-sm font-medium">{{ streak }} {{ streak === 1 ? 'mes seguido' : 'meses seguidos' }} — ¡sigan así!</span>
      </div>

      <p v-if="daysTogether > 0" class="text-amber-100 text-xs mt-3 font-medium tracking-wide">
        <Heart :size="11" class="inline -mt-0.5 mr-1" /> {{ daysTogether }} días desde su primera salida
      </p>
      <p v-else class="text-amber-200/70 text-xs mt-3 italic">Porque una razón nunca es suficiente</p>
    </div>

    <!-- Hace tiempo que no van -->
    <RouterLink
      v-if="forgotten"
      :to="`/lugares/${forgotten.placeId}`"
      class="card p-4 flex items-center gap-3 cursor-pointer hover:shadow-app-md transition-shadow"
    >
      <div class="w-10 h-10 rounded-full bg-brand-light flex items-center justify-center flex-shrink-0">
        <Clock :size="18" class="text-brand" />
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-xs font-semibold text-muted uppercase tracking-wide">Hace tiempo que no van</p>
        <p class="font-semibold text-main truncate" style="font-family: var(--font-heading)">{{ forgotten.placeName }}</p>
        <p class="text-xs text-soft mt-0.5">Última visita hace {{ forgotten.monthsAgo }} meses — le dieron {{ forgotten.score }} estrellas</p>
      </div>
      <ChevronRight :size="16" class="text-muted flex-shrink-0" />
    </RouterLink>

    <!-- Recuerdo -->
    <div v-if="recuerdo" class="card p-4 bg-brand-light/40 flex flex-col gap-2">
      <div class="flex items-center gap-2 text-brand">
        <Sparkles :size="15" />
        <p class="text-xs font-semibold uppercase tracking-wide">En este día, hace {{ recuerdo.monthsAgo }} {{ recuerdo.monthsAgo === 1 ? 'mes' : 'meses' }}…</p>
      </div>
      <p class="font-semibold text-main" style="font-family: var(--font-heading)">{{ recuerdo.placeName }}</p>
      <Stars v-if="recuerdo.score" :score="recuerdo.score" />
      <p v-if="recuerdo.ordered" class="text-xs text-soft">{{ recuerdo.ordered }}</p>
    </div>

    <!-- Skeleton -->
    <div v-if="loading" class="flex flex-col gap-3">
      <div v-for="i in 3" :key="i" class="card p-4 animate-pulse">
        <div class="h-4 bg-brand-light rounded w-1/2 mb-2" />
        <div class="h-3 bg-surface-2 rounded w-1/4" />
      </div>
    </div>

    <!-- Empty -->
    <div v-else-if="visits.length === 0" class="card p-8 flex flex-col items-center text-center gap-3">
      <div class="w-14 h-14 rounded-full bg-brand-light flex items-center justify-center">
        <Coffee :size="28" class="text-brand" />
      </div>
      <div>
        <p class="font-semibold text-main" style="font-family: var(--font-heading)">Todavía no hay salidas registradas</p>
        <p class="text-sm text-muted mt-1">Agregá un lugar y registrá la primera salida</p>
      </div>
      <RouterLink to="/lugares/nuevo" class="btn-primary px-6 py-2.5 text-sm flex items-center gap-1.5 mt-2">
        <Coffee :size="15" /> Agregar primer lugar
      </RouterLink>
    </div>

    <!-- Lista -->
    <div v-else class="flex flex-col gap-3">
      <!-- sugerencias ocultas temporalmente -->
      <p class="text-xs font-semibold text-muted uppercase tracking-wide px-1">Historial</p>
      <VisitCard v-for="visit in visits" :key="visit.id" :visit="visit" />
    </div>

  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useVisitsStore } from '../stores/visits'
import { useCurrentStreak } from '../composables/useStreak'
import VisitCard from '../components/VisitCard.vue'
import { Flame, Coffee, Heart, Clock, ChevronRight } from 'lucide-vue-next'
import Stars from '../components/Stars.vue'
import { parseDate } from '../utils/format'

const store = useVisitsStore()
const { visits, loading } = storeToRefs(store)
const streak = useCurrentStreak(visits)

onMounted(() => store.fetchVisits())

const nextDate = computed(() => {
  const now = new Date()
  const next = new Date(now.getFullYear(), now.getMonth(), 22)
  if (next <= now) next.setMonth(next.getMonth() + 1)
  return next.toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })
})

const daysUntilNext = computed(() => {
  const now = new Date()
  const next = new Date(now.getFullYear(), now.getMonth(), 22)
  if (next <= now) next.setMonth(next.getMonth() + 1)
  return Math.ceil((next - now) / (1000 * 60 * 60 * 24))
})

const daysTogether = computed(() => {
  if (!visits.value.length) return 0
  const first = visits.value.reduce((min, v) =>
    parseDate(v.date) < parseDate(min.date) ? v : min
  )
  const ms = Date.now() - parseDate(first.date).getTime()
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)))
})

const forgotten = computed(() => {
  if (!visits.value.length) return null
  const now = new Date()
  const lastByPlace = new Map()
  for (const v of visits.value) {
    const curr = lastByPlace.get(v.place_id)
    if (!curr || parseDate(v.date) > parseDate(curr.date)) {
      lastByPlace.set(v.place_id, v)
    }
  }
  const candidates = [...lastByPlace.values()]
    .filter(v => {
      const months = (now.getFullYear() - parseDate(v.date).getFullYear()) * 12
        + now.getMonth() - parseDate(v.date).getMonth()
      return months >= 6 && (v.score || 0) >= 4
    })
    .sort((a, b) => (b.score || 0) - (a.score || 0))
  const pick = candidates[0]
  if (!pick) return null
  const d = parseDate(pick.date)
  const monthsAgo = (now.getFullYear() - d.getFullYear()) * 12 + now.getMonth() - d.getMonth()
  return {
    placeId: pick.place_id,
    placeName: pick.places?.name || '—',
    score: pick.score,
    monthsAgo,
  }
})

const recuerdo = computed(() => {
  if (!visits.value.length) return null
  const now = new Date()
  const todayDay = now.getDate()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()

  const match = visits.value
    .filter(v => {
      const d = parseDate(v.date)
      return d.getDate() === todayDay &&
        !(d.getFullYear() === currentYear && d.getMonth() === currentMonth)
    })
    .sort((a, b) => parseDate(b.date) - parseDate(a.date))[0]

  if (!match) return null

  const d = parseDate(match.date)
  const monthsAgo = (currentYear - d.getFullYear()) * 12 + (currentMonth - d.getMonth())
  const placeName = match.places?.name || '—'

  return { ...match, monthsAgo, placeName }
})

</script>
