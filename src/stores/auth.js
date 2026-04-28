import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../services/supabase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const initialized = ref(false)

  async function init() {
    if (initialized.value) return
    const { data } = await supabase.auth.getSession()
    user.value = data.session?.user ?? null
    supabase.auth.onAuthStateChange((_, session) => {
      user.value = session?.user ?? null
    })
    initialized.value = true
  }

  async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    user.value = data.user
  }

  async function logout() {
    user.value = null
    try {
      await supabase.auth.signOut()
    } catch {
      // Si signOut falla, el estado local ya está limpio
    }
  }

  return { user, init, login, logout }
})
