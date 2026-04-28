<template>
  <div class="flex flex-col gap-3">
    <h1 class="text-xl font-bold text-main">Mapa de meriendas</h1>

    <div v-if="!loading && placesWithCoords === 0" class="card p-8 flex flex-col items-center text-center gap-3">
      <div class="w-14 h-14 rounded-full bg-brand-light flex items-center justify-center">
        <MapPin :size="28" class="text-brand" />
      </div>
      <div>
        <p class="font-semibold text-main" style="font-family: var(--font-heading)">Sin lugares en el mapa</p>
        <p class="text-sm text-muted mt-1">Agregá un lugar con dirección para verlo acá</p>
      </div>
      <RouterLink to="/lugares/nuevo" class="btn-primary px-6 py-2.5 text-sm flex items-center gap-1.5 mt-2">
        <MapPin :size="15" /> Agregar lugar
      </RouterLink>
    </div>

    <div
      v-show="loading || placesWithCoords > 0"
      ref="mapEl"
      class="w-full rounded-2xl overflow-hidden"
      style="height: calc(100dvh - 11rem)"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { RouterLink } from 'vue-router'
import { setOptions, importLibrary } from '@googlemaps/js-api-loader'
import { MapPin } from 'lucide-vue-next'
import { usePlacesStore } from '../stores/places'

const placesStore = usePlacesStore()
const { places } = storeToRefs(placesStore)

const mapEl = ref(null)
const loading = ref(true)
const placesWithCoords = ref(0)

let map = null
let mapsCore = null

const CORRIENTES = { lat: -27.4806, lng: -58.8341 }

const CLEAN_MAP_STYLES = [
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ visibility: 'on' }] },
  { featureType: 'poi.park', elementType: 'labels', stylers: [{ visibility: 'off' }] },
]

function buildInfoContent(place, color, statusLabel) {
  const container = document.createElement('div')
  container.style.cssText = 'font-family:sans-serif;min-width:140px;padding:4px 2px'

  const name = document.createElement('strong')
  name.style.cssText = 'font-size:14px;color:#1c1917'
  name.textContent = place.name
  container.appendChild(name)

  if (place.address) {
    container.appendChild(document.createElement('br'))
    const addr = document.createElement('span')
    addr.style.cssText = 'color:#78716C;font-size:12px'
    addr.textContent = place.address
    container.appendChild(addr)
  }

  container.appendChild(document.createElement('br'))
  const status = document.createElement('span')
  status.style.cssText = `font-size:11px;color:${color};margin-top:2px;display:inline-block`
  status.textContent = statusLabel
  container.appendChild(status)

  if (place.avg_score) {
    container.appendChild(document.createElement('br'))
    const score = document.createElement('span')
    score.style.cssText = 'font-size:12px;color:#D97706'
    score.textContent = `★ ${Number(place.avg_score).toFixed(1)}`
    container.appendChild(score)
  }

  return container
}

function makeIcon(core, color) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
      <path d="M16 0C7.163 0 0 7.163 0 16c0 10 16 24 16 24s16-14 16-24C32 7.163 24.837 0 16 0z"
        fill="${color}" stroke="white" stroke-width="2"/>
      <circle cx="16" cy="16" r="6" fill="white" opacity="0.9"/>
    </svg>
  `
  return {
    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
    scaledSize: new core.Size(32, 40),
    anchor: new core.Point(16, 40),
  }
}

onMounted(async () => {
  await placesStore.fetchPlaces()
  loading.value = false

  const withCoords = places.value.filter(p => p.lat && p.lng)
  placesWithCoords.value = withCoords.length

  if (withCoords.length === 0) return

  setOptions({
    key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    v: 'weekly',
  })

  const [core, maps, marker] = await Promise.all([
    importLibrary('core'),
    importLibrary('maps'),
    importLibrary('marker'),
  ])
  mapsCore = core

  map = new maps.Map(mapEl.value, {
    center: CORRIENTES,
    zoom: 14,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    clickableIcons: false,
    styles: CLEAN_MAP_STYLES,
  })

  const bounds = new core.LatLngBounds()
  const infoWindow = new maps.InfoWindow()

  withCoords.forEach(p => {
    const visited = p.status === 'visitado'
    const color = visited ? '#D97706' : '#78716C'
    const statusLabel = visited ? 'Visitado' : 'Pendiente'

    const markerObj = new marker.Marker({
      position: { lat: p.lat, lng: p.lng },
      map,
      title: p.name,
      icon: makeIcon(core, color),
    })

    markerObj.addListener('click', () => {
      infoWindow.setContent(buildInfoContent(p, color, statusLabel))
      infoWindow.open(map, markerObj)
    })

    bounds.extend({ lat: p.lat, lng: p.lng })
  })

  map.fitBounds(bounds)
})

onUnmounted(() => {
  if (map && mapsCore) {
    mapsCore.event.clearInstanceListeners(map)
    map = null
  }
})
</script>
