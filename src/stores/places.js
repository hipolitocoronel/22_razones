import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../services/supabase'

export const usePlacesStore = defineStore('places', () => {
  const places = ref([])
  const fetchError = ref('')

  async function fetchPlaces() {
    fetchError.value = ''
    const { data, error } = await supabase.from('places').select('*').order('name')
    if (error) {
      console.error('[places] fetchPlaces:', error)
      fetchError.value = error.message
    } else {
      places.value = data
    }
  }

  async function createPlace(payload) {
    const { data, error } = await supabase.from('places').insert(payload).select().single()
    if (error) throw error
    places.value.push(data)
    places.value.sort((a, b) => a.name.localeCompare(b.name))
    return data
  }

  async function markVisited(placeId) {
    const { error } = await supabase
      .from('places')
      .update({ status: 'visitado' })
      .eq('id', placeId)
    if (error) throw error
    const place = places.value.find(p => p.id === placeId)
    if (place) place.status = 'visitado'
  }

  async function updatePlace(placeId, data) {
    const { error } = await supabase.from('places').update(data).eq('id', placeId)
    if (error) throw error
    const place = places.value.find(p => p.id === placeId)
    if (place) Object.assign(place, data)
  }

  async function toggleVote(placeId, field) {
    const place = places.value.find(p => p.id === placeId)
    if (!place) return
    const newValue = !place[field]
    place[field] = newValue
    const { error } = await supabase.from('places').update({ [field]: newValue }).eq('id', placeId)
    if (error) place[field] = !newValue
  }

  async function deletePlace(placeId) {
    const { error } = await supabase.from('places').delete().eq('id', placeId)
    if (error) throw error
    places.value = places.value.filter(p => p.id !== placeId)
  }

  return { places, fetchError, fetchPlaces, createPlace, markVisited, toggleVote, updatePlace, deletePlace }
})
