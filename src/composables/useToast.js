import { reactive } from 'vue'

const state = reactive({ visible: false, message: '', type: 'success', id: 0 })
let timer = null

export function useToast() {
  function show(message, type = 'success', duration = 3000) {
    clearTimeout(timer)
    state.id++
    state.message = message
    state.type = type
    state.visible = true
    timer = setTimeout(() => { state.visible = false }, duration)
  }

  function hide() {
    clearTimeout(timer)
    state.visible = false
  }

  return { state, show, hide }
}
