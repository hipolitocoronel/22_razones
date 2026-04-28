<template>
  <div class="card p-4">
    <RouterLink :to="`/lugares/${place.id}`" class="flex items-start justify-between gap-2 cursor-pointer group">
      <div class="min-w-0">
        <p class="font-semibold text-main group-hover:text-brand transition-colors truncate">{{ place.name }}</p>
        <p v-if="place.address" class="text-xs text-muted mt-0.5 flex items-center gap-1 truncate">
          <MapPin :size="10" /> {{ place.address }}
        </p>
      </div>
      <div v-if="place.status === 'visitado'" class="flex flex-col items-end gap-1 flex-shrink-0">
        <Stars :score="Math.round(avgScore)" />
        <span class="text-xs text-muted">{{ visitCount }} visita{{ visitCount !== 1 ? 's' : '' }}</span>
      </div>
      <Clock v-else :size="18" class="text-brand flex-shrink-0 mt-0.5" />
    </RouterLink>

    <div v-if="place.status === 'por_ir'" class="mt-3 pt-3 border-t border-app">
      <RouterLink
        :to="`/visitas/nueva?place=${place.id}`"
        class="btn-primary flex items-center justify-center gap-1.5 w-full py-2.5 text-sm font-medium"
      >
        <CalendarCheck :size="15" /> Registrar visita
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import Stars from './Stars.vue'
import { MapPin, Clock, CalendarCheck } from 'lucide-vue-next'

defineProps({
  place: Object,
  avgScore: { type: Number, default: 0 },
  visitCount: { type: Number, default: 0 },
})
</script>
