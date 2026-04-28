<template>
  <div class="pb-4">
    <button @click="router.back()" class="flex items-center gap-1.5 text-sm text-brand cursor-pointer transition-colors mb-5 min-h-[44px]">
      <ArrowLeft :size="16" /> Volver
    </button>

    <h1 class="text-xl font-bold text-main mb-1">Registrar visita</h1>
    <p v-if="preloadedPlace" class="text-sm text-brand mb-5 flex items-center gap-1">
      <MapPin :size="13" /> {{ preloadedPlace.name }}
    </p>
    <div v-else class="mb-5" />

    <form @submit.prevent="handleSubmit" class="flex flex-col gap-5" novalidate>

      <!-- Lugar (solo si no viene pre-cargado) -->
      <div v-if="!preloadedPlace">
        <label for="place" class="form-label">Lugar <span class="text-red-400" aria-hidden="true">*</span></label>
        <select
          id="place"
          v-model="form.place_id"
          class="form-input"
          :class="errors.place_id ? 'border-red-400' : ''"
          @change="errors.place_id = ''"
        >
          <option value="" disabled>Seleccioná un lugar...</option>
          <option v-for="p in places" :key="p.id" :value="p.id">{{ p.name }}</option>
        </select>
        <p v-if="fetchError" role="alert" class="text-xs text-red-500 mt-1 flex items-center gap-1">
          <AlertCircle :size="12" /> Error al cargar lugares: {{ fetchError }}
        </p>
        <p v-if="errors.place_id" role="alert" class="text-xs text-red-500 mt-1 flex items-center gap-1">
          <AlertCircle :size="12" /> {{ errors.place_id }}
        </p>
      </div>

      <VisitFormFields
        v-model="form"
        :photo-previews="photo.previews.value"
        @photo-select="photo.onSelect"
        @photo-remove="onPhotoRemove"
      />

      <p v-if="errors.general" role="alert" class="text-red-500 text-sm flex items-center gap-1.5 bg-red-50 px-3 py-2.5 rounded-xl">
        <AlertCircle :size="14" /> {{ errors.general }}
      </p>

      <div class="sticky-submit">
        <button
          type="submit"
          :disabled="submitting"
          class="btn-primary w-full py-4 text-base shadow-brand flex items-center justify-center gap-2"
        >
          <Loader2 v-if="submitting" :size="18" class="animate-spin" />
          {{ submitting ? 'Guardando...' : 'Guardar visita' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useVisitsStore } from '../stores/visits'
import { usePlacesStore } from '../stores/places'
import { useToast } from '../composables/useToast'
import { useVisitPhoto } from '../composables/useVisitPhoto'
import { useWeather } from '../composables/useWeather'
import VisitFormFields from '../components/VisitFormFields.vue'
import { ArrowLeft, AlertCircle, Loader2, MapPin } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const visitsStore = useVisitsStore()
const placesStore = usePlacesStore()
const { places, fetchError } = storeToRefs(placesStore)
const { show: showToast } = useToast()
const photo = useVisitPhoto()
const { fetchWeather } = useWeather()

const today = new Date().toISOString().split('T')[0]
const preloadedPlace = ref(null)

const form = ref({
  place_id: '',
  date: today,
  category: 'merienda',
  score: 0,
  ordered: '',
  price: '',
  notes: '',
  come_back: '',
  special_moment: false,
  suggested_by: '',
  photo_urls: [],
  weather: '',
})

const errors = ref({ place_id: '', general: '' })
const submitting = ref(false)

function onPhotoRemove(idx) {
  photo.removeAt(idx)
}

onMounted(async () => {
  await placesStore.fetchPlaces()
  const placeId = route.query.place
  if (placeId) {
    form.value.place_id = placeId
    preloadedPlace.value = places.value.find(p => p.id === placeId) ?? null
  }
})

async function handleSubmit() {
  errors.value = { place_id: '', general: '' }
  if (!form.value.place_id) {
    errors.value.place_id = 'Seleccioná un lugar'
    return
  }
  submitting.value = true
  try {
    try {
      form.value.photo_urls = await photo.upload(form.value.place_id)
    } catch {
      errors.value.general = 'Error al subir la foto. Intentá de nuevo.'
      submitting.value = false
      return
    }
    const place = places.value.find(p => p.id === form.value.place_id)
    if (place?.lat && place?.lng && !form.value.weather) {
      const result = await fetchWeather(place.lat, place.lng, form.value.date)
      if (result) {
        form.value.weather = `${result.description} ${Math.round(result.tempMax)}°C`
      }
    }
    const payload = { ...form.value, price: form.value.price || null }
    const visit = await visitsStore.createVisit(payload)
    await placesStore.markVisited(form.value.place_id)
    showToast('Visita guardada')
    setTimeout(() => router.push(`/visitas/${visit.id}`), 800)
  } catch {
    errors.value.general = 'Error al guardar. Intentá de nuevo.'
  } finally {
    submitting.value = false
  }
}
</script>
