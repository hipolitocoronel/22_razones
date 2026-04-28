import { ref, onUnmounted } from 'vue'
import { supabase } from '../services/supabase'

const BUCKET = 'visit-photos'
const MAX_PHOTOS = 5

export function useVisitPhoto(initialUrls = []) {
  const files = ref(new Array(initialUrls.length).fill(null))
  const previews = ref([...initialUrls])

  function revokeAll() {
    for (const p of previews.value) {
      if (p?.startsWith('blob:')) URL.revokeObjectURL(p)
    }
  }

  function onSelect(e) {
    const selected = Array.from(e.target.files || [])
    if (!selected.length) return
    const room = MAX_PHOTOS - previews.value.length
    const toAdd = selected.slice(0, Math.max(0, room))
    for (const f of toAdd) {
      files.value.push(f)
      previews.value.push(URL.createObjectURL(f))
    }
    e.target.value = ''
  }

  function removeAt(i) {
    const p = previews.value[i]
    if (p?.startsWith('blob:')) URL.revokeObjectURL(p)
    previews.value.splice(i, 1)
    files.value.splice(i, 1)
  }

  async function upload(placeId) {
    const result = []
    for (let i = 0; i < previews.value.length; i++) {
      const preview = previews.value[i]
      const file = files.value[i]
      if (file && preview?.startsWith('blob:')) {
        const ext = file.name.split('.').pop()
        const path = `${placeId}/${Date.now()}_${i}.${ext}`
        const { error } = await supabase.storage.from(BUCKET).upload(path, file)
        if (error) throw error
        result.push(supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl)
      } else if (preview) {
        result.push(preview)
      }
    }
    return result
  }

  onUnmounted(revokeAll)

  return { files, previews, onSelect, removeAt, upload }
}
