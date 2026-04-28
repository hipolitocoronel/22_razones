<template>
  <div class="pb-4">
    <button @click="router.back()" class="flex items-center gap-1.5 text-sm text-brand cursor-pointer transition-colors mb-5 min-h-[44px]">
      <ArrowLeft :size="16" /> Volver
    </button>

    <h1 class="text-xl font-bold text-main mb-5">Editar lugar</h1>

    <div v-if="loading" class="flex flex-col gap-4 animate-pulse">
      <div class="h-10 bg-surface-2 rounded-xl" />
      <div class="h-10 bg-surface-2 rounded-xl" />
    </div>

    <form v-else @submit.prevent="handleSubmit" class="flex flex-col gap-5" novalidate>

      <div>
        <label for="name" class="form-label">Nombre <span class="text-red-400" aria-hidden="true">*</span></label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          class="form-input"
          :class="errors.name ? 'border-red-400' : ''"
          required
          autocomplete="off"
          @blur="errors.name = form.name ? '' : 'Ingresá el nombre del lugar'"
        />
        <p v-if="errors.name" role="alert" class="text-xs text-red-500 mt-1 flex items-center gap-1">
          <AlertCircle :size="12" /> {{ errors.name }}
        </p>
      </div>

      <div>
        <label for="address" class="form-label">Dirección</label>
        <input id="address" v-model="form.address" type="text" class="form-input" autocomplete="off" />
        <p v-if="form.lat && form.lng" class="text-xs text-brand flex items-center gap-1 mt-1.5">
          <MapPin :size="10" /> Coordenadas guardadas
        </p>
      </div>

      <p v-if="errors.general" role="alert" class="text-red-500 text-sm flex items-center gap-1.5 bg-red-50 px-3 py-2.5 rounded-xl">
        <AlertCircle :size="14" /> {{ errors.general }}
      </p>

      <div class="pt-2">
        <button
          type="submit"
          :disabled="submitting"
          class="btn-primary w-full py-4 text-base shadow-brand flex items-center justify-center gap-2"
        >
          <Loader2 v-if="submitting" :size="18" class="animate-spin" />
          {{ submitting ? 'Guardando...' : 'Guardar cambios' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { setOptions, importLibrary } from '@googlemaps/js-api-loader'
import { usePlacesStore } from '../stores/places'
import { useToast } from '../composables/useToast'
import { ArrowLeft, AlertCircle, Loader2, MapPin } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const placesStore = usePlacesStore()
const { show: showToast } = useToast()

const loading = ref(true)
const submitting = ref(false)
const errors = ref({ name: '', general: '' })

const form = ref({ name: '', address: '', lat: null, lng: null })
const originalAddress = ref('')

onMounted(async () => {
  if (!placesStore.places.length) await placesStore.fetchPlaces()
  const place = placesStore.places.find(p => p.id === route.params.id)
  if (place) {
    form.value.name = place.name
    form.value.address = place.address ?? ''
    form.value.lat = place.lat
    form.value.lng = place.lng
    originalAddress.value = place.address ?? ''
  }
  loading.value = false

  setOptions({
    key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    v: 'weekly',
  })

  const [core, places] = await Promise.all([
    importLibrary('core'),
    importLibrary('places'),
  ])

  const corrientesBounds = new core.LatLngBounds(
    new core.LatLng(-27.52, -58.90),
    new core.LatLng(-27.44, -58.78)
  )

  const input = document.getElementById('address')
  if (!input) return
  const autocomplete = new places.Autocomplete(input, {
    componentRestrictions: { country: 'ar' },
    bounds: corrientesBounds,
    fields: ['formatted_address', 'geometry'],
  })

  autocomplete.addListener('place_changed', () => {
    const p = autocomplete.getPlace()
    if (!p.geometry) return
    form.value.address = p.formatted_address
    form.value.lat = p.geometry.location.lat()
    form.value.lng = p.geometry.location.lng()
  })
})

async function geocodeIfNeeded() {
  const addressChanged = form.value.address !== originalAddress.value
  if (!addressChanged && form.value.lat && form.value.lng) return
  if (!form.value.address?.trim()) return

  try {
    const geocoding = await importLibrary('geocoding')
    const geocoder = new geocoding.Geocoder()
    const q = form.value.address.toLowerCase().includes('corrientes')
      ? form.value.address
      : `${form.value.address}, Corrientes, Argentina`
    const { results } = await geocoder.geocode({
      address: q,
      componentRestrictions: { country: 'AR' },
    })
    const loc = results[0]?.geometry?.location
    if (loc) {
      form.value.lat = loc.lat()
      form.value.lng = loc.lng()
    }
  } catch {
    // Ignoramos el fallo: guardamos sin actualizar coordenadas
  }
}

async function handleSubmit() {
  errors.value = { name: '', general: '' }
  if (!form.value.name.trim()) {
    errors.value.name = 'Ingresá el nombre del lugar'
    return
  }
  submitting.value = true
  try {
    await geocodeIfNeeded()
    await placesStore.updatePlace(route.params.id, {
      name: form.value.name,
      address: form.value.address || null,
      lat: form.value.lat,
      lng: form.value.lng,
    })
    showToast('Cambios guardados')
    router.push(`/lugares/${route.params.id}`)
  } catch {
    errors.value.general = 'Error al guardar. Intentá de nuevo.'
  } finally {
    submitting.value = false
  }
}
</script>
