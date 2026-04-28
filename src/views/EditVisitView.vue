<template>
  <div class="pb-4">
    <button @click="router.back()" class="flex items-center gap-1.5 text-sm text-brand cursor-pointer transition-colors mb-5 min-h-[44px]">
      <ArrowLeft :size="16" /> Volver
    </button>

    <h1 class="text-xl font-bold text-main mb-1">Editar visita</h1>
    <p class="text-sm text-brand mb-5">{{ visit?.places?.name }}</p>

    <div v-if="loading" class="flex flex-col gap-4 animate-pulse">
      <div class="h-10 bg-surface-2 rounded-xl" />
      <div class="h-10 bg-surface-2 rounded-xl" />
      <div class="h-24 bg-surface-2 rounded-xl" />
    </div>

    <form v-else @submit.prevent="handleSubmit" class="flex flex-col gap-5" novalidate>
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
          {{ submitting ? 'Guardando...' : 'Guardar cambios' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../services/supabase'
import { useToast } from '../composables/useToast'
import { useVisitPhoto } from '../composables/useVisitPhoto'
import VisitFormFields from '../components/VisitFormFields.vue'
import { ArrowLeft, AlertCircle, Loader2 } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const { show: showToast } = useToast()

const visit = ref(null)
const loading = ref(true)
const submitting = ref(false)
const errors = ref({ general: '' })

const form = ref({
  date: '',
  category: 'merienda',
  score: 0,
  ordered: '',
  price: '',
  notes: '',
  come_back: '',
  special_moment: false,
  suggested_by: '',
  photo_urls: [],
})

const photo = useVisitPhoto()

function onPhotoRemove(idx) {
  photo.removeAt(idx)
}

onMounted(async () => {
  const { data } = await supabase
    .from('visits')
    .select('*, places(*)')
    .eq('id', route.params.id)
    .single()

  if (data) {
    visit.value = data
    form.value.date = data.date ?? ''
    form.value.category = data.category ?? 'merienda'
    form.value.score = data.score ?? 0
    form.value.ordered = data.ordered ?? ''
    form.value.price = data.price ?? ''
    form.value.notes = data.notes ?? ''
    form.value.come_back = data.come_back ?? ''
    form.value.special_moment = data.special_moment ?? false
    form.value.suggested_by = data.suggested_by ?? ''
    const existing = data.photo_urls?.length ? data.photo_urls : (data.photo_url ? [data.photo_url] : [])
    form.value.photo_urls = [...existing]
    photo.previews.value = [...existing]
    photo.files.value = new Array(existing.length).fill(null)
  }
  loading.value = false
})

async function handleSubmit() {
  errors.value = { general: '' }
  submitting.value = true
  try {
    try {
      form.value.photo_urls = await photo.upload(visit.value.place_id)
    } catch {
      errors.value.general = 'Error al subir la foto. Intentá de nuevo.'
      submitting.value = false
      return
    }

    const payload = {
      date: form.value.date,
      category: form.value.category,
      score: form.value.score,
      ordered: form.value.ordered || null,
      price: form.value.price || null,
      notes: form.value.notes || null,
      come_back: form.value.come_back || null,
      special_moment: form.value.special_moment,
      suggested_by: form.value.suggested_by || null,
      photo_urls: form.value.photo_urls,
    }

    const { error } = await supabase.from('visits').update(payload).eq('id', route.params.id)
    if (error) throw error

    showToast('Cambios guardados')
    router.push(`/visitas/${route.params.id}`)
  } catch {
    errors.value.general = 'Error al guardar. Intentá de nuevo.'
  } finally {
    submitting.value = false
  }
}
</script>
