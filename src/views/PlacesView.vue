<template>
  <div>
    <div
      v-if="ptr.pulling.value || ptr.triggered.value"
      class="flex justify-center overflow-hidden transition-all"
      :style="{ height: ptr.triggered.value ? '48px' : `${ptr.progress.value * 48}px`, opacity: ptr.triggered.value ? 1 : ptr.progress.value }"
    >
      <div class="flex items-center justify-center w-10 h-10 rounded-full bg-surface-2 text-brand">
        <Loader2 :size="18" :class="ptr.triggered.value ? 'animate-spin' : ''" :style="{ transform: `rotate(${ptr.progress.value * 360}deg)` }" />
      </div>
    </div>
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-xl font-bold text-main">Lugares</h1>
      <RouterLink
        to="/lugares/nuevo"
        class="flex items-center gap-1.5 text-sm font-medium text-brand cursor-pointer min-h-[44px] px-1"
        aria-label="Agregar lugar"
      >
        <PlusCircle :size="18" /> Agregar
      </RouterLink>
    </div>

    <!-- Tabs -->
    <div class="flex bg-surface-2 rounded-xl p-1 mb-5">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        @click="activeTab = tab.value"
        class="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all duration-150"
        :class="activeTab === tab.value
          ? 'bg-surface text-main shadow-sm'
          : 'text-soft hover:text-main'"
      >
        <component :is="tab.icon" :size="15" />
        {{ tab.label }}
        <span class="text-xs rounded-full px-1.5" :class="activeTab === tab.value ? 'bg-brand-light text-brand' : 'bg-brand-light/60 text-soft'">
          {{ tab.value === 'visitado' ? visitados.length : porIr.length }}
        </span>
      </button>
    </div>

    <!-- Skeleton -->
    <div v-if="loading" class="flex flex-col gap-3">
      <div v-for="i in 3" :key="i" class="card p-4 animate-pulse">
        <div class="h-4 bg-brand-light rounded w-2/3 mb-2" />
        <div class="h-3 bg-surface-2 rounded w-1/3" />
      </div>
    </div>

    <!-- Visitados -->
    <div v-else-if="activeTab === 'visitado'">
      <div v-if="!visitados.length" class="card p-8 flex flex-col items-center text-center gap-3">
        <div class="w-16 h-16 rounded-full bg-brand-light flex items-center justify-center">
          <Coffee :size="32" class="text-brand" />
        </div>
        <div>
          <p class="font-semibold text-main" style="font-family: var(--font-heading)">Sin lugares visitados aún</p>
          <p class="text-sm text-muted mt-1">Registrá su primera salida</p>
        </div>
        <RouterLink to="/visitas/nueva" class="btn-primary px-6 py-2.5 text-sm flex items-center gap-1.5 mt-2">
          <CheckCircle :size="15" /> Registrar primera visita
        </RouterLink>
      </div>
      <div v-else class="flex flex-col gap-3">
        <PlaceCard
          v-for="place in visitadosOrdenados"
          :key="place.id"
          :place="place"
          :avg-score="statsFor(place.id).avg"
          :visit-count="statsFor(place.id).count"
        />
      </div>
    </div>

    <!-- Por ir -->
    <div v-else>
      <button
        v-if="porIr.length >= 2"
        @click="rollRandom"
        :disabled="rolling"
        class="btn-outline w-full flex items-center justify-center gap-2 py-3 text-sm mb-3 active:scale-95"
      >
        <Dices :size="16" :class="rolling ? 'animate-spin' : ''" />
        {{ rolling ? '...' : '¿No saben a dónde ir?' }}
      </button>

      <div v-if="!porIr.length" class="card p-8 flex flex-col items-center text-center gap-3">
        <div class="w-16 h-16 rounded-full bg-brand-light flex items-center justify-center">
          <Bookmark :size="32" class="text-brand" />
        </div>
        <div>
          <p class="font-semibold text-main" style="font-family: var(--font-heading)">Nada pendiente todavía</p>
          <p class="text-sm text-muted mt-1">Guardá lugares para ir más adelante</p>
        </div>
        <RouterLink to="/lugares/nuevo" class="btn-primary px-6 py-2.5 text-sm flex items-center gap-1.5 mt-2">
          <PlusCircle :size="15" /> Agregar lugar
        </RouterLink>
      </div>
      <div v-else class="flex flex-col gap-3">
        <div
          v-for="place in porIr"
          :key="place.id"
          :data-place-id="place.id"
          class="card p-4 transition-all duration-300"
          :class="place.id === highlightedId ? 'ring-2 ring-brand shadow-brand' : ''"
        >
          <RouterLink
            :to="`/lugares/${place.id}`"
            class="flex items-start justify-between gap-2 cursor-pointer group"
          >
            <div class="min-w-0">
              <p class="font-semibold text-main group-hover:text-brand transition-colors truncate" style="font-family: var(--font-heading)">{{ place.name }}</p>
              <p v-if="place.address" class="text-muted text-xs mt-0.5 truncate">{{ place.address }}</p>
            </div>
            <ChevronRight :size="16" class="flex-shrink-0 self-center text-muted" />
          </RouterLink>
          <RouterLink
            :to="`/visitas/nueva?place=${place.id}`"
            class="btn-primary text-sm py-2 flex items-center justify-center gap-1.5 mt-3 cursor-pointer"
          >
            <CheckCircle :size="15" />
            Registrar visita
          </RouterLink>
          <div class="flex items-center gap-2 mt-3">
            <button
              @click="placesStore.toggleVote(place.id, 'want_me')"
              class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all duration-150 active:scale-95 min-h-[44px] focus-visible:ring-2 focus-visible:ring-amber-400"
              :class="place.want_me ? 'bg-amber-100 text-amber-700' : 'bg-surface-2 text-soft hover:text-main'"
              :aria-label="place.want_me ? 'Marcado: yo quiero ir' : 'Marcar: yo quiero ir'"
              :aria-pressed="place.want_me"
            >
              <Heart :size="15" :class="place.want_me ? 'fill-amber-500 text-amber-500' : ''" />
              Yo
            </button>
            <button
              @click="placesStore.toggleVote(place.id, 'want_her')"
              class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all duration-150 active:scale-95 min-h-[44px] focus-visible:ring-2 focus-visible:ring-rose-400"
              :class="place.want_her ? 'bg-rose-100 text-rose-700' : 'bg-surface-2 text-soft hover:text-main'"
              :aria-label="place.want_her ? 'Marcado: ella quiere ir' : 'Marcar: ella quiere ir'"
              :aria-pressed="place.want_her"
            >
              <Heart :size="15" :class="place.want_her ? 'fill-rose-500 text-rose-500' : ''" />
              Ella
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { usePlacesStore } from '../stores/places'
import { useVisitsStore } from '../stores/visits'
import { useVisitStats } from '../composables/useVisitStats'
import PlaceCard from '../components/PlaceCard.vue'
import { CheckCircle, Clock, Coffee, Bookmark, PlusCircle, Heart, ChevronRight, Dices, Loader2 } from 'lucide-vue-next'
import { useHaptic } from '../composables/useHaptic'
import { useToast } from '../composables/useToast'
import { usePullToRefresh } from '../composables/usePullToRefresh'

