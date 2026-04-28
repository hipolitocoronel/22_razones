<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <button @click="router.back()" class="flex items-center gap-1.5 text-sm text-brand cursor-pointer transition-colors min-h-[44px]">
        <ArrowLeft :size="16" /> Volver
      </button>
      <div v-if="place" class="flex items-center gap-1">
        <RouterLink
          :to="`/lugares/${route.params.id}/editar`"
          class="flex items-center gap-1.5 text-sm text-brand cursor-pointer min-h-[44px] px-2"
          aria-label="Editar lugar"
        >
          <Pencil :size="15" /> Editar
        </RouterLink>
        <button
          @click="handleDelete"
          :disabled="deleting"
          class="flex items-center gap-1.5 text-sm text-red-500 cursor-pointer min-h-[44px] px-2 disabled:opacity-50"
          aria-label="Eliminar lugar"
        >
          <Trash2 :size="15" /> Eliminar
        </button>
      </div>
    </div>

    <div v-if="!place" class="card p-5 animate-pulse flex flex-col gap-4">
      <div class="h-6 bg-brand-light rounded w-2/3" />
      <div class="h-4 bg-surface-2 rounded w-1/3" />
    </div>

    <div v-else class="flex flex-col gap-3">
      <!-- Header -->
      <div class="card p-5">
        <div class="flex items-start justify-between gap-2">
          <div>
            <h1 class="text-xl font-bold text-main">{{ place.name }}</h1>
            <p v-if="place.address" class="text-sm text-muted mt-1 flex items-center gap-1">
              <MapPin :size="13" /> {{ place.address }}
            </p>
          </div>
          <span
            class="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full flex-shrink-0"
            :class="place.status === 'visitado' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-brand-light text-brand border-app'"
          >
            <CheckCircle v-if="place.status === 'visitado'" :size="11" />
            <Clock v-else :size="11" />
            {{ place.status === 'visitado' ? 'Visitado' : 'Pendiente' }}
          </span>
        </div>

        <div v-if="place.status === 'visitado' && visits.length" class="flex items-center gap-3 mt-3 pt-3 border-t border-app">
          <div class="text-center">
            <p class="text-2xl font-bold text-brand">{{ avgScore.toFixed(1) }}</p>
            <p class="text-xs text-muted">promedio</p>
          </div>
          <Stars :score="Math.round(avgScore)" />
          <span class="text-sm text-muted ml-1">{{ visits.length }} visita{{ visits.length !== 1 ? 's' : '' }}</span>
        </div>
      </div>

      <!-- CTA si está pendiente -->
      <RouterLink
        v-if="place.status === 'por_ir'"
        :to="`/visitas/nueva?place=${place.id}`"
        class="btn-primary flex items-center justify-center gap-2 w-full py-4 shadow-brand"
      >
        <CalendarCheck :size="18" /> Registrar visita
      </RouterLink>

      <!-- Visitas del lugar -->
      <div v-if="visits.length">
        <p class="text-xs font-semibold text-muted uppercase tracking-wide mb-2 px-1">Visitas</p>
        <div class="flex flex-col gap-3">
          <VisitCard v-for="v in visits" :key="v.id" :visit="{ ...v, places: place }" />
        </div>
      </div>

      <!-- Registrar otra visita -->
      <RouterLink
        v-if="place.status === 'visitado'"
        :to="`/visitas/nueva?place=${place.id}`"
        class="btn-outline flex items-center justify-center gap-2 w-full py-3 text-sm"
      >
        <Plus :size="16" /> Registrar otra visita
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { supabase } from '../services/supabase'
import { usePlacesStore } from '../stores/places'
import { useToast } from '../composables/useToast'
import Stars from '../components/Stars.vue'
import VisitCard from '../components/VisitCard.vue'
import { ArrowLeft, MapPin, CheckCircle, Clock, CalendarCheck, Plus, Pencil, Trash2 } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const placesStore = usePlacesStore()
const { show: showToast } = useToast()

const place = ref(null)
const visits = ref([])
const deleting = ref(false)

onMounted(async () => {
  const [{ data: p }, { data: v }] = await Promise.all([
    supabase.from('places').select('*').eq('id', route.params.id).single(),
    supabase.from('visits').select('*').eq('place_id', route.params.id).order('date', { ascending: false }),
  ])
  place.value = p
  visits.value = v ?? []
})

async function handleDelete() {
  const count = visits.value.length
  const warning = count > 0
    ? `¿Eliminar "${place.value.name}"? También se borrarán ${count} visita${count !== 1 ? 's' : ''} asociada${count !== 1 ? 's' : ''}. Esta acción no se puede deshacer.`
    : `¿Eliminar "${place.value.name}"? Esta acción no se puede deshacer.`

  if (!confirm(warning)) return

  deleting.value = true
  try {
    await placesStore.deletePlace(route.params.id)
    showToast('Lugar eliminado')
    router.push('/lugares')
  } catch {
    showToast('Error al eliminar', 'error')
    deleting.value = false
  }
}

const avgScore = computed(() => {
  const scores = visits.value.filter(v => v.score).map(v => v.score)
  return scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
})
</script>
