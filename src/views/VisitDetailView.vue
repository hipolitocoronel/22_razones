<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <button
        @click="router.back()"
        class="flex items-center gap-1.5 text-sm text-brand cursor-pointer transition-colors min-h-[44px]"
      >
        <ArrowLeft :size="16" /> Volver
      </button>
      <RouterLink
        v-if="visit"
        :to="`/visitas/${route.params.id}/editar`"
        class="flex items-center gap-1.5 text-sm text-brand cursor-pointer min-h-[44px] px-1"
        aria-label="Editar visita"
      >
        <Pencil :size="15" /> Editar
      </RouterLink>
    </div>

    <!-- skeleton -->
    <div v-if="!visit" class="card p-5 animate-pulse flex flex-col gap-4">
      <div class="h-6 bg-brand-light rounded w-2/3" />
      <div class="h-4 bg-surface-2 rounded w-1/3" />
      <div class="h-16 bg-surface-2 rounded" />
    </div>

    <div v-else class="flex flex-col gap-3">
      <!-- Header card -->
      <div class="card p-5">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <h1 class="text-xl font-bold text-main leading-tight">{{ visit.places?.name }}</h1>
            <p class="text-sm text-soft mt-0.5 capitalize">{{ formattedDate }}</p>
          </div>
          <div class="flex flex-col items-end gap-1 flex-shrink-0">
            <Stars :score="visit.score" />
            <span class="text-xs text-muted">{{ visit.score }}/5</span>
          </div>
        </div>

        <div class="flex flex-wrap gap-2 mt-3">
          <span
            class="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border"
            :class="[cat.bg, cat.text, cat.border]"
          >
            <component :is="cat.icon" :size="11" />
            {{ cat.label }}
          </span>
          <span v-if="visit.special_moment" class="inline-flex items-center gap-1.5 text-xs bg-brand-light text-brand px-2.5 py-1 rounded-full border border-app">
            <Sparkles :size="11" /> Momento especial
          </span>
        </div>
      </div>

      <!-- Fotos -->
      <div v-if="visit.photo_urls?.length" class="grid grid-cols-2 gap-2">
        <button
          v-for="(url, i) in visit.photo_urls"
          :key="i"
          @click="openLightbox(i)"
          class="relative aspect-square rounded-xl overflow-hidden cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-400 active:scale-[0.98] transition-transform duration-150"
          :aria-label="`Ver foto ${i + 1} ampliada`"
        >
          <img :src="url" :alt="`Foto ${i + 1} de la visita`" class="w-full h-full object-cover" />
        </button>
      </div>
      <div v-else-if="visit.photo_url">
        <button
          @click="openLightbox(0)"
          class="w-full cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-400 active:scale-[0.98] transition-transform duration-150 rounded-2xl overflow-hidden"
          aria-label="Ver foto ampliada"
        >
          <img :src="visit.photo_url" alt="Foto de la visita" class="w-full object-cover max-h-64" />
        </button>
      </div>

      <!-- Lightbox -->
      <Teleport to="body">
        <Transition name="lightbox">
          <div
            v-if="lightboxIndex !== null"
            class="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
            @click.self="closeLightbox"
            role="dialog"
            aria-modal="true"
            aria-label="Foto ampliada"
          >
            <!-- Cerrar -->
            <button
              @click="closeLightbox"
              class="absolute top-4 right-4 w-11 h-11 flex items-center justify-center rounded-full bg-black/50 text-white cursor-pointer hover:bg-black/70 transition-colors focus-visible:ring-2 focus-visible:ring-white"
              aria-label="Cerrar"
            >
              <X :size="20" />
            </button>

            <!-- Contador -->
            <span v-if="lightboxUrls.length > 1" class="absolute top-5 left-1/2 -translate-x-1/2 text-white/70 text-sm font-medium">
              {{ lightboxIndex + 1 }} / {{ lightboxUrls.length }}
            </span>

            <!-- Imagen -->
            <img
              :src="lightboxUrls[lightboxIndex]"
              :alt="`Foto ${lightboxIndex + 1}`"
              class="max-w-full max-h-[85dvh] object-contain rounded-lg select-none"
            />

            <!-- Navegación -->
            <template v-if="lightboxUrls.length > 1">
              <button
                @click="lightboxIndex = (lightboxIndex - 1 + lightboxUrls.length) % lightboxUrls.length"
                class="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full bg-black/50 text-white cursor-pointer hover:bg-black/70 transition-colors focus-visible:ring-2 focus-visible:ring-white"
                aria-label="Foto anterior"
              >
                <ChevronLeft :size="22" />
              </button>
              <button
                @click="lightboxIndex = (lightboxIndex + 1) % lightboxUrls.length"
                class="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full bg-black/50 text-white cursor-pointer hover:bg-black/70 transition-colors focus-visible:ring-2 focus-visible:ring-white"
                aria-label="Foto siguiente"
              >
                <ChevronRight :size="22" />
              </button>
            </template>
          </div>
        </Transition>
      </Teleport>

      <!-- Info pills -->
      <div class="flex flex-wrap gap-2">
        <span v-if="visit.price" class="info-pill">
          <DollarSign :size="13" /> ${{ visit.price }} por persona
        </span>
        <span v-if="visit.suggested_by" class="info-pill">
          <Lightbulb :size="13" /> {{ visit.suggested_by }}
        </span>
        <span v-if="visit.weather" class="info-pill">
          <Cloud :size="13" /> {{ visit.weather }}
        </span>
        <span v-if="visit.come_back === 'si'" class="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full border border-green-100">
          <ThumbsUp :size="11" /> Volvemos
        </span>
        <span v-if="visit.come_back === 'no'" class="inline-flex items-center gap-1 text-xs bg-red-50 text-red-700 px-2.5 py-1 rounded-full border border-red-100">
          <ThumbsDown :size="11" /> No volvemos
        </span>
        <span v-if="visit.come_back === 'tal_vez'" class="info-pill">
          <HelpCircle :size="11" /> Tal vez volvamos
        </span>
      </div>

      <!-- Qué pedimos -->
      <div v-if="visit.ordered" class="card p-4">
        <p class="text-xs font-semibold text-muted uppercase tracking-wide mb-1.5">Qué pedimos</p>
        <p class="text-sm text-main leading-relaxed">{{ visit.ordered }}</p>
      </div>

      <!-- Notas -->
      <div v-if="visit.notes" class="card p-4">
        <p class="text-xs font-semibold text-muted uppercase tracking-wide mb-1.5">Notas</p>
        <p class="text-sm text-main leading-relaxed">{{ visit.notes }}</p>
      </div>

      <!-- Dirección -->
      <a
        v-if="visit.places?.address"
        :href="mapsUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="card p-4 flex items-center gap-2 cursor-pointer hover:shadow-app-md transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        :aria-label="`Abrir ${visit.places.address} en Google Maps`"
      >
        <MapPin :size="16" class="text-brand flex-shrink-0" />
        <p class="text-sm text-soft flex-1">{{ visit.places.address }}</p>
        <ExternalLink :size="13" class="text-muted flex-shrink-0" />
      </a>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { supabase } from '../services/supabase'
