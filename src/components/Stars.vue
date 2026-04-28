<template>
  <div v-if="interactive" class="flex gap-1" :class="variantClass">
    <button
      v-for="i in 5"
      :key="i"
      type="button"
      @click="$emit('update:score', i)"
      class="min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer transition-transform duration-150 active:scale-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded"
      :aria-label="`Puntuar ${i} ${i === 1 ? 'estrella' : 'estrellas'}`"
      :aria-pressed="i <= score"
    >
      <Star
        :size="28"
        :stroke-width="1.5"
        :class="i <= score ? 'star-filled' : 'star-empty'"
      />
    </button>
  </div>

  <div
    v-else
    class="flex gap-0.5"
    :class="variantClass"
    role="img"
    :aria-label="score ? `${score} de 5 estrellas` : 'Sin puntuación'"
  >
    <Star
      v-for="i in 5"
      :key="i"
      :size="14"
      :stroke-width="1.5"
      :class="i <= score ? 'star-filled' : 'star-empty'"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Star } from 'lucide-vue-next'

const props = defineProps({
  score: { type: Number, default: 0 },
  interactive: { type: Boolean, default: false },
  variant: { type: String, default: 'default' },
})
defineEmits(['update:score'])

const variantClass = computed(() => props.variant === 'on-brand' ? 'stars-on-brand' : '')
</script>

<style scoped>
.star-filled {
  color: var(--color-brand);
  fill: var(--color-brand);
}
.star-empty {
  color: var(--color-text-muted);
  fill: transparent;
  opacity: 0.5;
}

.stars-on-brand .star-filled {
  color: #ffffff;
  fill: #ffffff;
}
.stars-on-brand .star-empty {
  color: #ffffff;
  fill: transparent;
  opacity: 0.35;
}
</style>
