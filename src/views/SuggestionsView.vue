<template>
  <div class="flex flex-col gap-4 pb-4">
    <button @click="router.back()" class="flex items-center gap-1.5 text-sm text-brand cursor-pointer transition-colors mb-1 min-h-[44px]">
      <ArrowLeft :size="16" /> Volver
    </button>

    <header>
      <h1 class="text-xl font-bold text-main" style="font-family: var(--font-heading)">Sugerencias para ustedes</h1>
      <p class="text-sm text-soft mt-1">Claude arma 3 ideas de lugares en Corrientes en base a lo que ya visitaron.</p>
    </header>

    <button
      type="button"
      class="btn-primary w-full py-3.5 text-base flex items-center justify-center gap-2 shadow-brand"
      :disabled="loading"
      @click="requestSuggestions"
    >
      <Loader2 v-if="loading" :size="18" class="animate-spin" />
      <Sparkles v-else :size="18" />
      {{ loading ? 'Pensando...' : (suggestions.length ? 'Pedir otras' : 'Pedir sugerencias') }}
    </button>

    <p v-if="error" role="alert" class="text-red-500 text-sm flex items-center gap-1.5 bg-red-50 px-3 py-2.5 rounded-xl">
      <AlertCircle :size="14" /> {{ error }}
    </p>

    <!-- Skeleton -->
    <div v-if="loading" class="flex flex-col gap-3">
      <div v-for="i in 3" :key="i" class="card p-5 animate-pulse flex flex-col gap-3">
        <div class="h-5 bg-brand-light rounded w-2/3" />
        <div class="h-3 bg-surface-2 rounded w-1/3" />
        <div class="h-3 bg-surface-2 rounded w-full" />
        <div class="h-3 bg-surface-2 rounded w-5/6" />
      </div>
    </div>

    <!-- Resultados -->
    <div v-else-if="suggestions.length" class="flex flex-col gap-3">
      <div
        v-for="(s, i) in suggestions"
        :key="i"
        class="card p-5 flex flex-col gap-3"
      >
        <div>
          <h2 class="text-lg font-bold text-main" style="font-family: var(--font-heading)">{{ s.name }}</h2>
          <span
            class="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border mt-1.5"
            :class="[cat(s.category).bg, cat(s.category).text, cat(s.category).border]"
          >
            <component :is="cat(s.category).icon" :size="11" />
            {{ cat(s.category).label }}
          </span>
        </div>
        <p class="text-sm text-soft leading-relaxed">{{ s.reason }}</p>
        <button
          type="button"
          class="btn-outline w-full py-2.5 text-sm flex items-center justify-center gap-1.5 min-h-[44px]"
          :disabled="adding[i]"
          @click="addToPending(s, i)"
        >
          <Plus :size="15" /> {{ adding[i] ? 'Agregando...' : 'Agregar a pendientes' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { usePlacesStore } from '../stores/places'
import { useVisitsStore } from '../stores/visits'
import { useToast } from '../composables/useToast'
import { suggestPlaces } from '../services/claude'
import { getCategory } from '../utils/categories'
import { ArrowLeft, Sparkles, Loader2, AlertCircle, Plus } from 'lucide-vue-next'

const router = useRouter()
const placesStore = usePlacesStore()
const visitsStore = useVisitsStore()
const { places } = storeToRefs(placesStore)
const { visits } = storeToRefs(visitsStore)
const { show: showToast } = useToast()

const suggestions = ref([])
const loading = ref(false)
const error = ref('')
const adding = reactive({})

onMounted(async () => {
  await Promise.all([
    places.value.length ? null : placesStore.fetchPlaces(),
    visits.value.length ? null : visitsStore.fetchVisits(),
  ])
})

const cat = (value) => getCategory(value)

async function requestSuggestions() {
  error.value = ''
  loading.value = true
  try {
    const scores = new Map()
    for (const v of visits.value) {
      if (!v.score) continue
      const s = scores.get(v.place_id) || { sum: 0, count: 0 }
      s.sum += v.score
      s.count++
      scores.set(v.place_id, s)
    }
    const visitedPlaces = places.value
      .filter(p => p.status === 'visitado')
      .map(p => {
        const s = scores.get(p.id)
        return { name: p.name, avgScore: s ? (s.sum / s.count).toFixed(1) : null }
      })
    const pendingPlaces = places.value
      .filter(p => p.status === 'por_ir')
      .map(p => ({ name: p.name }))

    suggestions.value = await suggestPlaces({ visitedPlaces, pendingPlaces })
  } catch (e) {
    error.value = e.message || 'No pudimos obtener sugerencias'
  } finally {
    loading.value = false
  }
}

async function addToPending(s, idx) {
  adding[idx] = true
  try {
    await placesStore.createPlace({ name: s.name, status: 'por_ir' })
    showToast(`${s.name} agregado a pendientes`)
  } catch {
    showToast('Error al agregar', 'error')
  } finally {
    adding[idx] = false
  }
}
</script>
