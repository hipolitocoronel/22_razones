<template>
  <RouterLink
    :to="`/visitas/${visit.id}`"
    class="card flex gap-3 p-4 cursor-pointer hover:shadow-app-md active:scale-[0.99] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
  >
    <div class="flex-shrink-0 w-1 rounded-full self-stretch" :class="scoreColor" />

    <div class="flex-1 min-w-0">
      <div class="flex items-start justify-between gap-2">
        <div class="min-w-0">
          <p class="font-semibold text-main truncate leading-tight" style="font-family: var(--font-heading)">
            {{ visit.places?.name ?? 'Lugar sin nombre' }}
          </p>
          <p class="text-xs text-muted mt-0.5">{{ formattedDate }}</p>
        </div>
        <Stars :score="visit.score" class="flex-shrink-0 mt-0.5" />
      </div>

      <p v-if="visit.ordered" class="text-sm text-soft mt-1.5 truncate">{{ visit.ordered }}</p>
      <p v-else-if="visit.notes" class="text-sm text-muted mt-1.5 line-clamp-1">{{ visit.notes }}</p>

      <div class="flex gap-1.5 mt-2 flex-wrap">
        <span
          class="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border"
          :class="[cat.bg, cat.text, cat.border]"
        >
          <component :is="cat.icon" :size="10" />
          {{ cat.label }}
        </span>
        <span v-if="visit.special_moment" class="inline-flex items-center gap-1 text-xs bg-brand-light text-brand px-2 py-0.5 rounded-full border border-app">
          <Sparkles :size="10" /> Especial
        </span>
        <span v-if="visit.come_back === 'si'" class="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-100">Volvemos</span>
        <span v-if="visit.come_back === 'no'" class="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full border border-red-100">No volvemos</span>
      </div>
    </div>

    <ChevronRight :size="16" class="flex-shrink-0 self-center text-muted" />
  </RouterLink>
</template>

<script setup>
import { computed } from 'vue'
import Stars from './Stars.vue'
import { ChevronRight, Sparkles } from 'lucide-vue-next'
import { getCategory } from '../utils/categories'

const props = defineProps({ visit: Object })

const cat = computed(() => getCategory(props.visit.category))

const formattedDate = computed(() =>
  new Date(props.visit.date).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
)

const scoreColor = computed(() => {
  const s = props.visit.score
  if (s >= 4) return 'bg-green-400'
  if (s >= 3) return 'bg-amber-400'
  return 'bg-red-300'
})
</script>
