<template>
  <div class="flex flex-col gap-4">
    <h1 class="text-xl font-bold text-main" style="font-family: var(--font-heading)">Ranking</h1>

    <div v-if="loading" class="flex flex-col gap-3">
      <div v-for="i in 4" :key="i" class="card p-4 animate-pulse">
        <div class="h-4 bg-brand-light rounded w-2/3 mb-2" />
        <div class="h-3 bg-surface-2 rounded w-1/3" />
      </div>
    </div>

    <div v-else-if="!ranked.length" class="card p-8 flex flex-col items-center text-center gap-3">
      <div class="w-14 h-14 rounded-full bg-brand-light flex items-center justify-center">
        <Trophy :size="28" class="text-brand" />
      </div>
      <div>
        <p class="font-semibold text-main" style="font-family: var(--font-heading)">Sin lugares visitados aún</p>
        <p class="text-sm text-muted mt-1">Registrá su primera salida para ver el ranking</p>
      </div>
      <RouterLink to="/visitas/nueva" class="btn-primary px-6 py-2.5 text-sm flex items-center gap-1.5 mt-2">
        <Trophy :size="15" /> Registrar primera visita
      </RouterLink>
    </div>

    <template v-else>
      <!-- Rank 1 hero -->
      <div
        v-if="ranked[0]"
        class="rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-white p-5 shadow-brand flex flex-col gap-2"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold uppercase tracking-widest text-amber-100">Campeón</span>
          <Trophy :size="20" class="text-amber-100" />
        </div>
        <p class="text-2xl font-bold" style="font-family: var(--font-heading)">{{ ranked[0].name }}</p>
        <p class="text-amber-100 text-sm">{{ ranked[0].address }}</p>
        <div class="flex items-center justify-between mt-1">
          <Stars :score="Math.round(ranked[0].avg)" variant="on-brand" />
          <div class="text-right">
            <p class="text-3xl font-bold leading-none">{{ ranked[0].avg.toFixed(1) }}</p>
            <p class="text-xs text-amber-200 mt-0.5">{{ ranked[0].visits }} {{ ranked[0].visits === 1 ? 'visita' : 'visitas' }}</p>
          </div>
        </div>
      </div>

      <!-- Ranks 2-3 -->
      <div v-if="ranked.length > 1" class="flex flex-col gap-3">
        <div
          v-for="(place, idx) in ranked.slice(1, 3)"
          :key="place.id"
          class="card p-4 flex items-center gap-3"
        >
          <div class="flex-shrink-0 w-8 h-8 rounded-full bg-brand-light flex items-center justify-center">
            <Medal :size="16" class="text-brand" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-main truncate" style="font-family: var(--font-heading)">{{ place.name }}</p>
            <Stars :score="Math.round(place.avg)" class="mt-0.5" />
          </div>
          <div class="text-right flex-shrink-0">
            <p class="text-lg font-bold text-brand">{{ place.avg.toFixed(1) }}</p>
            <p class="text-xs text-muted">{{ place.visits }} {{ place.visits === 1 ? 'visita' : 'visitas' }}</p>
          </div>
        </div>
      </div>

      <!-- Rest of ranking -->
      <div v-if="ranked.length > 3" class="flex flex-col gap-2">
        <p class="text-xs font-semibold text-muted uppercase tracking-wide px-1">Resto del ranking</p>
        <div
          v-for="(place, idx) in ranked.slice(3)"
          :key="place.id"
          class="card p-3 flex items-center gap-3"
        >
          <span class="text-sm font-bold text-muted w-6 text-center flex-shrink-0">#{{ idx + 4 }}</span>
          <div class="flex-1 min-w-0">
            <p class="font-medium text-main text-sm truncate">{{ place.name }}</p>
            <Stars :score="Math.round(place.avg)" class="mt-0.5" />
          </div>
          <div class="text-right flex-shrink-0">
            <p class="text-sm font-bold text-brand">{{ place.avg.toFixed(1) }}</p>
            <p class="text-xs text-muted">{{ place.visits }} {{ place.visits === 1 ? 'visita' : 'visitas' }}</p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { usePlacesStore } from '../stores/places'
import { useVisitsStore } from '../stores/visits'
import { useVisitStats } from '../composables/useVisitStats'
import Stars from '../components/Stars.vue'
import { Trophy, Medal } from 'lucide-vue-next'

const placesStore = usePlacesStore()
const visitsStore = useVisitsStore()
const { places } = storeToRefs(placesStore)
const { visits } = storeToRefs(visitsStore)
const { statsFor } = useVisitStats(visits)

const loading = ref(true)

onMounted(async () => {
  await Promise.all([placesStore.fetchPlaces(), visitsStore.fetchVisits()])
  loading.value = false
})

const ranked = computed(() =>
  places.value
    .filter(p => p.status === 'visitado')
    .map(place => {
      const s = statsFor(place.id)
      return { ...place, avg: s.avg, visits: s.count }
    })
    .filter(p => p.visits > 0)
    .sort((a, b) => b.avg - a.avg)
)
</script>
