<template>
  <div class="flex flex-col gap-5">
    <!-- Fecha -->
    <div>
      <label for="date" class="form-label">Fecha <span class="text-red-400" aria-hidden="true">*</span></label>
      <input id="date" v-model="form.date" type="date" class="form-input" required />
    </div>

    <!-- Categoría -->
    <div>
      <label class="form-label">Tipo de salida</label>
      <div class="flex gap-2 flex-wrap">
        <button
          v-for="cat in CATEGORIES"
          :key="cat.value"
          type="button"
          @click="form.category = cat.value"
          class="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border cursor-pointer transition-all duration-150 active:scale-95 min-h-[44px]"
          :class="form.category === cat.value
            ? [cat.bg, cat.text, cat.border]
            : 'bg-surface-2 text-soft border-app hover:border-brand'"
        >
          <component :is="cat.icon" :size="13" />
          {{ cat.label }}
        </button>
      </div>
    </div>

    <!-- Puntuación -->
    <div>
      <label class="form-label" id="score-label">Puntuación</label>
      <Stars v-model:score="form.score" :interactive="true" aria-labelledby="score-label" />
    </div>

    <!-- Qué pedimos -->
    <div>
      <label for="ordered" class="form-label">¿Qué pedimos?</label>
      <input id="ordered" v-model="form.ordered" type="text" placeholder="Ej: medialuna + cortado, torta de ricota..." class="form-input" autocomplete="off" />
    </div>

    <!-- Precio -->
    <div>
      <label for="price" class="form-label">Precio aprox. por persona</label>
      <div class="relative">
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm font-medium">$</span>
        <input id="price" v-model="form.price" type="text" inputmode="numeric" pattern="[0-9]*" placeholder="0" class="form-input pl-7" />
      </div>
    </div>

    <!-- Notas -->
    <div>
      <label for="notes" class="form-label">Notas</label>
      <textarea id="notes" v-model="form.notes" rows="3" class="form-input resize-none leading-relaxed" placeholder="Ambiente, servicio, lo que más les gustó..." />
    </div>

    <!-- Fotos -->
    <div>
      <label class="form-label">Fotos <span class="text-xs text-muted font-normal">({{ photoPreviews.length }}/5)</span></label>
      <input
        ref="photoInput"
        type="file"
        accept="image/*"
        multiple
        class="hidden"
        @change="$emit('photo-select', $event)"
      />
      <div v-if="photoPreviews.length" class="grid grid-cols-3 gap-2 mb-3">
        <div
          v-for="(url, i) in photoPreviews"
          :key="i"
          class="relative aspect-square"
        >
          <img :src="url" alt="Vista previa" class="w-full h-full rounded-xl object-cover" />
          <button
            type="button"
            @click="$emit('photo-remove', i)"
            :aria-label="`Quitar foto ${i + 1}`"
            class="absolute top-1 right-1 bg-black/60 text-white rounded-full cursor-pointer transition-colors hover:bg-black/80 active:scale-95 w-7 h-7 flex items-center justify-center"
          >
            <X :size="14" />
          </button>
        </div>
      </div>
      <button
        v-if="photoPreviews.length < 5"
        type="button"
        @click="photoInput?.click()"
        class="btn-outline flex items-center gap-2 px-4 py-2.5 text-sm cursor-pointer active:scale-95 min-h-[44px]"
      >
        <Camera :size="16" />
        {{ photoPreviews.length ? 'Agregar más' : 'Agregar foto' }}
      </button>
    </div>

    <!-- ¿Volvemos? -->
    <div>
      <label class="form-label">¿Volvemos?</label>
      <div class="flex gap-2 flex-wrap">
        <button
          v-for="opt in COME_BACK_OPTS"
          :key="opt.value"
          type="button"
          @click="form.come_back = form.come_back === opt.value ? '' : opt.value"
          class="btn-outline flex items-center gap-1.5 px-4 py-2.5 text-sm active:scale-95"
          :class="form.come_back === opt.value ? 'active' : ''"
        >
          <component :is="opt.icon" :size="14" />
          {{ opt.label }}
        </button>
      </div>
    </div>

    <!-- Momento especial -->
    <label class="flex items-center gap-3 cursor-pointer min-h-[44px] select-none">
      <div
        class="w-5 h-5 rounded border-2 flex items-center justify-center transition-colors duration-150 flex-shrink-0"
        :class="form.special_moment ? 'bg-brand border-brand' : 'border-app'"
        @click="form.special_moment = !form.special_moment"
      >
        <Check v-if="form.special_moment" :size="12" class="text-white" />
      </div>
      <div>
        <p class="text-sm font-medium text-main">Momento especial</p>
        <p class="text-xs text-muted">Aniversario, primera visita, algo único</p>
      </div>
    </label>

    <!-- Quién sugirió -->
    <div>
      <label class="form-label">¿Quién lo sugirió?</label>
      <div class="flex gap-2 flex-wrap">
        <button
          v-for="opt in SUGGESTED_BY_OPTS"
          :key="opt"
          type="button"
          @click="form.suggested_by = form.suggested_by === opt ? '' : opt"
          class="btn-outline px-4 py-2.5 text-sm active:scale-95"
          :class="form.suggested_by === opt ? 'active' : ''"
        >
          {{ opt }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Stars from './Stars.vue'
import { Camera, X, Check } from 'lucide-vue-next'
import { CATEGORIES } from '../utils/categories'
import { COME_BACK_OPTS, SUGGESTED_BY_OPTS } from '../utils/constants'

const form = defineModel({ required: true })

defineProps({
  photoPreviews: { type: Array, default: () => [] },
})

defineEmits(['photo-select', 'photo-remove'])

const photoInput = ref(null)
</script>