import Stars from '../components/Stars.vue'
import { ArrowLeft, Sparkles, DollarSign, Lightbulb, ThumbsUp, ThumbsDown, HelpCircle, MapPin, ExternalLink, Pencil, Cloud, X, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { getCategory } from '../utils/categories'

const route = useRoute()
const router = useRouter()
const visit = ref(null)
const lightboxIndex = ref(null)

const lightboxUrls = computed(() => {
  if (!visit.value) return []
  if (visit.value.photo_urls?.length) return visit.value.photo_urls
  if (visit.value.photo_url) return [visit.value.photo_url]
  return []
})

function openLightbox(i) {
  lightboxIndex.value = i
  document.body.style.overflow = 'hidden'
}

function closeLightbox() {
  lightboxIndex.value = null
  document.body.style.overflow = ''
}

function onKeyDown(e) {
  if (lightboxIndex.value === null) return
  if (e.key === 'Escape') closeLightbox()
  if (e.key === 'ArrowRight') lightboxIndex.value = (lightboxIndex.value + 1) % lightboxUrls.value.length
  if (e.key === 'ArrowLeft') lightboxIndex.value = (lightboxIndex.value - 1 + lightboxUrls.value.length) % lightboxUrls.value.length
}

onMounted(() => window.addEventListener('keydown', onKeyDown))
onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
  document.body.style.overflow = ''
})

onMounted(async () => {
  const { data } = await supabase
    .from('visits')
    .select('*, places(*)')
    .eq('id', route.params.id)
    .single()
  visit.value = data
})

const cat = computed(() => getCategory(visit.value?.category))

const mapsUrl = computed(() => {
  const p = visit.value?.places
  if (!p) return ''
  if (p.lat && p.lng) {
    return `https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.address || p.name || '')}`
})

const formattedDate = computed(() => {
  if (!visit.value) return ''
  return new Date(visit.value.date).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
})
</script>

<style scoped>
.lightbox-enter-active,
.lightbox-leave-active {
  transition: opacity 200ms ease;
}
.lightbox-enter-from,
.lightbox-leave-to {
  opacity: 0;
}

.info-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  background-color: var(--color-surface-2);
  color: var(--color-text-secondary);
  padding: 0.25rem 0.625rem;
  border-radius: 9999px;
  border: 1px solid var(--color-border-light);
}
</style>
