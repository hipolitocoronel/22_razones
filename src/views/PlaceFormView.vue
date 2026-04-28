<template>
  <div class="pb-4">
    <button @click="router.back()" class="flex items-center gap-1.5 text-sm text-brand cursor-pointer transition-colors mb-5 min-h-[44px]">
      <ArrowLeft :size="16" /> Volver
    </button>

    <h1 class="text-xl font-bold text-main mb-5">Agregar lugar</h1>

    <form @submit.prevent="handleSubmit" class="flex flex-col gap-5" novalidate>

      <div>
        <label for="name" class="form-label">Nombre <span class="text-red-400" aria-hidden="true">*</span></label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          placeholder="Ej: La Biela, Café San Juan..."
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
        <input id="address" v-model="form.address" type="text" placeholder="Ej: Av. Quintana 600, Recoleta" class="form-input" autocomplete="off" />
        <p v-if="form.lat && form.lng" class="text-xs text-brand flex items-center gap-1 mt-1.5">
          <MapPin :size="10" /> Coordenadas guardadas
        </p>
      </div>

      <div>
        <label class="form-label">¿Ya fueron?</label>
        <div class="flex gap-3">
          <button
            v-for="opt in statusOpts"
            :key="opt.value"
            type="button"
            @click="form.status = opt.value"
            class="flex-1 flex flex-col items-center gap-1.5 py-4 rounded-2xl border-2 cursor-pointer transition-all duration-150 active:scale-95"
            :class="form.status === opt.value
              ? 'border-brand bg-brand-light text-brand'
              : 'border-app text-soft hover:border-brand'"
          >
            <component :is="opt.icon" :size="24" :stroke-width="1.75" />
            <span class="text-sm font-medium">{{ opt.label }}</span>
            <span class="text-xs text-center leading-tight opacity-70 px-1">{{ opt.desc }}</span>
          </button>
        </div>
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
          {{ submitting ? 'Guardando...' : form.status === 'visitado' ? 'Guardar y registrar visita' : 'Agregar a pendientes' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { setOptions, importLibrary } from '@googlemaps/js-api-loader'
import { usePlacesStore } from '../stores/places'
import { ArrowLeft, AlertCircle, Loader2, CheckCircle, Clock, MapPin } from 'lucide-vue-next'

const router = useRouter()
const placesStore = usePlacesStore()

const form = ref({ name: '', address: '', status: 'por_ir', lat: null, lng: null })
const errors = ref({ name: '', general: '' })
const submitting = ref(false)

let mapsLib = null

const statusOpts = [
  { value: 'por_ir', label: 'Todavía no', desc: 'Lo agrego para ir después', icon: Clock },
  { value: 'visitado', label: 'Ya fuimos', desc: 'Quiero registrar la visita', icon: CheckCircle },
]

onMounted(async () => {
  setOptions({
    key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    v: 'weekly',
  })

  const [core, places] = await Promise.all([
    importLibrary('core'),
    importLibrary('places'),
  ])
  mapsLib = core

  const corrientesBounds = new core.LatLngBounds(
    new core.LatLng(-27.52, -58.90),
    new core.LatLng(-27.44, -58.78)
  )

  const input = document.getElementById('address')
  const autocomplete = new places.Autocomplete(input, {
    componentRestrictions: { country: 'ar' },
    bounds: corrientesBounds,
    fields: ['formatted_address', 'geometry'],
  })

  autocomplete.addListener('place_changed', () => {
    const place = autocomplete.getPlace()
    if (!place.geometry) return
    form.value.address = place.formatted_address
    form.value.lat = place.geometry.location.lat()
    form.value.lng = place.geometry.location.lng()
  })
})

async function geocodeIfMissing() {
  if (form.value.lat && form.value.lng) return
  const query = form.value.address?.trim() || form.value.name?.trim()
  if (!query) return

  try {
    const geocoding = await importLibrary('geocoding')
    const geocoder = new geocoding.Geocoder()
    const biasedQuery = query.toLowerCase().includes('corrientes')
      ? query
      : `${query}, Corrientes, Argentina`

    const { results } = await geocoder.geocode({
      address: biasedQuery,
      componentRestrictions: { country: 'AR' },
    })
    const loc = results[0]?.geometry?.location
    if (loc) {
      form.value.lat = loc.lat()
      form.value.lng = loc.lng()
      if (!form.value.address && results[0]?.formatted_address) {
        form.value.address = results[0].formatted_address
      }
    }
  } catch {
    // Geocoding falló — guardamos igual sin coordenadas
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
    await geocodeIfMissing()
    const place = await placesStore.createPlace({ ...form.value })
    if (form.value.status === 'visitado') {
      router.push(`/visitas/nueva?place=${place.id}`)
    } else {
      router.push('/lugares?tab=por_ir')
    }
  } catch {
    errors.value.general = 'Error al guardar. Intentá de nuevo.'
  } finally {
    submitting.value = false
  }
}
</script>

