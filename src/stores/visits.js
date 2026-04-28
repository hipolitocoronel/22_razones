import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../services/supabase'

export const useVisitsStore = defineStore('visits', () => {
  const visits = ref([])
  const loading = ref(false)

  async function fetchVisits() {
    loading.value = true
    const { data, error } = await supabase
      .from('visits')
      .select('*, places(*)')
      .order('date', { ascending: false })
    if (!error) visits.value = data
    loading.value = false
  }

  async function createVisit(payload) {
    const { data, error } = await supabase.from('visits').insert(payload).select().single()
    if (error) throw error
    visits.value.unshift(data)
    return data
  }

  return { visits, loading, fetchVisits, createVisit }
})