const route = useRoute()
const placesStore = usePlacesStore()
const visitsStore = useVisitsStore()
const { places } = storeToRefs(placesStore)
const { visits } = storeToRefs(visitsStore)
const { statsFor } = useVisitStats(visits)

const loading = ref(true)
const activeTab = ref(route.query.tab === 'por_ir' ? 'por_ir' : 'visitado')
const highlightedId = ref(null)
const rolling = ref(false)
const haptic = useHaptic()
const { show: showToast } = useToast()

async function rollRandom() {
  if (porIr.value.length < 2) return
  rolling.value = true
  haptic.medium()
  highlightedId.value = null
  await new Promise(r => setTimeout(r, 400))
  const pick = porIr.value[Math.floor(Math.random() * porIr.value.length)]
  highlightedId.value = pick.id
  rolling.value = false
  haptic.success()
  showToast(`¡A ${pick.name}!`)
  setTimeout(() => {
    const el = document.querySelector(`[data-place-id="${pick.id}"]`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, 50)
}

onMounted(async () => {
  await Promise.all([placesStore.fetchPlaces(), visitsStore.fetchVisits()])
  loading.value = false
})

const ptr = usePullToRefresh(async () => {
  await Promise.all([placesStore.fetchPlaces(), visitsStore.fetchVisits()])
})

const tabs = [
  { value: 'visitado', label: 'Visitados', icon: CheckCircle },
  { value: 'por_ir', label: 'Pendientes', icon: Clock },
]

const visitados = computed(() => places.value.filter(p => p.status === 'visitado'))
const porIr = computed(() => places.value.filter(p => p.status === 'por_ir'))

const visitadosOrdenados = computed(() =>
  [...visitados.value].sort((a, b) => statsFor(b.id).avg - statsFor(a.id).avg)
)
</script>
